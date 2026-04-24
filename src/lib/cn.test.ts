import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins multiple class strings", () => {
    expect(cn("px-2", "py-1", "text-sm")).toBe("px-2 py-1 text-sm");
  });

  it("resolves Tailwind conflicts, keeping the last value", () => {
    expect(cn("px-3", "px-4")).toBe("px-4");
    expect(cn("text-sm text-lg")).toBe("text-lg");
  });

  it("applies conditional classes from objects and arrays", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
    expect(cn(["a", ["b", false && "c"], "d"])).toBe("a b d");
  });

  it("ignores falsy inputs", () => {
    expect(cn("a", null, undefined, false, "", 0, "b")).toBe("a b");
  });

  it("returns an empty string when no classes are provided", () => {
    expect(cn()).toBe("");
    expect(cn(null, undefined, false)).toBe("");
  });

  it("lets later arguments override earlier Tailwind modifiers", () => {
    expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe("hover:bg-blue-500");
  });
});
