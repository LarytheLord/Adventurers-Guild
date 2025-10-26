#!/bin/bash

# Deployment script for The Adventurers Guild
# This script helps automate the deployment process to production

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting deployment for The Adventurers Guild..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Check if environment variables are set
required_vars=(
  "DATABASE_URL"
  "NEXT_PUBLIC_SUPABASE_URL" 
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "SMTP_HOST"
  "SMTP_PORT"
  "SMTP_USER" 
  "SMTP_PASS"
  "ADMIN_EMAIL"
)

echo "🔍 Checking required environment variables..."
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var is not set"
    exit 1
  fi
done

echo "✅ All required environment variables are set"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
if npm run test:unit -- --ci --maxWorkers=2; then
  echo "✅ Unit tests passed"
else
  echo "❌ Unit tests failed"
  exit 1
fi

if npm run test:integration -- --ci --maxWorkers=2; then
  echo "✅ Integration tests passed"
else
  echo "❌ Integration tests failed"
  exit 1
fi

# Run linting
echo "🧹 Running linting..."
if npm run lint; then
  echo "✅ Linting passed"
else
  echo "❌ Linting failed"
  exit 1
fi

# Run type checking
echo "🏷️  Running type checking..."
if npx tsc --noEmit; then
  echo "✅ Type checking passed"
else
  echo "❌ Type checking failed"
  exit 1
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Vercel (if VERCEL_TOKEN is set)
if [ ! -z "${VERCEL_TOKEN}" ]; then
  echo "☁️  Deploying to Vercel..."
  
  # Install Vercel CLI if not already installed
  if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
  fi
  
  # Deploy
  vercel --prod --token=${VERCEL_TOKEN}
  
  echo "✅ Application deployed successfully!"
else
  echo "⚠️  VERCEL_TOKEN not set. Skipping deployment to Vercel."
  echo "To deploy, run: npx vercel --prod --token=your_token"
fi

echo "🎉 Deployment process completed!"