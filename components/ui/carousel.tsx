"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <div className="group w-full"> {/* wrapper to control visibility */}
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center h-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity",
        className
      )}
      {...props}
    >
      {/* Track */}
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-secondary dark:bg-neutral-700 transition-colors">
        <SliderPrimitive.Range className="absolute h-full bg-primary dark:bg-blue-400 transition-colors" />
      </SliderPrimitive.Track>

      {/* Thumb */}
      <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full bg-primary dark:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
    </SliderPrimitive.Root>
  </div>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
