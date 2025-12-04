'use client';

const logos = [
    "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Uber", "Airbnb", "Stripe", "Spotify", "Shopify"
];

export default function LogoMarquee() {
    return (
        <section className="py-12 border-y border-white/5 bg-white/[0.02] overflow-hidden relative">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <div className="container px-4 mx-auto mb-8 text-center">
                <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
                    Trusted by Engineering Teams At
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-scroll flex whitespace-nowrap">
                    {logos.map((logo, index) => (
                        <div key={index} className="mx-12 text-2xl font-bold text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors cursor-default">
                            {logo}
                        </div>
                    ))}
                </div>
                <div className="absolute top-0 animate-scroll flex whitespace-nowrap" aria-hidden="true">
                    {logos.map((logo, index) => (
                        <div key={index} className="mx-12 text-2xl font-bold text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors cursor-default">
                            {logo}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
