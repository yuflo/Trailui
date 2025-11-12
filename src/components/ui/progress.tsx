"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";

import { cn } from "./utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  shimmer?: boolean;
}

function Progress({
  className,
  value,
  indicatorClassName,
  shimmer = false,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-slate-950 relative h-3 w-full overflow-hidden rounded-sm border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full w-full flex-1 transition-all border-r-2 border-black shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]",
          shimmer && "progress-shimmer",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
