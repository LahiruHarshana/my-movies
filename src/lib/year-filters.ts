export interface YearFilterOption {
  label: string;
  value: string;
}

export interface ResolvedYearFilter {
  exactYear?: string;
  gte?: string;
  lte?: string;
  label: string;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getYearFilterOptions(): YearFilterOption[] {
  const currentYear = new Date().getFullYear();

  return [
    { label: "All", value: "" },
    { label: String(currentYear + 1), value: String(currentYear + 1) },
    { label: String(currentYear), value: String(currentYear) },
    { label: "2020-now", value: "2020-now" },
    { label: "2010-now", value: "2010-now" },
    { label: "2010-2019", value: "2010-2019" },
    { label: "2000-2009", value: "2000-2009" },
    { label: "1990-1999", value: "1990-1999" },
    { label: "1980-1989", value: "1980-1989" },
    { label: "1970-1979", value: "1970-1979" },
    { label: "1950-1969", value: "1950-1969" },
    { label: "1900-1949", value: "1900-1949" },
  ];
}

export function resolveYearFilter(year?: string): ResolvedYearFilter | null {
  if (!year) return null;

  const today = formatDate(new Date());

  if (/^\d{4}$/.test(year)) {
    return { exactYear: year, label: year };
  }

  const ranges: Record<string, ResolvedYearFilter> = {
    "2020-now": { gte: "2020-01-01", lte: today, label: "2020-now" },
    "2010-now": { gte: "2010-01-01", lte: today, label: "2010-now" },
    "2010-2019": { gte: "2010-01-01", lte: "2019-12-31", label: "2010-2019" },
    "2000-2009": { gte: "2000-01-01", lte: "2009-12-31", label: "2000-2009" },
    "1990-1999": { gte: "1990-01-01", lte: "1999-12-31", label: "1990-1999" },
    "1980-1989": { gte: "1980-01-01", lte: "1989-12-31", label: "1980-1989" },
    "1970-1979": { gte: "1970-01-01", lte: "1979-12-31", label: "1970-1979" },
    "1950-1969": { gte: "1950-01-01", lte: "1969-12-31", label: "1950-1969" },
    "1900-1949": { gte: "1900-01-01", lte: "1949-12-31", label: "1900-1949" },
  };

  return ranges[year] || null;
}

export function applyYearToDiscoverParams(
  params: Record<string, string>,
  year?: string
): Record<string, string> {
  const resolved = resolveYearFilter(year);
  if (!resolved) return params;

  if (resolved.exactYear) {
    params.primary_release_year = resolved.exactYear;
    return params;
  }

  if (resolved.gte) params["primary_release_date.gte"] = resolved.gte;
  if (resolved.lte) params["primary_release_date.lte"] = resolved.lte;

  return params;
}

export function releaseDateMatchesYearFilter(releaseDate?: string, year?: string): boolean {
  const resolved = resolveYearFilter(year);
  if (!resolved || !releaseDate) return !resolved;

  const movieYear = new Date(releaseDate).getFullYear();
  if (Number.isNaN(movieYear)) return false;

  if (resolved.exactYear) {
    return movieYear.toString() === resolved.exactYear;
  }

  const movieTime = new Date(releaseDate).getTime();
  const gteTime = resolved.gte ? new Date(resolved.gte).getTime() : -Infinity;
  const lteTime = resolved.lte ? new Date(resolved.lte).getTime() : Infinity;

  return movieTime >= gteTime && movieTime <= lteTime;
}

export function getYearFilterLabel(year?: string): string | undefined {
  if (!year) return undefined;
  const option = getYearFilterOptions().find((item) => item.value === year);
  return option?.label || year;
}
