'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/AuthContext"
import { Database } from "@/types/supabase"
import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/sonner";
import { toast } from 'sonner';

type Quest = Database['public']['Tables']['quests']['Row'];

export default function AdminDashboard() {
  
  const { user } = useAuth()
  const [quests, setQuests] = useState<Quest[]>([])

  useEffect(() => {
    const fetchQuests = async () => {
      const response = await fetch("/api/quests?status=draft")
      const data = await response.json()
      setQuests(data)
    }

    fetchQuests()
  }, [])

  const handleApprove = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/update/${questId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: 'active' }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to approve quest")
      }

      setQuests(quests.filter(q => q.id !== questId))
      toast({ title: "Success", description: "Quest approved successfully." });
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to approve quest. Please try again.", variant: "destructive" });
    }
  }

  const handleReject = async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/update/${questId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: 'rejected' }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to reject quest")
      }

      setQuests(quests.filter(q => q.id !== questId))
      toast({ title: "Success", description: "Quest rejected successfully." });
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to reject quest. Please try again.", variant: "destructive" });
    }
  }

  if (!user || user.role !== 'admin') {
    return <div>Access Denied</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button>Logout</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Waitlist Card */}
        <Card>
          <CardHeader>
            <CardTitle>Waitlist Management</CardTitle>
            <CardDescription>View and manage waitlist entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p>View all users who have signed up for the waitlist</p>
              <Link href="/admin/waitlist">
                <Button>View Waitlist</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending Quests Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Quests</CardTitle>
            <CardDescription>Review and approve new quests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quests.map((quest) => (
                  <TableRow key={quest.id}>
                    <TableCell>{quest.title}</TableCell>
                    <TableCell>{quest.description}</TableCell>
                    <TableCell>${quest.budget}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleApprove(quest.id)}>Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(quest.id)}>Reject</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}