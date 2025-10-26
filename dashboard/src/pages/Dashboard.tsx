import { useState } from "react";
import { useOrganization } from "@clerk/clerk-react";
import DashboardComponent from "@/components/dashboard";
import {
  ClientSelect,
  CreateClientButton,
  ChangeOwnerButton,
  DeleteClientButton,
  RegenApiKeyButton,
  type TClientSelectParam
} from "@/components/client";
import Metadata from "@/components/Metadata";

export default function Dashboard() {
  const { organization } = useOrganization();
  const [selectedClient, setSelectedClient] = useState<TClientSelectParam>(null);

  const dashboardTitle = selectedClient === null
    ? "Dashboard"
    : Array.isArray(selectedClient)
      ? "Dashboard - Selected Clients"
      : `Dashboard - ${selectedClient.name}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Metadata title={`${dashboardTitle} | ${import.meta.env.VITE_APP_TITLE}`} />
        <h1 className="text-2xl font-bold leading-tight">{dashboardTitle}</h1>
        <div className="flex justify-between items-center gap-2">
          {/* Actions for when only a single client is selected */}
          {selectedClient && !Array.isArray(selectedClient) && (<>
            <RegenApiKeyButton clientId={selectedClient._id} />
            <ChangeOwnerButton clientId={selectedClient._id} />
            <DeleteClientButton clientId={selectedClient._id} />
          </>)}
          {Array.isArray(selectedClient) && selectedClient.length == 0 && (<>
            <RegenApiKeyButton clientId={selectedClient[0]._id} />
            <ChangeOwnerButton clientId={selectedClient[0]._id} />
            <DeleteClientButton clientId={selectedClient[0]._id} />
          </>)}
          {/* Client selection dropdown */}
          <ClientSelect
            org_id={organization?.id ?? null}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
          {/* Create Client only when some organization is active */}
          {organization && <CreateClientButton ownerId={organization.id} />}
        </div>
      </div>
      <DashboardComponent
        client_id={
          Array.isArray(selectedClient)
          ? selectedClient.map(c => c._id)
          : (selectedClient?._id ?? null)
        }
        org_id={ // If no client is selected, pass org_id to show org-wide data
          (selectedClient === null || (Array.isArray(selectedClient) && selectedClient.length == 0))
          ? (organization?.id ?? null)
          : null
        }
      />
    </div>
  );
}
