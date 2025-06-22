import type { Express, RequestHandler, Request as ExpressRequest, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import {
  ClerkExpressWithAuth,
  ClerkExpressRequireAuth,
  clerkClient,
  AuthObject,
} from "@clerk/clerk-sdk-node";
import { storage } from "./storage";

/**
 * -----------------------------------------------------------------------------
 * Clerk‑based authentication middleware for CozyTheme (server side).
 * -----------------------------------------------------------------------------
 * This file mirrors the public API of the former `replitAuth.ts` so that you
 * can swap imports without breaking the rest of the codebase:
 *   import { setupAuth, isAuthenticated } from "./clerkAuth";
 *
 * ― setupAuth(app)  ➜ mounts Clerk + (optional) session store.
 * ― isAuthenticated ➜ drop‑in route‑guard replacement.
 *
 * The legacy session store is *kept* so existing logic that relies on
 * `express-session` (e.g. flash messages, CSRF tokens) still works during the
 * migration.  Once Clerk is confirmed working everywhere, you can safely remove
 * `express-session`, `connect-pg-simple`, and related code.
 * -----------------------------------------------------------------------------
 */

/* -------------------------------------------------------------------------- */
/* Session helper (unchanged from replitAuth)                                  */
/* -------------------------------------------------------------------------- */

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  // Generate a session secret if not provided (development convenience)
  const sessionSecret =
    process.env.SESSION_SECRET ||
    "clerk-session-secret-" +
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);

  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

/* -------------------------------------------------------------------------- */
/* User sync middleware                                                        */
/* -------------------------------------------------------------------------- */

const syncUserData: RequestHandler = async (req, res, next) => {
  try {
    const auth = (req as any).auth as AuthObject | undefined;
    if (auth?.userId) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      
      // Sync user data to our database
      await storage.upsertUser({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileImageUrl: clerkUser.imageUrl || '',
        role: (clerkUser.publicMetadata.role as string) || 'user',
        phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India'
      });
    }
  } catch (error) {
    console.error("Error syncing user data:", error);
  }
  next();
};

/* -------------------------------------------------------------------------- */
/* Primary setup                                                               */
/* -------------------------------------------------------------------------- */

export async function setupAuth(app: Express) {
  // Trust first proxy (needed when behind Vercel/Render/NGINX)
  app.set("trust proxy", 1);

  // (Optional) keep legacy session logic alive during migration
  app.use(getSession());

  // Mount Clerk middleware – this parses Clerk cookies/JWT and populates req.auth
  const clerkMiddleware = ClerkExpressWithAuth();
  app.use(clerkMiddleware);

  // Add user sync middleware
  app.use(syncUserData);

  /* --------------------------------- Routes -------------------------------- */
  // NOTE: Clerk generally handles login/registration on the *client* with its
  // prebuilt React components.  These endpoints mirror the old API shape so
  // existing redirects (e.g. `/api/login`) keep working.

  // Client hits this when not signed in.  We send them to Clerk's sign‑in URL.
  app.get("/api/login", (req, res) => {
    const signInUrl = `${process.env.CLERK_SIGN_IN_URL ?? "/sign-in"}?redirect_url=${encodeURIComponent(req.query.next as string ?? "/")}`;
    return res.redirect(signInUrl);
  });

  // Logout: revoke the current session at Clerk, then clear cookie & redirect.
  app.get("/api/logout", async (req, res) => {
    try {
      const sessionId = (req as AuthenticatedRequest)?.auth?.sessionId;
      if (sessionId) {
        await clerkClient.sessions.revokeSession(sessionId);
      }
    } catch (_) {
      /* ignore */
    }

    // Destroy local express-session (if any)
    req.session?.destroy(() => {
      res.redirect("/");
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Drop‑in route guard                                                        */
/* -------------------------------------------------------------------------- */

// Usage: app.get("/api/secure", isAuthenticated, (req,res)=>{...})
export const isAuthenticated: RequestHandler = ClerkExpressRequireAuth();

export interface AuthenticatedRequest extends ExpressRequest {
  auth?: AuthObject;
}
