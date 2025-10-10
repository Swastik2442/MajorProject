import { useQuery } from "@tanstack/react-query";
import type { TClientListItem } from "@/schemas/api";
import { apiService } from "@/services/api";
import { MultiSelect } from "@/components/ui/multi-select";

export type ClientParam = TClientListItem | TClientListItem[] | null;

export default function ClientSelect({
    org_id,
    selectedClient,
    setSelectedClient
}: {
    org_id: string | null;
    selectedClient: ClientParam;
    setSelectedClient: (c: ClientParam) => void;
}) {
  const { data } = useQuery({
    queryKey: ["clients", org_id],
    queryFn: () => apiService.listClients(1, 10, org_id)
  });
  const clients = data?.data ?? [];

  return (
    <div>
      <MultiSelect
        options={clients.map(c => ({ label: c.name, value: c._id }))}
        onValueChange={(values) => {
          const selected = clients.filter(c => values.includes(c._id));
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
            ? selectedClient.map(c => c._id)
            : [selectedClient._id]
        }
        placeholder="Select Client(s)"
      />
    </div>
  );
}
