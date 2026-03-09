import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type GuildElementProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
};

export function GuildPage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('guild-page', className)} {...props} />;
}

export function GuildHero({ className, asChild = false, ...props }: GuildElementProps) {
  const Comp = asChild ? Slot : 'section';
  return <Comp className={cn('guild-hero', className)} {...props} />;
}

export function GuildPanel({ className, asChild = false, ...props }: GuildElementProps) {
  const Comp = asChild ? Slot : 'section';
  return <Comp className={cn('guild-panel', className)} {...props} />;
}

export function GuildKpi({ className, asChild = false, ...props }: GuildElementProps) {
  const Comp = asChild ? Slot : 'article';
  return <Comp className={cn('guild-kpi', className)} {...props} />;
}

export function GuildChip({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('guild-chip', className)} {...props} />;
}

export function GuildListItem({ className, asChild = false, ...props }: GuildElementProps) {
  const Comp = asChild ? Slot : 'div';
  return <Comp className={cn('guild-list-item', className)} {...props} />;
}

export function GuildCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn('guild-panel', className)} {...props} />;
}
