import { dark } from "@clerk/themes";
import { UserButton as OriginalUserButton } from "@clerk/clerk-react";

export default function UserButton() {
  return (
    <OriginalUserButton appearance={{ theme: dark }} />
  )
}
