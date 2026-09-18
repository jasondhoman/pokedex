import { describe, expect, it } from "vitest";

import { cn } from "@/shared/lib/utils";

describe("cn", () => {
  it("merges conditional and conflicting classes", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
