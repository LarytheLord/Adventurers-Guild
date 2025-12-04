'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code2, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

            {/* Gradient Glow */}
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="container px-4 mx-auto py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                                <Code2 className="w-5 h-5" />
                            </div>
                            <span className="text-white">Adventurers Guild</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed">
                            The premier platform for developers to find real-world projects, earn money, and level up their careers.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Github className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Platform</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <FooterLink href="/quests">Browse Quests</FooterLink>
                            <FooterLink href="/companies">For Companies</FooterLink>
                            <FooterLink href="/pricing">Pricing</FooterLink>
                            <FooterLink href="/leaderboard">Leaderboard</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-6">Resources</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <FooterLink href="/blog">Blog</FooterLink>
                            <FooterLink href="/docs">Documentation</FooterLink>
                            <FooterLink href="/community">Community</FooterLink>
                            <FooterLink href="/help">Help Center</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="space-y-6">
                        <h3 className="font-bold text-white">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground">
                            Subscribe to our newsletter for the latest quests and guild news.
                        </p>
                        <form className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border-white/10 focus-visible:ring-purple-500/50"
                            />
                            <Button size="icon" className="bg-white text-black hover:bg-gray-200">
                                <Mail className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© 2025 The Adventurers Guild. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300"
        >
            {icon}
        </Link>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="hover:text-purple-400 transition-colors">
                {children}
            </Link>
        </li>
    );
}
