class TestSuite {
  tests = [];

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    const results = [];
    for (const { name, fn } of this.tests) {
      try {
        await fn();
        results.push({ name, passed: true });
      } catch (error) {
        results.push({ name, passed: false, error });
      }
    }
    return results;
  }
};
export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but received ${actual}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
  };
};
const export const suite = new TestSuite();
suite.test("math addition", () => {
  expect(1 + 1).toBe(2);
});
suite.test("async resolving value", async () => {
  const value = await Promise.resolve("hello");
  expect(value).toBe("hello");
});
suite.run().then((results) => {
  for (const r of results) {
    console.log(`${r.passed ? "✓ PASS" : "✗ FAIL"}: ${r.name}`);
    if (r.error) console.error("  ", r.error);
  }
});