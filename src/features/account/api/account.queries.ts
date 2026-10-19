"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth";
import type { ProfileChanges } from "../types";
import {
  cancelAccountDeletion,
  deleteAccount,
  getOrder,
  getOrderDeliverables,
  getProfile,
  listOrders,
  updateProfile,
  uploadProfilePhoto,
} from "./account.api";

export const accountKeys = {
  profile: ["account", "profile"] as const,
  orders: (page: number) => ["account", "orders", page] as const,
  order: (orderId: string) => ["account", "order", orderId] as const,
  deliverables: (orderId: string) => ["account", "order", orderId, "deliverables"] as const,
};

export const useProfile = () => useQuery({ queryKey: accountKeys.profile, queryFn: getProfile });

/** Profile edits also refresh the header avatar/name (GET /users). */
function useRefreshProfile() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: accountKeys.profile }), qc.invalidateQueries({ queryKey: authKeys.me })]);
}

export function useUpdateProfile() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: (changes: ProfileChanges) => updateProfile(changes), onSuccess: refresh });
}

export function useUploadProfilePhoto() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: uploadProfilePhoto, onSuccess: refresh });
}

export const useDeleteAccount = () => useMutation({ mutationFn: deleteAccount });
export const useCancelAccountDeletion = () => useMutation({ mutationFn: cancelAccountDeletion });

/** Keeps the previous page on screen while the next one loads. */
export const useOrders = (page = 1) =>
  useQuery({ queryKey: accountKeys.orders(page), queryFn: () => listOrders(page), placeholderData: keepPreviousData });
export const useOrder = (orderId: string) => useQuery({ queryKey: accountKeys.order(orderId), queryFn: () => getOrder(orderId) });
export const useOrderDeliverables = (orderId: string) =>
  useQuery({ queryKey: accountKeys.deliverables(orderId), queryFn: () => getOrderDeliverables(orderId) });
