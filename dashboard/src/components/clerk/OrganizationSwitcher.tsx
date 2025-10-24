import { dark } from "@clerk/themes";
import { OrganizationSwitcher as OriginalOrganizationSwitcher } from "@clerk/clerk-react";

export default function OrganizationSwitcher() {
  return (
    <OriginalOrganizationSwitcher
      hidePersonal={true}
      afterCreateOrganizationUrl='/'
      afterLeaveOrganizationUrl='/'
      afterSelectOrganizationUrl='/'
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
