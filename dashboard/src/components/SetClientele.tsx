import { useOrganization } from "@clerk/clerk-react";
import { useShallow } from "zustand/shallow";
import {
  ClientSelect,
  CreateClientButton,
  ChangeOwnerButton,
  DeleteClientButton,
  RegenApiKeyButton,
  UpdateClientButton,
} from "@/components/client";
import useClientele from "@/stores/clientele";

export function SetClientele() {
  const { organization } = useOrganization();
  const { clients, setClients } = useClientele(useShallow((s) => ({
    clients: s.clients,
    setClients: s.setClients,
  })));

  return (
    <div className="flex items-center gap-2">
      {/* Actions */}
      {clients && !Array.isArray(clients) && clients._id && (
        <>
          <RegenApiKeyButton clientId={clients._id} />
          <ChangeOwnerButton clientId={clients._id} />
          <UpdateClientButton clientId={clients._id} />
          <DeleteClientButton clientId={clients._id} />
        </>
      )}

      {/* Client Select */}
      <ClientSelect
        org_id={organization?.id ?? null}
        selectedClient={clients}
        setSelectedClient={setClients}
      />

      {organization && <CreateClientButton ownerId={organization.id} />}
    </div>
  );
}

export default SetClientele;
