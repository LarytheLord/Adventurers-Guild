'use client';

import Link from 'next/link';
import { Code2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-slate-100">
            <div className="container px-6 mx-auto max-w-6xl py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight mb-4">
                            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white">
                                <Code2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-slate-900">Adventurers Guild</span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            Real-world coding quests for developers who want to learn, earn, and level up.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Platform</h3>
                        <ul className="space-y-2.5">
                            <FooterLink href="/dashboard/quests">Browse Quests</FooterLink>
                            <FooterLink href="/register-company">For Companies</FooterLink>
                            <FooterLink href="/dashboard/leaderboard">Leaderboard</FooterLink>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Resources</h3>
                        <ul className="space-y-2.5">
                            <FooterLink href="#">Documentation</FooterLink>
                            <FooterLink href="#">Community</FooterLink>
                            <FooterLink href="#">Help Center</FooterLink>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Legal</h3>
                        <ul className="space-y-2.5">
                            <FooterLink href="/privacy">Privacy</FooterLink>
                            <FooterLink href="/terms">Terms</FooterLink>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} The Adventurers Guild
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                {children}
            </Link>
        </li>
    );
}
