import { describe, expect, it } from "vitest";

import { loadManualTests } from "./test-runner";

describe("loadManualTests", () => {
  it("loads manual tests from capabilities", async () => {
    const tests = await loadManualTests();

    expect(tests.length).toBeGreaterThan(0);
    expect(tests[0]).toMatchObject({
      id: expect.any(String),
      steps: expect.any(Array),
    });
  });
});
