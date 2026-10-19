import { z } from "zod";

// Ad fields are validated by lib/listings/adPayload.ts (create and edit).
// This module holds the admin review actions.
export const adminListingActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("request_changes"),
    reason: z.string().min(1, "A reason is required"),
  }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().min(1, "A reason is required"),
  }),
]);
