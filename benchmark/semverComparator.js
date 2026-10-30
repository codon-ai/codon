export class SemVer {
  constructor(major, minor, patch) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }
  static parse(versionStr) {
    const match = versionStr.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) throw new Error("Invalid semver string");
    return new SemVer(Number(match[1]), Number(match[2]), Number(match[3]));
  }
  compare(other) {
    if (this.major !== other.major) return this.major > other.major ? 1 : -1;
    if (this.minor !== other.minor) return this.minor > other.minor ? 1 : -1;
    if (this.patch !== other.patch) return this.patch > other.patch ? 1 : -1;
    return 0;
  }
  gt(other) { return this.compare(other) === 1; }
  lt(other) { return this.compare(other) === -1; }
  eq(other) { return this.compare(other) === 0; }
  toString() { return `${this.major}.${this.minor}.${this.patch}`; }
}
