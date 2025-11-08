'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ResponsiveImageProps extends Omit<ImageProps, 'loading'> {
  /**
   * Alternative text for accessibility
   */
  alt: string;
  
  /**
   * Placeholder image to show while loading
   */
  placeholderSrc?: string;
  
  /**
   * Loading strategy (lazy, eager)
   */
  loading?: 'lazy' | 'eager';
  
  /**
   * Image quality (1-100)
   */
  quality?: number;
  
  /**
   * Aspect ratio for responsive sizing
   */
  aspectRatio?: string;
  
  /**
   * Fallback for when image fails to load
   */
  fallbackSrc?: string;
}

/**
 * Optimized image component with responsive capabilities
 */
export function ResponsiveImage({
  src,
  alt,
  placeholderSrc,
  loading = 'lazy',
  quality = 75,
  aspectRatio = '16/9',
  fallbackSrc,
  ...props
}: ResponsiveImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Handle image loading errors
  const handleImageError = () => {
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Reset image state when src changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setImageSrc(src);
  }, [src]);

  // Calculate aspect ratio classes
  const aspectRatioClasses = {
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '2/1': 'aspect-[2/1]',
  }[aspectRatio] || 'aspect-video';

  return (
    <div className={`relative overflow-hidden ${aspectRatioClasses}`}>
      {imageError ? (
        <div className="flex items-center justify-center w-full h-full bg-muted">
          <span className="text-sm text-muted-foreground">Image unavailable</span>
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          loading={loading}
          quality={quality}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          {...props}
        />
      )}
      
      {/* Loading placeholder */}
      {!imageLoaded && !imageError && placeholderSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={placeholderSrc}
            alt=""
            fill
            className="object-cover opacity-50"
            priority={loading === 'eager'}
          />
        </div>
      )}
    </div>
  );
}

export default ResponsiveImage;