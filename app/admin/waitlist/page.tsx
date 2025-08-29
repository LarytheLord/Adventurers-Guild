'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'

export default function WaitlistAdminPage() {
  const [waitlistEntries, setWaitlistEntries] = useState<Array<{id: string, name?: string, email: string, created_at: string}>>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchWaitlistEntries()
  }, [fetchWaitlistEntries])

  const fetchWaitlistEntries = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWaitlistEntries(data || [])
    } catch (error) {
      console.error('Error fetching waitlist entries:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch waitlist entries',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const exportToCSV = async () => {
    try {
      setExporting(true)
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Create CSV content
      const headers = ['Name', 'Email', 'Date']
      const rows = data.map(entry => [
        entry.name || '',
        entry.email,
        new Date(entry.created_at).toLocaleString()
      ])

      let csvContent = headers.join(',') + '\n'
      rows.forEach(row => {
        csvContent += row.map(field => `"${field}"`).join(',') + '\n'
      })

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'waitlist_entries.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Success',
        description: 'Waitlist entries exported successfully'
      })
    } catch (error) {
      console.error('Error exporting waitlist entries:', error)
      toast({
        title: 'Error',
        description: 'Failed to export waitlist entries',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Waitlist Entries</CardTitle>
          <Button 
            onClick={exportToCSV} 
            disabled={exporting || loading}
            variant="outline"
          >
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : waitlistEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No waitlist entries found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlistEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.name || 'Not provided'}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            Total entries: {waitlistEntries.length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}