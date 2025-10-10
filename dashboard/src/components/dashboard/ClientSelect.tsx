import { useQuery } from "@tanstack/react-query";
import type { TClientListItem } from "../../schemas/api";
import { apiService } from "../../services/api";

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

  /* TODO: Add a "Select/Deselect All" and "Create New" option */
  return (
    <select
      className="border border-gray-300 rounded px-3 py-1 text-white text-sm"
    >
      <option
        onClick={() => {setSelectedClient(null)}}
        value=""
        selected={selectedClient === null}
      >
        All
      </option>
      {clients.map(client => (
          <option
          key={client._id}
          onClick={() => {setSelectedClient(client)}}
          value={client._id}
          selected={Array.isArray(selectedClient) ? selectedClient.some(c => c._id === client._id) : (selectedClient?._id === client._id)}
        >
          {client.name}
        </option>
      ))}
    </select>
  )
}
