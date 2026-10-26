import { db } from "@/lib/db";
import { categories } from "@/config/const/navLinks";

/*
 * The signed-in user's own business profiles and their branches, for the
 * account menu and the post-ad flow (Location's branches, Seller's
 * "Publish as"). Client components import only the types.
 */

export type UserShopBranch = { id: string; label: string };

export type UserShop = {
  id: string;
  name: string;
  category: string;
  location: string;
  verified: boolean;
  branches: UserShopBranch[];
};

export async function getUserShops(userId: string): Promise<UserShop[]> {
  try {
    const rows = await db.businessProfile.findMany({
      where: { ownerId: userId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        categoryId: true,
        city: true,
        district: true,
        isVerified: true,
        branches: {
          orderBy: { createdAt: "asc" },
          select: { id: true, label: true },
        },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category:
        categories.find((c) => c.id === r.categoryId)?.name ?? r.categoryId,
      location: r.city ?? r.district ?? "",
      verified: r.isVerified,
      branches: r.branches,
    }));
  } catch {
    return [];
  }
}

// Every branch across the user's businesses, labelled with its business.
export function allBranches(
  shops: UserShop[],
): (UserShopBranch & { shopName: string })[] {
  return shops.flatMap((shop) =>
    shop.branches.map((b) => ({ ...b, shopName: shop.name })),
  );
}
