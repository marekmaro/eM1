import { randomUUID } from "node:crypto";
import { readJson, writeJson } from "@/lib/store";

// Zgłoszenia błędnych cen od użytkowników. Nie zapisujemy adresu IP ani e-maila.
export type ReportStatus = "open" | "resolved";

export interface Report {
  id: string;
  createdAt: string;
  productSlug: string;
  shopId: string;
  message: string;
  status: ReportStatus;
}

const FILE = "reports.json";
const MAX_REPORTS = 500;

function readReports(): Report[] {
  return readJson<Report[]>(FILE, []);
}

export function listReports(): Report[] {
  return readReports().slice().reverse();
}

export function openReportCount(): number {
  return readReports().filter((report) => report.status === "open").length;
}

export function addReport(input: { productSlug: string; shopId: string; message: string }): void {
  const reports = readReports();
  reports.push({
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "open",
    ...input,
  });

  // Gdy zbiór rośnie za bardzo, usuwamy najpierw rozwiązane, potem najstarsze.
  while (reports.length > MAX_REPORTS) {
    const resolvedIndex = reports.findIndex((report) => report.status === "resolved");
    reports.splice(resolvedIndex === -1 ? 0 : resolvedIndex, 1);
  }
  writeJson(FILE, reports);
}

export function setReportStatus(id: string, status: ReportStatus): boolean {
  const reports = readReports();
  const report = reports.find((item) => item.id === id);
  if (!report) return false;

  report.status = status;
  writeJson(FILE, reports);
  return true;
}
