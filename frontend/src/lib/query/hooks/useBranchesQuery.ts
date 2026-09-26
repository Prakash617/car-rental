"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBranches, Branch } from "@/lib/api/branches";
import { queryKeys } from "@/lib/query/keys";

export function useBranchesQuery() {
  return useQuery<Branch[]>({
    queryKey: queryKeys.branches.list(),
    queryFn: () => fetchBranches(),
    staleTime: 5 * 60 * 1000, // Branches change rarely, cache for 5 minutes
  });
}
