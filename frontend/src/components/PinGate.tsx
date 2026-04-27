import React, { useState, useEffect } from "react";

const SESSION_KEY = "fem_access_granted";
const CORRECT_PIN = import.meta.env.VITE_ACCESS_PIN as string;

interface PinGateProps {
  children: React.ReactNode;
}

export const PinGate: React.FC<PinGateProps> = ({ children }) => {
  const [granted, setGranted] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setGranted(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setGranted(true);
    } else {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (granted) return <>{children}</>;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className={`bg-white border border-neutral-200 rounded-xl shadow-sm p-8 w-full max-w-sm ${shake ? "animate-shake" : ""}`}>
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-lg font-semibold text-neutral-800 mb-1">
          FuelEU Maritime Calculator
        </h1>
        <p className="text-center text-sm text-neutral-500 mb-6">Enter PIN to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="••••••"
              autoFocus
              className={`input-field text-center text-xl tracking-widest ${error ? "input-error" : ""}`}
            />
            {error && (
              <p className="text-center text-sm text-red-500 mt-2">Incorrect PIN. Try again.</p>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-2.5"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};
