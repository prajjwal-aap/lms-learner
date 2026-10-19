"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { OgLogo } from "@/components/layout";
import { ROUTES } from "@/config/routes";
import { otpCooldownFromError } from "../api/auth.api";
import { useSendOtp, useVerifyOtp } from "../hooks/useAuth";
import { useCountdown } from "../hooks/useCountdown";
import { OTP_LENGTH } from "../types";
import { DemoOtpHint } from "./DemoOtpHint";
import { emptyOtp, OtpInput } from "./OtpInput";

const OTP_BOX =
  "w-full aspect-square text-center font-headline-md text-headline-md bg-surface-container-low text-on-surface rounded-lg outline-hidden transition-all focus:bg-surface-container-lowest focus:shadow-md focus:text-primary-container border-0 p-0 focus:ring-0";
const FILL = { fontVariationSettings: "'FILL' 1" };

/** Recovery / verification: mobile → OTP → sign in (the API has no passwords or email OTP). Uses useSearchParams (wrap in <Suspense>). */
export function ResetPasswordScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [otpSent, setOtpSent] = useState(false);
  const countdown = useCountdown();
  const send = useSendOtp();
  const verify = useVerifyOtp();

  const requestOtp = () =>
    send.mutate(
      { phone },
      {
        onSuccess: ({ resendInSeconds }) => {
          setOtpSent(true);
          countdown.start(resendInSeconds);
        },
        onError: (e) => {
          const wait = otpCooldownFromError(e);
          if (wait) countdown.start(wait);
        },
      },
    );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (otpSent) verify.mutate({ phone, otp: otp.join("") });
    else requestOtp();
  };

  const resendLabel = !otpSent ? "Send OTP" : countdown.seconds > 0 ? `Resend OTP (${countdown.seconds}s)` : "Resend OTP";
  const error = (verify.error ?? send.error)?.message;
  const busy = send.isPending || verify.isPending;

  return (
    <div className="flex w-full flex-col items-center justify-center p-gutter">
      <div className="flex w-full flex-col items-center justify-center px-4 py-6">
        <div className="relative flex w-full max-w-xl flex-col items-center">
          {/* Ambient orbs */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary-fixed opacity-40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-tertiary-fixed opacity-35 blur-3xl" />

          <div className="relative w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary-container via-surface-tint to-tertiary" />
            <div className="flex flex-col items-center p-8 sm:p-10">
              {/* Emblem */}
              <OgLogo className="mb-6 h-16" />

              <div className="mb-8 max-w-md text-center">
                <span className="mb-2.5 inline-block rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-primary">
                  Student Portal
                </span>
                <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">Login to Occult Gurukul</h1>
                <p className="font-body-md text-body-md leading-relaxed text-secondary">
                  Enter your registered mobile number to receive a secure one-time password (OTP).
                </p>
              </div>

              <form className="w-full space-y-5" onSubmit={onSubmit}>
                <div>
                  <label className="mb-2 block font-label-md text-label-md text-on-surface" htmlFor="reset-phone">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-secondary">smartphone</span>
                    <input
                      className="w-full rounded-lg border-0 bg-surface-container-low py-3 pl-11 pr-4 font-body-md text-body-md text-on-surface outline-hidden transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:shadow-md focus:ring-0"
                      id="reset-phone"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        if (otpSent) setOtpSent(false);
                      }}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface">{OTP_LENGTH}-Digit Verification Code</span>
                    <button
                      className="font-label-sm text-label-sm text-primary transition-colors hover:text-tertiary disabled:text-secondary"
                      disabled={!phone || send.isPending || countdown.seconds > 0}
                      type="button"
                      onClick={requestOtp}
                    >
                      {resendLabel}
                    </button>
                  </div>
                  <OtpInput className="mx-auto grid max-w-xs grid-cols-4 gap-2 sm:gap-3" inputClassName={OTP_BOX} placeholder="·" value={otp} onChange={setOtp} />
                  <DemoOtpHint />
                </div>

                {error && (
                  <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-error" role="alert">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                  </p>
                )}

                <div className="space-y-3 pt-2">
                  <button
                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-container px-6 py-3.5 font-label-md text-label-md tracking-wide text-on-primary shadow-md transition-all duration-200 hover:bg-primary disabled:opacity-70"
                    disabled={busy}
                    type="submit"
                  >
                    <span>{busy ? "Please wait…" : otpSent ? "Verify & Login" : "Send OTP"}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                  <Link
                    className="block w-full rounded-lg px-4 py-2.5 text-center font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
                    href={ROUTES.login}
                  >
                    Need help logging in?
                  </Link>
                </div>
              </form>
            </div>

            {/* Support banner */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-dim/40 bg-surface-container p-4 sm:flex-row sm:px-8">
              <div className="flex items-center space-x-3 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp">
                  <span className="material-symbols-outlined text-[18px]" style={FILL}>
                    forum
                  </span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface">Need assistance with your portal access?</p>
                  <p className="font-body-sm text-body-sm text-secondary">Talk to our Learner Support Team directly on WhatsApp</p>
                </div>
              </div>
              <a
                className="inline-flex shrink-0 items-center space-x-1.5 rounded-full bg-whatsapp px-3 py-1.5 font-label-sm text-label-sm text-white shadow-xs transition-opacity hover:opacity-95"
                href="https://wa.me"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[15px]" style={FILL}>
                  chat
                </span>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center space-x-2 font-body-sm text-body-sm text-secondary">
            <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
            <span>256-bit Encrypted Esoteric Portal Gateway</span>
            <span>•</span>
            <span>Vedic Studies Gurukul</span>
          </div>
        </div>
      </div>
    </div>
  );
}
