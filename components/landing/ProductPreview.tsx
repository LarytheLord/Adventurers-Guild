'use client';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Zap, ShieldCheck } from 'lucide-react';

export default function ProductPreview() {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container px-6 mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-500 uppercase mb-3">
              Inside the Guild
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-slate-900">
              Tools built for modern engineering
            </h2>
          </div>
          <p className="text-slate-600 max-w-md lg:text-right">
            A seamless experience for both developers and companies. Transparent progress, vetted skills, and guaranteed quality.
          </p>
        </div>

        <Tabs defaultValue="quests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-200/50 p-1 rounded-xl">
            <TabsTrigger value="quests" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Target size={16} className="mr-2" />
              Quest Board
            </TabsTrigger>
            <TabsTrigger value="skilltree" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Zap size={16} className="mr-2" />
              Skill Tree
            </TabsTrigger>
            <TabsTrigger value="verify" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ShieldCheck size={16} className="mr-2" />
              Verifiable Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quests">
            <Card className="border-slate-200 overflow-hidden shadow-xl">
              <CardContent className="p-0 aspect-[16/9] bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent" />
                <div className="absolute top-12 left-12 right-12 bottom-0 bg-slate-950 rounded-t-2xl border-x border-t border-slate-800 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-4 w-32 bg-slate-800 rounded" />
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-slate-800 rounded-lg" />
                      <div className="h-8 w-8 bg-orange-500 rounded-lg" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-800 rounded-lg" />
                          <div>
                            <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
                            <div className="h-3 w-32 bg-slate-800 rounded" />
                          </div>
                        </div>
                        <div className="h-4 w-20 bg-slate-800 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skilltree">
            <Card className="border-slate-200 overflow-hidden shadow-xl">
              <CardContent className="p-12 aspect-[16/9] bg-slate-900 flex items-center justify-center">
                 <div className="relative w-full max-w-lg">
                    <div className="absolute inset-0 bg-orange-500/20 blur-[100px]" />
                    <div className="relative grid grid-cols-3 gap-8">
                       {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                               <Zap size={24} className="text-slate-500" />
                            </div>
                            <div className="h-2 w-16 bg-slate-800 rounded-full" />
                         </div>
                       ))}
                    </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verify">
            <Card className="border-slate-200 overflow-hidden shadow-xl">
              <CardContent className="p-12 aspect-[16/9] bg-slate-900 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 text-slate-900 text-left">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-orange-500" />
                    <div>
                      <h4 className="text-2xl font-bold">Alex Rivers</h4>
                      <p className="text-orange-500 font-semibold text-sm uppercase">S-Rank Adventurer</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-sm">Completed Quests</span>
                      <span className="font-bold">142</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500 text-sm">Quality Score</span>
                      <span className="font-bold text-emerald-600">9.8/10</span>
                    </div>
                  </div>
                  <div className="mt-8 h-12 w-full bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    Verify On-Chain
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
