import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/utils/escape-html";

// Runs daily via cron-job.org
// Protected by x-cron-secret header
export async function GET(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    expiredListings: 0,
    expiredSubscriptions: 0,
    renewalReminders: 0,
  };

  // ── 1. Expire listings past their expiresAt date ───────────────────────────
  const expiredListings = await db.listing.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });
  results.expiredListings = expiredListings.count;

  // ── 2. Downgrade business plans past their period end ─────────────────────
  const expiredSubs = await db.businessSubscription.findMany({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: { lt: now },
    },
    include: {
      businessProfile: {
        select: {
          id: true,
          name: true,
          owner: { select: { name: true, email: true } },
        },
      },
      plan: { select: { name: true, displayName: true } },
    },
  });

  if (expiredSubs.length > 0) {
    const freePlan = await db.subscriptionPlan.findUnique({
      where: { name: "free" },
    });

    for (const sub of expiredSubs) {
      if (!freePlan || sub.plan.name === "free") continue;

      // Downgrade to free
      await db.businessSubscription.update({
        where: { id: sub.id },
        data: {
          planId: freePlan.id,
          status: "ACTIVE",
          freeBoostsRemaining: 0,
          cancelAtPeriodEnd: false,
        },
      });

      // Pause the business's ads beyond the free plan's limit (oldest stay).
      const activeListings = await db.listing.findMany({
        where: { businessProfileId: sub.businessProfileId, status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      });
      if (activeListings.length > (freePlan.maxListings ?? 3)) {
        const toExpire = activeListings.slice(freePlan.maxListings ?? 3);
        await db.listing.updateMany({
          where: { id: { in: toExpire.map((l) => l.id) } },
          data: { status: "PAUSED" },
        });
      }

      // Send downgrade notification
      try {
        await sendEmail({
          to: sub.businessProfile.owner.email,
          subject: `Your SLMarket.lk plan for ${sub.businessProfile.name} has expired`,
          html: `
            <h2>Plan Expired</h2>
            <p>Hi ${escapeHtml(sub.businessProfile.owner.name)},</p>
            <p>The <strong>${escapeHtml(sub.plan.displayName)}</strong> plan for <strong>${escapeHtml(sub.businessProfile.name)}</strong> has expired and the business page has been moved to the Free plan.</p>
            <p>To restore your listings and features, please renew your subscription.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade"
               style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
              Renew Now
            </a>
            <p style="color:#6b7280;font-size:12px;margin-top:16px;">
              SLMarket.lk: Sri Lanka's Trusted Marketplace to Buy &amp; Sell
            </p>
          `,
        });
      } catch {
        /* email failure should not break the cron */
      }

      results.expiredSubscriptions++;
    }
  }

  // ── 3. Send renewal reminders (3 days before expiry) ─────────────────────
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const oneDayFromNow = new Date(now);
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

  const expiringSoon = await db.businessSubscription.findMany({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: { gte: oneDayFromNow, lte: threeDaysFromNow },
    },
    include: {
      businessProfile: {
        select: { name: true, owner: { select: { name: true, email: true } } },
      },
      plan: { select: { name: true, displayName: true, priceLkr: true } },
    },
  });

  for (const sub of expiringSoon) {
    if (sub.plan.name === "free") continue;
    const daysLeft = Math.ceil(
      (sub.currentPeriodEnd.getTime() - now.getTime()) / 86400000,
    );
    try {
      await sendEmail({
        to: sub.businessProfile.owner.email,
        subject: `Your SLMarket.lk ${sub.plan.displayName} plan for ${sub.businessProfile.name} expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
        html: `
          <h2>Plan Renewal Reminder</h2>
          <p>Hi ${escapeHtml(sub.businessProfile.owner.name)},</p>
          <p>The <strong>${escapeHtml(sub.plan.displayName)}</strong> plan for <strong>${escapeHtml(sub.businessProfile.name)}</strong> expires in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>.</p>
          <p>Renew now to keep your listings active and avoid interruption.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade"
             style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            Renew for LKR ${Number(sub.plan.priceLkr).toLocaleString()}/mo
          </a>
        `,
      });
      results.renewalReminders++;
    } catch {
      /* email failure should not break the cron */
    }
  }

  console.log("[cron/expire]", results);
  return NextResponse.json({ ok: true, ...results });
}
