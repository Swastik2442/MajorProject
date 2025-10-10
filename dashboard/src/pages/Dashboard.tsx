// src/pages/Dashboard.tsx
import { useState } from "react";
import { useOrganization } from "@clerk/clerk-react";
import DashboardComponent from "@/components/dashboard";
import { ClientSelect, CreateClientButton, type TClientSelectParam } from "@/components/client";

export default function Dashboard() {
  const { organization } = useOrganization();
  const [selectedClient, setSelectedClient] = useState<TClientSelectParam>(null);

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
        <div className="flex justify-between items-center gap-4">
          <ClientSelect
            org_id={organization?.id ?? null}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
          {organization && <CreateClientButton ownerId={organization.id} />}
        </div>
      </div>
      <DashboardComponent
        client_id={Array.isArray(selectedClient) ? selectedClient.map(c => c._id) : (selectedClient?._id ?? null)}
        org_id={ // If no client is selected, pass org_id to show org-wide data
          (selectedClient === null || (Array.isArray(selectedClient) && selectedClient.length == 0))
          ? (organization?.id ?? null)
          : null
        }
      />
    </div>
  );
}
