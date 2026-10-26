import { describe, expect, it } from "vitest";
import { cldTransform } from "./cloudinary-url";

describe("cldTransform", () => {
  it("adds the transformation to Cloudinary delivery URLs", () => {
    expect(
      cldTransform(
        "https://res.cloudinary.com/slm/image/upload/v1/ads/a.jpg",
        "f_auto,q_auto,w_400",
      ),
    ).toBe(
      "https://res.cloudinary.com/slm/image/upload/f_auto,q_auto,w_400/v1/ads/a.jpg",
    );
  });

  it("leaves other hosts alone, even when they mention Cloudinary", () => {
    for (const url of [
      "https://evil.example/res.cloudinary.com/upload/a.jpg",
      "https://res.cloudinary.com.evil.example/upload/a.jpg",
      "https://images.example/upload/a.jpg",
    ]) {
      expect(cldTransform(url, "w_400")).toBe(url);
    }
  });

  it("leaves relative paths alone", () => {
    expect(cldTransform("/placeholder.png", "w_400")).toBe("/placeholder.png");
  });
});
