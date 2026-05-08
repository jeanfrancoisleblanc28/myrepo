import { describe, expect, it } from "vitest";
import {
  categories,
  generateKit,
  getCategory,
  getSkill,
  getSkillsByCategory,
  getSkillsByIds,
  levelLabels,
  levelOrder,
  skills,
  type SkillLevel,
} from "./skills-data";

describe("catalog integrity", () => {
  it("has unique skill IDs", () => {
    const ids = skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique category IDs", () => {
    const ids = categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references only existing categories from skills", () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    for (const skill of skills) {
      expect(categoryIds.has(skill.categoryId)).toBe(true);
    }
  });

  it("uses only known levels", () => {
    const allowed: SkillLevel[] = ["fundamental", "advanced", "expert"];
    for (const skill of skills) {
      expect(allowed).toContain(skill.level);
    }
  });
});

describe("getCategory / getSkill", () => {
  it("finds an existing category", () => {
    expect(getCategory(categories[0].id)?.id).toBe(categories[0].id);
  });

  it("returns undefined for an unknown category", () => {
    expect(getCategory("does-not-exist")).toBeUndefined();
  });

  it("finds an existing skill", () => {
    expect(getSkill(skills[0].id)?.id).toBe(skills[0].id);
  });

  it("returns undefined for an unknown skill", () => {
    expect(getSkill("does-not-exist")).toBeUndefined();
  });
});

describe("getSkillsByCategory", () => {
  it("returns all skills tagged with the category", () => {
    const cat = categories[0].id;
    const result = getSkillsByCategory(cat);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s) => s.categoryId === cat)).toBe(true);
  });

  it("returns an empty array for an unknown category", () => {
    expect(getSkillsByCategory("nope")).toEqual([]);
  });
});

describe("generateKit", () => {
  it("returns the requested count when the pool is large enough", () => {
    const kit = generateKit({ count: 5, seed: 1 });
    expect(kit).toHaveLength(5);
  });

  it("clamps count to the pool size when count exceeds available skills", () => {
    const kit = generateKit({ count: 9999, seed: 1 });
    expect(kit).toHaveLength(skills.length);
  });

  it("returns an empty array when count is 0", () => {
    expect(generateKit({ count: 0, seed: 1 })).toEqual([]);
  });

  it("returns an empty array when filters yield an empty pool", () => {
    const kit = generateKit({ count: 5, categoryIds: ["does-not-exist"], seed: 1 });
    expect(kit).toEqual([]);
  });

  it("filters by category", () => {
    const cat = categories[0].id;
    const kit = generateKit({ count: 99, categoryIds: [cat], seed: 1 });
    expect(kit.length).toBeGreaterThan(0);
    expect(kit.every((s) => s.categoryId === cat)).toBe(true);
  });

  it("filters by level", () => {
    const kit = generateKit({ count: 99, levels: ["expert"], seed: 1 });
    expect(kit.length).toBeGreaterThan(0);
    expect(kit.every((s) => s.level === "expert")).toBe(true);
  });

  it("intersects category and level filters", () => {
    const cat = categories[0].id;
    const kit = generateKit({ count: 99, categoryIds: [cat], levels: ["fundamental"], seed: 1 });
    expect(kit.every((s) => s.categoryId === cat && s.level === "fundamental")).toBe(true);
  });

  it("never returns duplicates", () => {
    const kit = generateKit({ count: skills.length, seed: 42 });
    const ids = kit.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is deterministic for a given seed", () => {
    const a = generateKit({ count: 7, seed: 12345 });
    const b = generateKit({ count: 7, seed: 12345 });
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  it("produces different orderings for different seeds (sanity)", () => {
    const a = generateKit({ count: skills.length, seed: 1 });
    const b = generateKit({ count: skills.length, seed: 2 });
    // Both contain the same set of skills, but the order should differ
    // for at least one position with high probability.
    expect(new Set(a.map((s) => s.id))).toEqual(new Set(b.map((s) => s.id)));
    expect(a.map((s) => s.id)).not.toEqual(b.map((s) => s.id));
  });

  it("treats empty filter arrays as no filter", () => {
    const kit = generateKit({ count: 99, categoryIds: [], levels: [], seed: 1 });
    expect(kit).toHaveLength(skills.length);
  });
});

describe("getSkillsByIds", () => {
  it("returns skills in the order of the input IDs", () => {
    const ids = [skills[2].id, skills[0].id, skills[1].id];
    const result = getSkillsByIds(ids);
    expect(result.map((s) => s.id)).toEqual(ids);
  });

  it("silently drops unknown IDs", () => {
    const ids = [skills[0].id, "ghost", skills[1].id];
    const result = getSkillsByIds(ids);
    expect(result.map((s) => s.id)).toEqual([skills[0].id, skills[1].id]);
  });

  it("returns an empty array for empty input", () => {
    expect(getSkillsByIds([])).toEqual([]);
  });
});

describe("level metadata", () => {
  it("levelOrder contains every level exactly once", () => {
    expect(new Set(levelOrder)).toEqual(new Set(["fundamental", "advanced", "expert"]));
    expect(levelOrder).toHaveLength(3);
  });

  it("levelLabels has a French label for every level", () => {
    for (const lv of levelOrder) {
      expect(typeof levelLabels[lv]).toBe("string");
      expect(levelLabels[lv].length).toBeGreaterThan(0);
    }
  });
});
