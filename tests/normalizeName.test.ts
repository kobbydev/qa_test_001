import { normalizeName } from "../src/server";

describe("normalizeName", () => {
  it("replaces curly apostrophes with straight ASCII apostrophe", () => {
    expect(normalizeName("O'Connor")).toBe("O'Connor");
    expect(normalizeName("O'Connor")).toBe("O'Connor");
    expect(normalizeName("OʼConnor")).toBe("O'Connor");
  });

  it("trims and collapses internal whitespace", () => {
    expect(normalizeName("  María   López  ")).toBe("María López");
  });

  it("keeps regular ASCII apostrophe as-is", () => {
    expect(normalizeName("T'Challa Udaku")).toBe("T'Challa Udaku");
  });
});
