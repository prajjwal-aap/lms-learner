import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/config/routes";

type Props = {
  title: string;
  subtitle?: string;
  /** Where "Back" goes; defaults to the account home. */
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

/** Frame for the account sub-pages: back link, heading and a centred column. */
export function AccountShell({ title, subtitle, backHref = ROUTES.account.home, backLabel = "My account", children }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 md:py-10">
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700">
        <ArrowLeft className="size-3 shrink-0" />
        {backLabel}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </main>
  );
}

export const accountCard = "rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs sm:p-6";

export const inputClass =
  "w-full rounded-lg border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-200 disabled:bg-gray-50 disabled:text-gray-500";

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50";

/** Label + control + optional hint. */
export function FormField({ id, label, hint, required, children }: { id: string; label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/** Loading / error placeholder inside the shell. */
export function AccountStatus({ loading, error }: { loading: boolean; error?: Error | null }) {
  if (loading) return <div className={`${accountCard} h-48 animate-pulse bg-gray-50`} aria-busy="true" />;
  return <p className={`${accountCard} text-sm text-red-600`}>{error?.message ?? "Couldn't load this page."}</p>;
}
