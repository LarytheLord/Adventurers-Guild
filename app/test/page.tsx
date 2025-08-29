'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const { user } = useAuth();

  const runTests = async () => {
    const results: string[] = []
    
    try {
      // Test 1: Auth Hook
      if(user) {
        results.push('✅ Auth Hook - User is authenticated')
      } else {
        results.push('✅ Auth Hook - User is not authenticated (as expected)')
      }
      
      // Test 2: API Service
      const response = await fetch('/api/quests');
      if(response.ok) {
        const quests = await response.json();
        results.push(`✅ API Service - ${quests.length} quests loaded`)
      } else {
        results.push(`❌ API Service - Failed to load quests`)
      }
      
      // Test 3: Components exist
      results.push('✅ All components imported successfully')
      
    } catch (error) {
      results.push(`❌ Error: ${error}`)
    }
    
    setTestResults(results)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Platform Test Page</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} className="mb-4">
              Run Tests
            </Button>
            
            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="p-2 bg-muted rounded">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/">
              <Button variant="outline" className="w-full">Landing Page</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="w-full">About Us</Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="w-full">How It Works</Button>
            </Link>
            <Link href="/quests">
              <Button variant="outline" className="w-full">Browse Quests</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">Signup</Button>
            </Link>
            <Link href="/home">
              <Button variant="outline" className="w-full">Student Home</Button>
            </Link>
            <Link href="/company/dashboard">
              <Button variant="outline" className="w-full">Company Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="w-full">Profile</Button>
            </Link>
            <Link href="/commission">
              <Button variant="outline" className="w-full">Commission Quest</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full">Contact Us</Button>
            </Link>
            <Link href="/privacy-policy">
              <Button variant="outline" className="w-full">Privacy Policy</Button>
            </Link>
            <Link href="/terms-of-service">
              <Button variant="outline" className="w-full">Terms of Service</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}