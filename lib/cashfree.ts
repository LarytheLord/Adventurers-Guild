import crypto from 'crypto';

// Singleton Cashfree client (we'll use direct fetch for now)
let cashfreeAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

// Environment variables
const getEnv = () => {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const mode = process.env.CASHFREE_MODE || 'sandbox'; // sandbox or production
  
  if (!clientId || !clientSecret) {
    throw new Error('CASHFREE_CLIENT_ID/CASHFREE_CLIENT_SECRET not configured');
  }
  
  return { clientId, clientSecret, mode };
};

const getBaseUrl = (mode: string) => {
  if (mode === 'production') {
    return 'https://api.cashfree.com/pg';
  } else {
    return 'https://sandbox.cashfree.com/pg';
  }
};

const getPayoutBaseUrl = (mode: string) => {
  if (mode === 'production') {
    return 'https://payout-api.cashfree.com';
  } else {
    return 'https://payout-gamma.cashfree.com';
  }
};

// Get access token for payouts API
async function getPayoutAccessToken(): Promise<string> {
  const { clientId, clientSecret, mode } = getEnv();
  
  // Return cached token if still valid
  if (cashfreeAccessToken && Date.now() < tokenExpiryTime) {
    return cashfreeAccessToken;
  }
  
  const response = await fetch(`${getPayoutBaseUrl(mode)}/payout/v1/authorize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': clientId,
      'X-Client-Secret': clientSecret,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get Cashfree payout token: ${response.statusText}`);
  }
  
  const data = await response.json();
  cashfreeAccessToken = data.token;
  // Set expiry to 5 minutes before actual expiry to be safe
  tokenExpiryTime = Date.now() + (data.expiry * 1000) - 300000;
  
  return cashfreeAccessToken as string;
}

/**
 * Verify Cashfree payment signature after client-side checkout.
 * Returns true if signature is valid.
 */
export function verifyCashfreeSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  if (!secret) throw new Error('CASHFREE_CLIENT_SECRET not configured');

  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return expectedSignature === params.signature;
}

/**
 * Create a Cashfree Order for a quest payment.
 * Company pays quest reward + platform fee in INR.
 */
export async function createCashfreeOrder(params: {
  amount: number; // in INR (not paise)
  currency: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  orderId: string;
  orderNote?: string;
  orderAmount?: number; // optional, overrides amount
}): Promise<{
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  orderNote?: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  orderStatus: string;
  paymentLink: string;
  paymentSessionId: string;
}> {
  const { clientId, clientSecret, mode } = getEnv();
  const orderAmount = params.orderAmount ?? params.amount;
  
  const response = await fetch(`${getBaseUrl(mode)}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': clientId,
      'X-Client-Secret': clientSecret,
      'X-Api-Version': '2025-01-01',
    },
    body: JSON.stringify({
      orderAmount,
      orderCurrency: params.currency.toUpperCase(),
      orderId: params.orderId,
      customerDetails: {
        customerName: params.customerDetails.name,
        customerEmail: params.customerDetails.email,
        customerPhone: params.customerDetails.phone,
      },
      orderNote: params.orderNote || `Adventurers Guild Quest Payment`,
      orderTags: {
        questId: params.orderId.split('_')[1] || 'unknown',
        source: 'adventurers_guild',
      },
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create Cashfree order: ${errorData.message || response.statusText}`);
  }
  
  const data = await response.json();
  return {
    orderId: data.orderId,
    orderAmount: data.orderAmount,
    orderCurrency: data.orderCurrency,
    orderNote: data.orderNote,
    customerDetails: {
      name: data.customerDetails.customerName,
      email: data.customerDetails.customerEmail,
      phone: data.customerDetails.customerPhone,
    },
    orderStatus: data.orderStatus,
    paymentLink: data.paymentLink,
    paymentSessionId: data.paymentSessionId,
  };
}

/**
 * Fetch a Cashfree payment by ID.
 */
export async function fetchCashfreePayment(
  paymentId: string
): Promise<{
  id: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
  orderId: string;
}> {
  const { clientId, clientSecret, mode } = getEnv();
  
  const response = await fetch(`${getBaseUrl(mode)}/orders/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': clientId,
      'X-Client-Secret': clientSecret,
      'X-Api-Version': '2025-01-01',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to fetch Cashfree payment: ${errorData.message || response.statusText}`);
  }
  
  const data = await response.json();
  return {
    id: data.paymentId ?? data.orderId,
    status: data.orderStatus,
    amount: data.orderAmount,
    currency: data.orderCurrency,
    method: data.paymentMethod || 'unknown',
    orderId: data.orderId,
  };
}

/**
 * Create a Cashfree payout to an adventurer's bank account.
 * Requires bank account details (beneficiary).
 */
export async function createCashfreePayout(params: {
  beneficiaryId: string; // Cashfree beneficiary ID
  amount: number; // in INR (not paise)
  currency: string;
  transferId: string;
  remarks?: string;
}): Promise<{
  id: string;
  status: string;
  subCode: string;
  message: string;
  transferId: string;
  uttr: string;
  acknowledged: number;
}> {
  const accessToken = await getPayoutAccessToken();
  const { mode } = getEnv();
  
  const response = await fetch(`${getPayoutBaseUrl(mode)}/payout/v1/requestTransfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      beneId: params.beneficiaryId,
      amount: params.amount.toString(),
      transferId: params.transferId,
      remarks: params.remarks || `Quest reward payout`,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create Cashfree payout: ${errorData.message || response.statusText}`);
  }
  
  const data = await response.json();
  return {
    id: data.id || data.transferId,
    status: data.status,
    subCode: data.subCode || '',
    message: data.message || '',
    transferId: data.transferId || params.transferId,
    uttr: data.utr || '',
    acknowledged: data.acknowledged ? 1 : 0,
  };
}

/**
 * Check if Cashfree is configured.
 */
export function isCashfreeConfigured(): boolean {
  return !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
}

/**
 * Create a beneficiary in Cashfree for payouts.
 * This should be called when an adventurer links their bank account.
 */
export async function createCashfreeBeneficiary(params: {
  name: string;
  email: string;
  phone: string;
  bankAccount: string;
  ifsc: string;
  address1: string;
  city: string;
  state: string;
  pincode: string;
  beneficiaryId: string; // External ID (e.g., adventurer userId)
}): Promise<{
  id: string;
  status: string;
  subCode: string;
  message: string;
  beneId: string;
  beneficiaryId: string;
}> {
  const accessToken = await getPayoutAccessToken();
  const { mode } = getEnv();
  
  const response = await fetch(`${getPayoutBaseUrl(mode)}/payout/v1/addBeneficiary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      beneId: params.beneficiaryId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      bankAccount: params.bankAccount,
      ifsc: params.ifsc,
      address1: params.address1,
      city: params.city,
      state: params.state,
      pincode: params.pincode,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to add Cashfree beneficiary: ${errorData.message || response.statusText}`);
  }
  
  const data = await response.json();
  return {
    id: data.beneId,
    status: data.status,
    subCode: data.subCode || '',
    message: data.message || '',
    beneId: data.beneId,
    beneficiaryId: params.beneficiaryId,
  };
}

/**
 * Get transfer status from Cashfree.
 */
export async function getCashfreeTransferStatus(params: {
  transferId?: string;
  referenceId?: string;
}): Promise<{
  status: string;
  subCode: string;
  message: string;
  referenceId?: string;
  uttr?: string;
  acknowledged?: number;
  challanNumber?: string;
  arnNumber?: string;
}> {
  const accessToken = await getPayoutAccessToken();
  const { mode } = getEnv();
  
  const queryParams = new URLSearchParams();
  if (params.transferId) queryParams.append('transferId', params.transferId);
  if (params.referenceId) queryParams.append('referenceId', params.referenceId);
  
  const response = await fetch(`${getPayoutBaseUrl(mode)}/payout/v1/getTransferStatus?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get Cashfree transfer status: ${errorData.message || response.statusText}`);
  }
  
  const data = await response.json();
  return {
    status: data.status,
    subCode: data.subCode || '',
    message: data.message || '',
    referenceId: data.referenceId,
    uttr: data.utr,
    acknowledged: data.acknowledged,
    challanNumber: data.challanNumber,
    arnNumber: data.arnNumber,
  };
}