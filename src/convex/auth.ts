// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { passwordResetEmail } from "./auth/passwordReset";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Email + password sign up / sign in, with password recovery via a
    // 6-digit code sent to the account's email address.
    Password({
      profile: (params) => ({
        email:
          typeof params.email === "string"
            ? params.email.trim().toLowerCase()
            : "",
      }),
      reset: passwordResetEmail,
    }),
    Anonymous,
  ],
});
