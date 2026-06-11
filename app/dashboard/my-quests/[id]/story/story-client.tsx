"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStandupModal } from "@/components/daily-standup-modal";
import { Badge } from "@/components/ui/badge";

export function StoryClient({ assignment, quest, updates }: { assignment: any; quest: any; updates: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <Link href="/dashboard/my-quests" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-3 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to My Quests
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{quest.title}</h1>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
              {assignment.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Update History
          </p>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm shrink-0"
        >
          <FileText className="h-4 w-4 mr-2" />
          Submit Next Update
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {updates.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No updates yet</h3>
            <p className="text-sm text-slate-500 mb-4">You haven&apos;t submitted any daily standups for this quest.</p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              Submit Your First Update
            </Button>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
            {updates.map((update, idx) => (
              <div key={update.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[35px] top-1 h-5 w-5 rounded-full bg-orange-100 border-2 border-orange-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                </div>
                
                <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3 py-4">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span className="text-slate-800">Day {updates.length - idx}</span>
                      <span className="text-xs font-normal text-slate-500">
                        {new Date(update.createdAt).toLocaleString(undefined, { 
                          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-5">
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Yesterday
                      </h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{update.yesterday}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" /> Today
                      </h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{update.today}</p>
                    </div>

                    {update.blockers && (
                      <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                        <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Blockers
                        </h4>
                        <p className="text-sm text-rose-800 whitespace-pre-wrap">{update.blockers}</p>
                      </div>
                    )}

                    {update.evidenceUrl && (
                      <div className="pt-2 border-t border-slate-100 mt-2">
                        <a 
                          href={update.evidenceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline mt-2"
                        >
                          View Work Evidence ↗
                        </a>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <DailyStandupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        assignmentId={assignment.id} 
        onSuccess={handleSuccess} 
        tasks={quest.tasks}
        completedTasks={assignment.completedTasks}
        questTitle={quest.title}
        xpReward={quest.xpReward}
      />
    </div>
  );
}
