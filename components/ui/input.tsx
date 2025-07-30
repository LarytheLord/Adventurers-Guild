import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex w-full rounded-xl bg-[#1a1f27] border border-[#3a3f4b] px-5 py-4 text-white text-base placeholder:text-gray-400 transition-all duration-300",

          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-none appearance-none",

          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",

          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
