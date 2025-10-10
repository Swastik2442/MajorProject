// src/pages/Dashboard.tsx
import { useState } from "react";
import { useOrganization } from "@clerk/clerk-react";
import DashboardComponent from "@/components/dashboard";
import ClientSelect, { type ClientParam } from "@/components/dashboard/ClientSelect";

export default function Dashboard() {
  const { organization } = useOrganization();
  const [selectedClient, setSelectedClient] = useState<ClientParam>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold leading-tight">
          {selectedClient === null
            ? "Dashboard"
            : Array.isArray(selectedClient)
              ? "Dashboard - Selected Clients"
              : `Dashboard - ${selectedClient.name}`
          }
        </h1>
        <ClientSelect
          org_id={organization?.id ?? null}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      </div>
      <DashboardComponent
        client_id={Array.isArray(selectedClient) ? selectedClient.map(c => c._id) : (selectedClient?._id ?? null)}
        org_id={organization?.id ?? null}
      />
    </div>
  );
}
