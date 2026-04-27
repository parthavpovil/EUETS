import { useState } from "react";
import { InputForm } from "./components/InputForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { PinGate } from "./components/PinGate";
import type { CalculationResponse, CalculationTrace } from "./types";

function App() {
  const [results, setResults] = useState<CalculationResponse | null>(null);
  const [trace, setTrace] = useState<CalculationTrace | null>(null);
  const [error, setError] = useState<string>("");

  const handleCalculationComplete = (result: CalculationResponse, t: CalculationTrace) => {
    setResults(result);
    setTrace(t);
    setError("");
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCalculationError = (msg: string) => {
    setError(msg);
  };

  return (
    <PinGate>
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-800 to-primary-700 text-white shadow-md">
        <div className="container mx-auto max-w-4xl px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex-none w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">FuelEU Maritime Penalty Calculator</h1>
              <p className="text-primary-200 text-xs mt-0.5 font-medium">EU Regulation 2023/1805 · GHG intensity & compliance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Global error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm" role="alert">
            <svg className="w-5 h-5 flex-none mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-sm">Calculation Error</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Input form */}
        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <InputForm
            onCalculationComplete={handleCalculationComplete}
            onCalculationError={handleCalculationError}
          />
        </section>

        {/* Results */}
        {results && (
          <section id="results-section">
            <ResultsDisplay results={results} trace={trace} />
          </section>
        )}
      </main>

      <footer className="mt-12 pb-8 text-center text-xs text-neutral-400">
        Based on EU Regulation 2023/1805 (FuelEU Maritime)
      </footer>
    </div>
    </PinGate>
  );
}

export default App;
