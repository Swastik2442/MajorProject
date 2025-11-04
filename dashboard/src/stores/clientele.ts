import { create } from 'zustand';
import type { TClientSelectParam } from "@/components/client";

export type ClienteleState = {
  clients: TClientSelectParam;
};
export type ClienteleActions = {
  setClients: (clients: TClientSelectParam) => void;
};
export type ClienteleStore = ClienteleState & ClienteleActions;

export const useClientele = create<ClienteleStore>((set) => ({
  organization: null,
  clients: null,
  setClients: (clients) => {set({ clients })},
}));

export default useClientele;
