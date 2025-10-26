// components/A11ySkipLink.tsx
'use client';

import { useEffect } from 'react';

export default function A11ySkipLink() {
  useEffect(() => {
    // Function to handle skip link focus
    const handleSkipLink = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        // Find the skip link
        const skipLink = document.getElementById('skip-to-content');
        if (skipLink) {
          // Remove hidden styles temporarily to make it visible
          skipLink.style.position = 'static';
          skipLink.style.clip = 'auto';
          skipLink.style.width = 'auto';
          skipLink.style.height = 'auto';
          skipLink.style.overflow = 'visible';
          skipLink.style.whiteSpace = 'nowrap';
        }
      }
    };

    // Add event listener for when tab key is pressed
    document.addEventListener('keydown', handleSkipLink);

    return () => {
      document.removeEventListener('keydown', handleSkipLink);
    };
  }, []);

  return (
    <a 
      id="skip-to-content" 
      href="#main-content" 
      className="skip-to-content"
    >
      Skip to main content
    </a>
  );
}