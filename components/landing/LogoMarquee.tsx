'use client';

const tags = [
    { label: "GSSoC", color: "bg-orange-50 text-orange-600 border-orange-200" },
    { label: "AI Grants", color: "bg-violet-50 text-violet-600 border-violet-200" },
    { label: "Open Source", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { label: "Hacktoberfest", color: "bg-blue-50 text-blue-600 border-blue-200" },
    { label: "GSSoC", color: "bg-orange-50 text-orange-600 border-orange-200" },
    { label: "AI Grants", color: "bg-violet-50 text-violet-600 border-violet-200" },
    { label: "Open Source", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { label: "Hacktoberfest", color: "bg-blue-50 text-blue-600 border-blue-200" },
];

export default function LogoMarquee() {
    return (
        <section className="py-8 border-y border-slate-100 overflow-hidden">
            <div className="relative flex overflow-x-hidden">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

                <div className="animate-scroll flex whitespace-nowrap items-center">
                    {tags.map((tag, index) => (
                        <div key={index} className={`mx-4 text-xs font-semibold px-4 py-1.5 rounded-full border ${tag.color} select-none`}>
                            {tag.label}
                        </div>
                    ))}
                </div>
                <div className="absolute top-0 animate-scroll flex whitespace-nowrap items-center" aria-hidden="true">
                    {tags.map((tag, index) => (
                        <div key={index} className={`mx-4 text-xs font-semibold px-4 py-1.5 rounded-full border ${tag.color} select-none`}>
                            {tag.label}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
