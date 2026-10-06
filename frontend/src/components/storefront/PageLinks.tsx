"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublishedCustomPages } from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query/keys";

interface PageLinksProps {
  /** Where the links are rendered — determines which placement flag is honored. */
  variant: "navbar" | "footer";
  /** Class applied to every rendered link. */
  className?: string;
}

/**
 * Renders storefront links for published custom pages that opted into
 * the navbar or footer via the dashboard "Show in navbar / Show in footer" flags.
 * Fetches once per session (shared cache between navbar + footer).
 */
export function PageLinks({ variant, className }: PageLinksProps) {
  const searchParams = useSearchParams();
  const tenant = searchParams.get("tenant");

  const { data: pages } = useQuery({
    queryKey: queryKeys.website.pages(),
    queryFn: () => getPublishedCustomPages(),
    staleTime: 60_000,
  });

  const links = (pages || []).filter((page) =>
    variant === "navbar" ? page.show_in_navbar : page.show_in_footer
  );

  if (links.length === 0) return null;

  const hrefFor = (slug: string) =>
    tenant ? `/pages/${slug}?tenant=${encodeURIComponent(tenant)}` : `/pages/${slug}`;

  return (
    <>
      {links.map((page) => (
        <Link key={page.id} href={hrefFor(page.slug)} className={className}>
          {page.title}
        </Link>
      ))}
    </>
  );
}
