import { clerkClient } from "@clerk/clerk-sdk-node";
import { ApiError } from "./types";

export const adminAccessEmails = [
  'testdevbyharsh@gmail.com',
  "cozygripzdev@gmail.com",
  "aaskadembla12@gmail.com",
  "ankushpitliya11@gmail.com",
];

export async function hasAdminAccess(userId: string): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;
    return userEmail ? adminAccessEmails.includes(userEmail) : false;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
}

export async function requireAdminAccess(userId: string): Promise<void> {
  const hasAccess = await hasAdminAccess(userId);
  if (!hasAccess) {
    throw new ApiError(403, "Admin access required");
  }
} 