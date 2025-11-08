#!/bin/bash

# Deployment script for Adventurers Guild
# This script automates the deployment process

set -e # Exit on any error

echo "Starting deployment process..."

# Check if we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Warning: You are not on the main branch. Proceeding anyway..."
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run type checking
echo "Running type checking..."
npm run type-check

# Run linting
echo "Running linting..."
npm run lint

# Run tests
echo "Running tests..."
npm run test

# Build the application
echo "Building application..."
npm run build

# Deploy to Vercel (if VERCEL_TOKEN is available)
if [ -n "$VERCEL_TOKEN" ]; then
  echo "Deploying to Vercel..."
  npx vercel --prod
else
  echo "VERCEL_TOKEN not found. Skipping Vercel deployment."
fi

echo "Deployment process completed successfully!"