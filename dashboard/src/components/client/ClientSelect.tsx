/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQuery } from "@tanstack/react-query";
import type { TClientListItem } from "@/schemas/api";
import { apiService } from "@/services/api";
import { MultiSelect } from "@/components/ui/multi-select";
import { useEffect } from "react";

export type TClientSelectParam = TClientListItem | TClientListItem[] | null;

export function ClientSelect({
  org_id,
  selectedClient,
  setSelectedClient
}: {
  org_id: string | null;
  selectedClient: TClientSelectParam;
  setSelectedClient: (c: TClientSelectParam) => void;
}) {
  const { data } = useQuery({
    queryKey: ["clients", org_id],
    queryFn: () => apiService.listClients({ owner_id: org_id, page: 1, limit: 10 })
  });
  const clients = data?.data ?? [];

  useEffect(() => {
    if (data?.data?.some(c => !c._id))
      throw new Error("Client missing _id");
  }, [data?.data]);

  return (
    <div>
      <MultiSelect
        options={clients.map(c => ({ label: c.name, value: c._id! }))}
        onValueChange={(values) => {
          const selected = clients.filter(c => values.includes(c._id!));
          if (selected.length === 0) {
            setSelectedClient(null);
          } else if (selected.length === 1) {
            setSelectedClient(selected[0]);
          } else {
            setSelectedClient(selected);
          }
        }}
        defaultValue={
          selectedClient === null
          ? []
          : Array.isArray(selectedClient)
            ? selectedClient.map(c => c._id!)
            : [selectedClient._id!]
        }
        placeholder="Select Client(s)"
        emptyIndicator="No such client(s)"
        animationConfig={{
          badgeAnimation: "bounce",
          popoverAnimation: "scale",
          optionHoverAnimation: "highlight",
          duration: 150
        }}
        modalPopover={true}
      />
    </div>
  );
}
