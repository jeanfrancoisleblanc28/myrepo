import { describe, expect, it } from "vitest";
import {
  categories,
  generateBalancedKit,
  generateKit,
  getCategory,
  getPreset,
  getSkill,
  getSkillsByCategory,
  getSkillsByIds,
  kitPresets,
  levelLabels,
  levelOrder,
  skills,
} from "@/lib/skills-data";

describe("skills-data — dataset integrity", () => {
  it("has unique skill ids", () => {
    const ids = skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique category ids", () => {
    const ids = categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every skill references a known category", () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    for (const skill of skills) {
      expect(categoryIds.has(skill.categoryId)).toBe(true);
    }
  });

  it("every skill has a level in the canonical order", () => {
    for (const skill of skills) {
      expect(levelOrder).toContain(skill.level);
    }
  });

  it("every preset references known categories in its recipe", () => {
    const categoryIds = new Set(categories.map((c) => c.id));
    for (const preset of kitPresets) {
      for (const catId of Object.keys(preset.recipe)) {
        expect(categoryIds.has(catId)).toBe(true);
      }
    }
  });

  it("exposes a label for every level", () => {
    for (const level of levelOrder) {
      expect(levelLabels[level]).toBeTruthy();
    }
  });
});

describe("getCategory / getSkill / getSkillsByCategory", () => {
  it("returns the category for a known id", () => {
    const first = categories[0];
    expect(getCategory(first.id)).toEqual(first);
  });

  it("returns undefined for an unknown category id", () => {
    expect(getCategory("nope-does-not-exist")).toBeUndefined();
  });

  it("returns the skill for a known id", () => {
    const first = skills[0];
    expect(getSkill(first.id)).toEqual(first);
  });

  it("returns undefined for an unknown skill id", () => {
    expect(getSkill("nope-does-not-exist")).toBeUndefined();
  });

  it("returns only skills of the requested category", () => {
    const catId = categories[0].id;
    const result = getSkillsByCategory(catId);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s) => s.categoryId === catId)).toBe(true);
  });

  it("returns an empty array for an unknown category", () => {
    expect(getSkillsByCategory("nope")).toEqual([]);
  });
});

describe("getSkillsByIds", () => {
  it("preserves the requested order", () => {
    const ids = [skills[2].id, skills[0].id, skills[1].id];
    const result = getSkillsByIds(ids);
    expect(result.map((s) => s.id)).toEqual(ids);
  });

  it("filters out unknown ids", () => {
    const ids = [skills[0].id, "ghost", skills[1].id];
    const result = getSkillsByIds(ids);
    expect(result.map((s) => s.id)).toEqual([skills[0].id, skills[1].id]);
  });

  it("returns an empty array for no ids", () => {
    expect(getSkillsByIds([])).toEqual([]);
  });
});

describe("generateKit", () => {
  it("returns exactly `count` skills when the pool is large enough", () => {
    const kit = generateKit({ count: 5, seed: 1 });
    expect(kit).toHaveLength(5);
  });

  it("is fully deterministic when a seed is provided", () => {
    const a = generateKit({ count: 5, seed: 42 });
    const b = generateKit({ count: 5, seed: 42 });
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  it("returns different results for different seeds (sanity check)", () => {
    const a = generateKit({ count: 5, seed: 1 });
    const b = generateKit({ count: 5, seed: 999 });
    expect(a.map((s) => s.id)).not.toEqual(b.map((s) => s.id));
  });

  it("respects the category filter", () => {
    const catId = categories[0].id;
    const kit = generateKit({ count: 20, categoryIds: [catId], seed: 1 });
    expect(kit.length).toBeGreaterThan(0);
    expect(kit.every((s) => s.categoryId === catId)).toBe(true);
  });

  it("respects the level filter", () => {
    const kit = generateKit({ count: 20, levels: ["fundamental"], seed: 1 });
    expect(kit.length).toBeGreaterThan(0);
    expect(kit.every((s) => s.level === "fundamental")).toBe(true);
  });

  it("caps the result size to the pool size", () => {
    // A single category × a single level usually has < 100 skills.
    const catId = categories[0].id;
    const kit = generateKit({
      count: 1000,
      categoryIds: [catId],
      levels: ["expert"],
      seed: 1,
    });
    const pool = skills.filter(
      (s) => s.categoryId === catId && s.level === "expert",
    );
    expect(kit.length).toBe(pool.length);
  });

  it("returns an empty array when filters yield no match", () => {
    const kit = generateKit({
      count: 5,
      categoryIds: ["nope"],
      seed: 1,
    });
    expect(kit).toEqual([]);
  });

  it("returns unique skills (no duplicates)", () => {
    const kit = generateKit({ count: 9, seed: 7 });
    const ids = kit.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("generateBalancedKit", () => {
  it("returns the preset's default count when no override is given", () => {
    const preset = getPreset("a11y-audit")!;
    const kit = generateBalancedKit({ preset, seed: 1 });
    expect(kit).toHaveLength(preset.defaultCount);
  });

  it("honours an explicit count override", () => {
    const preset = getPreset("design-system")!;
    const kit = generateBalancedKit({ preset, count: 3, seed: 1 });
    expect(kit).toHaveLength(3);
  });

  it("is deterministic for a given seed", () => {
    const preset = getPreset("ux-research")!;
    const a = generateBalancedKit({ preset, seed: 123 });
    const b = generateBalancedKit({ preset, seed: 123 });
    expect(a.map((s) => s.id)).toEqual(b.map((s) => s.id));
  });

  it("does not contain duplicates", () => {
    const preset = getPreset("product-strategy")!;
    const kit = generateBalancedKit({ preset, count: 6, seed: 5 });
    const ids = kit.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("favours recipe categories (≥ 1 skill from each recipe entry when possible)", () => {
    // Use a generous count so the recipe is fully satisfied.
    const preset = getPreset("a11y-audit")!;
    const kit = generateBalancedKit({ preset, count: 9, seed: 2 });
    for (const catId of Object.keys(preset.recipe)) {
      const fromCat = kit.filter((s) => s.categoryId === catId);
      expect(fromCat.length).toBeGreaterThan(0);
    }
  });

  it("returns an empty array when filters reduce the pool to zero", () => {
    const preset = getPreset("a11y-audit")!;
    const kit = generateBalancedKit({
      preset,
      categoryIds: ["nope-no-such-cat"],
      seed: 1,
    });
    expect(kit).toEqual([]);
  });

  it("respects an overriding level filter (only matching levels appear)", () => {
    const preset = getPreset("design-system")!;
    const kit = generateBalancedKit({
      preset,
      levels: ["fundamental"],
      count: 6,
      seed: 3,
    });
    expect(kit.length).toBeGreaterThan(0);
    expect(kit.every((s) => s.level === "fundamental")).toBe(true);
  });

  it("never exceeds the effective count, even if the recipe sums to more", () => {
    const preset = getPreset("design-system")!;
    const recipeSum = Object.values(preset.recipe).reduce((a, b) => a + b, 0);
    const cappedCount = Math.max(1, recipeSum - 2);
    const kit = generateBalancedKit({ preset, count: cappedCount, seed: 4 });
    expect(kit.length).toBe(cappedCount);
  });
});
