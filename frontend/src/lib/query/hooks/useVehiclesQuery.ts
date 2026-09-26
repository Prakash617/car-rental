"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVehicles, fetchVehicle, createVehicle, VehicleFilterParams, CreateVehiclePayload } from "@/lib/api/vehicles";
import { queryKeys } from "@/lib/query/keys";

export function useVehiclesQuery(filters?: VehicleFilterParams) {
  return useQuery({
    queryKey: queryKeys.vehicles.list(filters as Record<string, unknown>),
    queryFn: () => fetchVehicles(filters),
  });
}

export function useVehicleQuery(id?: string) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id || ""),
    queryFn: () => fetchVehicle(id!),
    enabled: Boolean(id),
  });
}

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onSuccess: () => {
      // Invalidate fleet queries so dashboard and storefront immediately show the new vehicle
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}
