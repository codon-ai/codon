export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${expected}, but received ${actual}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but received ${JSON.stringify(actual)}`);
      }
    }
  };
}
class TestSuite {
  constructor() {
    this.tests = [];
  }
  test(name, fn) {
    this.tests.push({ name, fn });
  }
  async run() {
    const results = [];
    for (const t of this.tests) {
      try {
        await t.fn();
        results.push({ name: t.name, passed: true });
      } catch (error) {
        results.push({ name: t.name, passed: false, error });
      }
    }
    return results;
  }
}
export const suite = new TestSuite();
suite.test("1 + 1 == 2", () => expect(1 + 1).toBe(2));
suite.test("Promise resolve hello", async () => expect(await Promise.resolve("hello")).toBe("hello"));
suite.run().then(res => {
  res.forEach(r => console.log(`${r.passed ? "✓ PASS" : "✗ FAIL"}: ${r.name}`));
});
