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
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Dashboard({ onShowCharts }: { onShowCharts: () => void }) {
  const { organization } = useOrganization();
  const [selectedClient, setSelectedClient] = useState<TClientSelectParam>(null);

  const dashboardTitle =
    selectedClient === null
      ? "Dashboard"
      : Array.isArray(selectedClient)
      ? "Dashboard - Selected Clients"
      : `Dashboard - ${selectedClient.name}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Metadata title={`${dashboardTitle} | ${import.meta.env.VITE_APP_TITLE}`} />
        <h1 className="text-2xl font-bold leading-tight">{dashboardTitle}</h1>
        <div className="flex items-center gap-2">
          {/* Charts Button */}
          <Button variant="outline" onClick={onShowCharts} className="flex items-center gap-2">
            <ArrowRight size={18} /> View Charts
          </Button>

          {/* Actions */}
          {selectedClient && !Array.isArray(selectedClient) && selectedClient._id && (
            <>
              <RegenApiKeyButton clientId={selectedClient._id as string} />
              <ChangeOwnerButton clientId={selectedClient._id as string} />
              <DeleteClientButton clientId={selectedClient._id as string} />
            </>
          )}

          {/* Client Select */}
          <ClientSelect
            org_id={organization?.id ?? null}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />

          {organization && <CreateClientButton ownerId={organization.id} />}
        </div>
      </div>

      <DashboardComponent
        client_id={
          Array.isArray(selectedClient)
            ? selectedClient.map((c) => c._id).filter((id): id is string => id != null)
            : selectedClient?._id ?? null
        }
        org_id={
          selectedClient === null ||
          (Array.isArray(selectedClient) && selectedClient.length === 0)
            ? organization?.id ?? null
            : null
        }
      />
    </div>
  );
}
