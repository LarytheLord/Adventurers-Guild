'use client';

import React from 'react';
import Hero from "@/components/ui/animated-shader-hero";

// Demo Component showing how to use the Hero
const HeroDemo: React.FC = () => {
  const handlePrimaryClick = () => undefined;
  const handleSecondaryClick = () => undefined;

  return (
    <div className="w-full">
      <Hero
        trustBadge={{
          text: "Trusted by forward-thinking teams.",
          icons: ["✨"]
        }}
        headline={{
          line1: "Launch Your",
          line2: "Workflow Into Orbit"
        }}
        subtitle="Supercharge productivity with AI-powered automation and integrations built for the next generation of teams — fast, seamless, and limitless."
        buttons={{
          primary: {
            text: "Get Started for Free",
            onClick: handlePrimaryClick
          },
          secondary: {
            text: "Explore Features",
            onClick: handleSecondaryClick
          }
        }}
      />
      
      {/* Additional content below hero */}
      <div className="bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            How to Use the Hero Component
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <pre className="text-sm text-gray-600 overflow-x-auto">
{`<Hero
  trustBadge={{
    text: "Your trust badge text",
    icons: ["🚀", "⭐", "✨"] // optional
  }}
  headline={{
    line1: "Your First Line",
    line2: "Your Second Line"
  }}
  subtitle="Your compelling subtitle text goes here..."
  buttons={{
    primary: {
      text: "Primary CTA",
      onClick: handlePrimaryClick
    },
    secondary: {
      text: "Secondary CTA", 
      onClick: handleSecondaryClick
    }
  }}
  className="custom-classes" // optional
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDemo;
