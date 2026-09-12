// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { emailOtp } from "./auth/emailOtp";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Email + password sign up / sign in. A 6-digit code sent to the account's
    // e-mail is required once after signup (e-mail verification) and whenever
    // the user recovers the password.
    Password({
      profile: (params) => ({
        email:
          typeof params.email === "string"
            ? params.email.trim().toLowerCase()
            : "",
      }),
      verify: emailOtp,
      reset: emailOtp,
    }),
    // "Entrar com Google" — OAuth via the existing Convex Auth HTTP routes.
    // Reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from the Convex environment.
    Google,
    Anonymous,
  ],
});
