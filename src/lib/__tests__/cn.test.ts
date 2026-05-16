import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("concatenates string class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("merges conflicting tailwind utilities (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm text-base")).toBe("text-base");
  });

  it("supports conditional objects and arrays via clsx", () => {
    expect(cn(["a", { b: true, c: false }], "d")).toBe("a b d");
  });

  it("returns an empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
