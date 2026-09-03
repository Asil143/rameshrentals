import { describe, expect, it } from "vitest";
import { toJsonLdScript } from "./json-ld";

describe("toJsonLdScript", () => {
  it("cannot close its script element", () => {
    const output = toJsonLdScript({ value: "</script><script>alert(1)</script>" });
    expect(output).not.toContain("<");
    expect(JSON.parse(output)).toEqual({ value: "</script><script>alert(1)</script>" });
  });
});
