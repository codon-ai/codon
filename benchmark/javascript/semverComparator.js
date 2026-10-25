export class SemVer {
  constructor(major, minor, patch) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  static parse(versionStr) {
    const parts = versionStr.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid semver string");
    }
    const major = Number(parts[0]);
    const minor = Number(parts[1]);
    const patch = Number(parts[2]);
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw new Error("Invalid semver string");
    }
    return new SemVer(major, minor, patch);
  }

  compare(other) {
    if (this.major !== other.major) {
      return this.major > other.major ? 1 : -1;
    }
    if (this.minor !== other.minor) {
      return this.minor > other.minor ? 1 : -1;
    }
    if (this.patch !== other.patch) {
      return this.patch > other.patch ? 1 : -1;
    }
    return 0;
  }

  gt(other) {
    return this.compare(other) === 1;
  }

  lt(other) {
    return this.compare(other) === -1;
  }

  eq(other) {
    return this.compare(other) === 0;
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}
