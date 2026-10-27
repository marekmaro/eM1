import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { dataFile } from "@/lib/store";

// Dziennik zdarzeń panelu. Nigdy nie zapisujemy haseł, tokenów ani adresów IP.
const FILE = "audit.log";
const MAX_FIELD = 200;

export interface AuditEntry {
  at: string;
  action: string;
  target: string;
  details: string;
}

function clip(value: string): string {
  return value.length > MAX_FIELD ? `${value.slice(0, MAX_FIELD)}…` : value;
}

export function audit(action: string, target: string, details = ""): void {
  const entry: AuditEntry = {
    at: new Date().toISOString(),
    action,
    target: clip(target),
    details: clip(details),
  };
  appendFileSync(dataFile(FILE), `${JSON.stringify(entry)}\n`, "utf8");
}

export function readAudit(limit = 200): AuditEntry[] {
  const file = dataFile(FILE);
  if (!existsSync(file)) return [];

  const entries: AuditEntry[] = [];
  for (const line of readFileSync(file, "utf8").split("\n").slice(-limit - 1)) {
    if (!line) continue;
    try {
      entries.push(JSON.parse(line) as AuditEntry);
    } catch {
      // Uszkodzona linia nie powinna blokować całego dziennika.
    }
  }
  return entries.reverse();
}
