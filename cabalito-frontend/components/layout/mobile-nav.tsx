"use client";

import { MobileNavPill } from "@/components/layout/public-nav";

interface Props {
  onCasera?: () => void;
}

export function MobileNav({ onCasera }: Props) {
  return <MobileNavPill onCasera={onCasera} />;
}
