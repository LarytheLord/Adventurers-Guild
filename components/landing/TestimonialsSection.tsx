'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'S-Rank Adventurer',
    avatar: 'https://api.dicebear.com/7.x/avatars/initials/svg?seed=Priya&backgroundColor=ff6b35',
    rating: 5,
    text: 'Completed 28 quests, earned ₹1.2L in 3 months. The rank progression kept me motivated to ship better code every time.',
    metric: '₹1.2L earned',
    metricLabel: 'Total earned',
  },
  {
    name: 'Raj Patel',
    role: 'A-Rank Adventurer',
    avatar: 'https://api.dicebear.com/7.x/avatars/initials/svg?seed=Raj&backgroundColor=3b82f6',
    rating: 5,
    text: 'Went from F-Rank to A-Rank in 4 months. The real client feedback helped me understand what actually matters in production.',
    metric: '4 months',
    metricLabel: 'F → A rank',
  },
  {
    name: 'Ananya Desai',
    role: 'B-Rank Adventurer',
    avatar: 'https://api.dicebear.com/7.x/avatars/initials/svg?seed=Ananya&backgroundColor=8b5cf6',
    rating: 5,
    text: 'First real project for a NGO. The XP system made me feel actual progress, not just another tutorial that goes nowhere.',
    metric: '12 quests',
    metricLabel: 'Completed',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-950 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.08),transparent_50%)]" />
      
      <div className="container relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-orange-500/80">
            Trusted by Adventurers
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
            Real developers, real earnings
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Don't take our word for it. Here's what adventurers say after shipping real work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-orange-500/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= testimonial.rating ? 'fill-orange-400 text-orange-400' : 'text-slate-600'}
                      />
                    ))}
                  </div>
                  
                  <Quote size={20} className="text-orange-500/30 mb-3" />
                  
                  <p className="mb-6 text-sm leading-relaxed text-slate-300">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-700">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-slate-800 text-xs">{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{testimonial.name}</p>
                        <p className="text-xs text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-400">{testimonial.metric}</p>
                      <p className="text-[10px] text-slate-500">{testimonial.metricLabel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-400">
            Join <span className="text-white font-medium">47+ adventurers</span> who've already shipped real work
          </p>
        </motion.div>
      </div>
    </section>
  );
}
