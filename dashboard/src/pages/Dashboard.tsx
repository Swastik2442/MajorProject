// src/pages/Dashboard.tsx
import { useState } from "react";
import { useOrganization } from "@clerk/clerk-react";
import DashboardComponent from "../components/dashboard";
import ClientSelect, { type ClientParam } from "../components/dashboard/ClientSelect";

export default function Dashboard() {
  const { organization } = useOrganization();
  const [client, setClient] = useState<ClientParam>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold leading-tight">
          Unified Operations & Predictive Insight Dashboard
        </h1>
        <ClientSelect
          org_id={organization?.id ?? null}
          selectedClient={client}
          setSelectedClient={setClient}
        />
      </div>
      <DashboardComponent
        client_id={Array.isArray(client) ? client.map(c => c._id) : (client?._id ?? null)}
        org_id={organization?.id ?? null}
      />
    </div>
  );
}
