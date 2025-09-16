'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Upload, AlertCircle } from 'lucide-react'

interface CompanyVerificationStepProps {
  onComplete: (data: any) => void
  onSkip: () => void
  canSkip: boolean
  isLoading: boolean
  initialData?: any
}

export default function CompanyVerificationStep({ 
  onComplete, 
  onSkip, 
  canSkip, 
  isLoading, 
  initialData 
}: CompanyVerificationStepProps) {
  const [formData, setFormData] = useState({
    businessLicense: initialData?.businessLicense || '',
    taxId: initialData?.taxId || '',
    verificationDocuments: initialData?.verificationDocuments || []
  })

  const handleSubmit = () => {
    onComplete({ verification: formData })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Company Verification</h3>
        <p className="text-muted-foreground">
          Help us verify your company to enable quest posting and build trust with developers.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Verification Process</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Our team will review your documents within 1-2 business days. 
                  You'll be notified once verification is complete.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessLicense">Business License Number</Label>
            <Input
              id="businessLicense"
              value={formData.businessLicense}
              onChange={(e) => setFormData(prev => ({ ...prev, businessLicense: e.target.value }))}
              placeholder="Enter your business license number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / EIN</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
              placeholder="Enter your tax identification number"
            />
          </div>

          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Upload business documents for verification
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Accepted: Business license, articles of incorporation, tax documents
              </p>
              <Button variant="outline" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {canSkip && (
          <Button variant="outline" onClick={onSkip} disabled={isLoading}>
            Skip for now
          </Button>
        )}
        
        <div className="ml-auto">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        </div>
      </div>
    </div>
  )
}
