import { dark } from "@clerk/themes";
import { OrganizationSwitcher as OriginalOrganizationSwitcher } from "@clerk/clerk-react";

export default function OrganizationSwitcher() {
  return (
    <OriginalOrganizationSwitcher
      hidePersonal={true}
      afterCreateOrganizationUrl={(org) => `org/${org.id}`}
      afterLeaveOrganizationUrl='/'
      afterSelectOrganizationUrl={(org) => `org/${org.id}`}
      appearance={{
        theme: dark,
        variables: {
          colorBackground: "var(--card)",
          colorInput: "transparent"
        }
      }}
    />
  )
}
