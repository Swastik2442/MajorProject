import { dark } from "@clerk/themes";
import { SignIn as OriginalSignIn } from "@clerk/clerk-react";

export default function SignIn() {
  return (
    <OriginalSignIn appearance={{ theme: dark }} />
  )
}
