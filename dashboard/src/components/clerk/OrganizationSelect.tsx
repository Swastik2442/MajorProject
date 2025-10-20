import { useOrganizationList } from "@clerk/clerk-react";
import type { OrganizationMembershipResource } from "@clerk/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrganizationSelect({
  filter, className, placeholder, ...props
}: React.ComponentProps<typeof Select> & {
  filter?: (value: OrganizationMembershipResource, index: number, array: OrganizationMembershipResource[]) => boolean
  className?: string;
  placeholder?: string;
}) {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true }
  });

  return (
    <Select {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoaded && (filter ? userMemberships.data.filter(filter) : userMemberships.data).map((membership) => {
          return (
            <SelectItem key={membership.organization.id} value={membership.organization.id}>
              {membership.organization.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
