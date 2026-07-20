import { describe, it, expect } from "vitest";
import { createId } from "../db/id.js";

describe("createId", () => {
  it("should generate a 21-character string by default", () => {
    const id = createId();
    expect(id).toHaveLength(21);
  });

  it("should generate a string with custom size", () => {
    const id = createId(30);
    expect(id).toHaveLength(30);
  });

  it("should only contain alphanumeric characters", () => {
    const id = createId();
    expect(id).toMatch(/^[0-9A-Za-z]+$/);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(createId());
    }
    expect(ids.size).toBe(100);
  });

  it("should generate IDs with different sizes", () => {
    const id5 = createId(5);
    const id10 = createId(10);
    const id50 = createId(50);
    expect(id5).toHaveLength(5);
    expect(id10).toHaveLength(10);
    expect(id50).toHaveLength(50);
  });
});
