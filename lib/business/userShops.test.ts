import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
vi.mock("@/lib/db", () => ({ db: { businessProfile: { findMany } } }));

const { allBranches, getUserShops } = await import("./userShops");

beforeEach(() => {
  findMany.mockReset();
});

describe("getUserShops", () => {
  it("returns only the user's own active businesses, with their branches", async () => {
    findMany.mockResolvedValue([
      {
        id: "b1",
        name: "Digital Hub",
        categoryId: "electronics",
        city: "Wellawatte",
        district: "Colombo",
        isVerified: true,
        branches: [{ id: "br1", label: "Colombo - Wellawatte" }],
      },
    ]);
    expect(await getUserShops("u1")).toEqual([
      {
        id: "b1",
        name: "Digital Hub",
        category: "Electronics",
        location: "Wellawatte",
        verified: true,
        branches: [{ id: "br1", label: "Colombo - Wellawatte" }],
      },
    ]);
    expect(findMany.mock.calls[0][0].where).toEqual({
      ownerId: "u1",
      status: "ACTIVE",
    });
  });

  it("is empty when the user has none or the database is down", async () => {
    findMany.mockResolvedValue([]);
    expect(await getUserShops("u1")).toEqual([]);
    findMany.mockImplementation(async () => {
      throw new Error("down");
    });
    expect(await getUserShops("u1")).toEqual([]);
  });
});

describe("allBranches", () => {
  it("lists every branch with its business name", () => {
    const shop = (id: string, branches: string[]) => ({
      id,
      name: id.toUpperCase(),
      category: "",
      location: "",
      verified: false,
      branches: branches.map((b) => ({ id: b, label: b })),
    });
    expect(allBranches([shop("a", ["a1", "a2"]), shop("b", [])])).toEqual([
      { id: "a1", label: "a1", shopName: "A" },
      { id: "a2", label: "a2", shopName: "A" },
    ]);
  });
});
