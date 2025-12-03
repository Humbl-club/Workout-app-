import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk JWT issuer domain - set via environment variable for dev/prod flexibility
      // Development: https://verb-noun-00.clerk.accounts.dev
      // Production: https://clerk.rebld.de
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
