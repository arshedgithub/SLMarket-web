import { describe, expect, it } from "vitest";
import { htmlToText } from "./email";

describe("htmlToText", () => {
  it("keeps the readable text, links and line breaks", () => {
    const html = `<head><title>x</title></head><style>p{}</style>
      <h2>New Enquiry</h2><p>Hi <strong>Ann</strong>,</p>
      <a href="https://slmarket.lk/dashboard">View enquiry</a>`;
    expect(htmlToText(html)).toBe(
      "New Enquiry\nHi Ann,\nView enquiry (https://slmarket.lk/dashboard)",
    );
  });

  it("decodes the entities the templates use", () => {
    expect(
      htmlToText("<p>© 2026 SLMarket.lk &middot; A&amp;B&nbsp;Co</p>"),
    ).toBe("© 2026 SLMarket.lk · A&B Co");
  });

  it("leaves no tag behind when tags are nested or cut short", () => {
    for (const html of [
      "<scr<script>ipt>alert(1)</script>",
      "<sty<style>x</style>le>body{}</style>",
      "text <script",
    ]) {
      expect(htmlToText(html)).not.toMatch(/<\s*(script|style)/i);
    }
  });
});
