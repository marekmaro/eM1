import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

// Dane są w plikach JSON w katalogu data/.
//
// Każdy odczyt i zapis to operacja synchroniczna. Node nie przerywa wykonania
// bloku bez await, więc cykl odczyt → zmiana → zapis jest atomowy wobec innych
// żądań w tym samym procesie. Nie dodawaj await między odczytem a zapisem.
export const DATA_DIR = path.join(process.cwd(), "data");

export function dataFile(name: string): string {
  return path.join(DATA_DIR, name);
}

export function readJson<T>(name: string, fallback: T): T {
  const file = dataFile(name);
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

// Zapis przez plik tymczasowy i rename, żeby przerwany zapis nie uszkodził danych.
export function writeJson(name: string, value: unknown): void {
  const file = dataFile(name);
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
}
