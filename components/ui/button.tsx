import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button — inspired by Linear, Vercel, Stripe.
 * No gradients. No scale-on-hover. No shadow on the button itself.
 * Subtle press effect. Clear focus ring. 6px radius (not 12-16px).
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "rounded-md text-[13px] font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary — Linear style. Solid accent, dark text on it, no shadow.
        default:
          "bg-[#F97316] text-[#0A0A0A] hover:bg-[#FB923C]",
        // Dark — Vercel style. Black bg, white text, no shadow.
        dark:
          "bg-[#0A0A0A] text-white hover:bg-[#1F1F1F]",
        // Secondary — Stripe style. White with border + subtle shadow.
        secondary:
          "bg-white text-slate-900 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-slate-50 hover:border-slate-300",
        // Outline — minimal, no shadow.
        outline:
          "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        // Ghost — text only, hover reveals bg.
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        // Link — underline on hover.
        link:
          "text-slate-900 underline-offset-4 hover:underline",
        // Destructive
        destructive:
          "bg-[#DC2626] text-white hover:bg-[#EF4444]",
      },
      size: {
        sm: "h-7 px-2.5 text-[12px]",
        default: "h-9 px-3.5",
        lg: "h-10 px-4 text-[14px]",
        xl: "h-11 px-5 text-[14px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
