import { describe, it, expect } from "vitest";
import {
  applyYearToDiscoverParams,
  getYearFilterOptions,
  releaseDateMatchesYearFilter,
  resolveYearFilter,
} from "./year-filters";

describe("year-filters", () => {
  it("includes decade and range options", () => {
    const options = getYearFilterOptions();
    expect(options.find((o) => o.value === "2020-now")).toBeDefined();
    expect(options.find((o) => o.value === "1990-1999")).toBeDefined();
    expect(options.find((o) => o.value === "")).toBeDefined();
  });

  it("maps exact year to primary_release_year", () => {
    const params = applyYearToDiscoverParams({}, "2025");
    expect(params.primary_release_year).toBe("2025");
  });

  it("maps decade range to release date bounds", () => {
    const params = applyYearToDiscoverParams({}, "1990-1999");
    expect(params["primary_release_date.gte"]).toBe("1990-01-01");
    expect(params["primary_release_date.lte"]).toBe("1999-12-31");
  });

  it("maps open-ended range to today", () => {
    const resolved = resolveYearFilter("2020-now");
    expect(resolved?.gte).toBe("2020-01-01");
    expect(resolved?.lte).toBe(new Date().toISOString().split("T")[0]);
  });

  it("matches movies inside year ranges", () => {
    expect(releaseDateMatchesYearFilter("1995-06-15", "1990-1999")).toBe(true);
    expect(releaseDateMatchesYearFilter("1985-01-01", "1990-1999")).toBe(false);
    expect(releaseDateMatchesYearFilter("2024-03-01", "2020-now")).toBe(true);
    expect(releaseDateMatchesYearFilter("2025-01-01", "2025")).toBe(true);
  });
});
