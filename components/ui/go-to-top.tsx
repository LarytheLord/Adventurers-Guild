'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import { Button } from './button';

export function GoToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const hiddenRoutePrefixes = ['/dashboard', '/admin', '/login', '/register', '/register-company', '/forgot-password', '/reset-password'];
  const shouldHide = !!pathname && hiddenRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  useEffect(() => {
    if (shouldHide) {
      setIsVisible(false);
      return;
    }

    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [shouldHide]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (shouldHide) return null;

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-in slide-in-from-bottom-2 sm:bottom-8 sm:right-8 sm:w-12 sm:h-12"
          aria-label="Go to top"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
