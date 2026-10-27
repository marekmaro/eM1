import type { Metadata } from "next";
import { AdminNotice } from "@/components/AdminNotice";
import { Logo } from "@/components/Logo";
import { adminEnabled } from "@/lib/session";
import { loginAction } from "../actions";

export const metadata: Metadata = {
  title: "Logowanie do panelu",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const enabled = adminEnabled();

  return (
    <div className="login-page">
      <form action={loginAction} className="card login-card">
        <div className="login-brand">
          <Logo size={40} />
          <h1>Panel administratora</h1>
        </div>
        <AdminNotice error={error} />
        <div className="field">
          <label htmlFor="password">Hasło</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
            disabled={!enabled}
          />
        </div>
        <button className="button" type="submit" disabled={!enabled}>
          Zaloguj
        </button>
      </form>
    </div>
  );
}
