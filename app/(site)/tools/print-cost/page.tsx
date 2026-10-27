import type { Metadata } from "next";
import { PrintCostCalculator } from "./PrintCostCalculator";

export const metadata: Metadata = {
  title: "Kalkulator kosztu wydruku",
};

export default function PrintCostPage() {
  return (
    <>
      <h1>Kalkulator kosztu wydruku</h1>
      <p className="lead">
        Podaj cenę szpuli i zużycie filamentu w wydruku, a policzymy koszt materiału. Koszt prądu i zużycia drukarki
        nie jest uwzględniony.
      </p>
      <PrintCostCalculator />
    </>
  );
}
