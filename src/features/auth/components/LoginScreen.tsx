"use client";

import { ArrowRight, ChevronDown, CircleAlert, GraduationCap, Headset, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ROUTES } from "@/config/routes";
import { otpCooldownFromError } from "../api/auth.api";
import { useSendOtp, useVerifyOtp } from "../hooks/useAuth";
import { OTP_LENGTH } from "../types";
import { formatCountdown, useCountdown } from "../hooks/useCountdown";
import { DemoOtpHint } from "./DemoOtpHint";
import { emptyOtp, OtpInput } from "./OtpInput";

const FIELD =
  "w-full h-11 px-space-md bg-surface-container-low focus:bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface outline-hidden focus:shadow-[0_0_0_2px_#6930c3] transition-all border-0 focus:ring-0";
const OTP_BOX =
  "w-12 h-12 text-center text-headline-md font-headline-md bg-surface-container-lowest rounded-lg outline-hidden focus:shadow-[0_0_0_2px_#6930c3] border-0 p-0 focus:ring-0";

/** Learner login: mobile → OTP stage → verify. Uses useSearchParams (wrap in <Suspense>). */
export function LoginScreen() {
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
          setOtp(emptyOtp());
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
    if (!otpSent) requestOtp();
  };

  const error = (verify.error ?? send.error)?.message;

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-margin-mobile py-space-xl md:px-margin">
        <div className="flex w-full flex-col gap-space-md rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg shadow-md md:p-space-xl">
          <div className="flex flex-col items-center space-y-space-xs text-center">
            <div className="mb-space-xs flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/10 text-primary">
              <GraduationCap className="size-7" />
            </div>
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">Student Access</span>
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">Learner Login</h1>
            <p className="max-w-xs font-body-md text-body-md text-on-surface-variant">
              Enter your mobile number to receive an OTP verification code.
            </p>
          </div>

          <form className="mt-space-xs space-y-space-md" onSubmit={onSubmit}>
            <div className="space-y-space-xs">
              <label className="flex items-center gap-space-xs font-label-md text-label-md font-semibold text-on-surface" htmlFor="learner-phone">
                <Smartphone className="size-4 shrink-0 text-primary" />Mobile Number
              </label>
              <div className="flex gap-space-xs">
                <div className="relative w-28 shrink-0">
                  <div className="flex h-11 w-full items-center justify-between rounded-lg bg-surface-container-low px-space-sm font-body-md text-body-md text-on-surface">
                    <span className="flex items-center gap-space-xs">
                      <span className="text-[14px]">🇮🇳</span>
                      <span className="font-label-md text-label-md">+91</span>
                    </span>
                    <ChevronDown className="size-[18px] shrink-0 text-outline" />
                  </div>
                </div>
                <div className="relative flex-1">
                  <input
                    className={FIELD}
                    id="learner-phone"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit number"
                    readOnly={otpSent}
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>
              </div>
            </div>

            <p className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <ShieldCheck className="size-4 shrink-0 text-primary" />A {OTP_LENGTH}-digit one-time password
              will be sent by SMS. New here? Your account is created on first login.
            </p>

            {!otpSent && (
              <button
                className="flex h-12 w-full items-center justify-center gap-space-sm rounded-lg bg-primary-container font-label-md text-label-md text-on-primary shadow-md transition-all hover:bg-primary hover:shadow-[0_4px_16px_rgba(105,48,195,0.3)] disabled:opacity-70"
                disabled={send.isPending}
                type="submit"
              >
                <span>{send.isPending ? "Sending OTP…" : "Send OTP Verification"}</span>
                <ArrowRight className="size-[18px] shrink-0" />
              </button>
            )}

            {otpSent && (
              <div className="space-y-space-sm rounded-lg bg-surface-container-low p-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-primary">Enter {OTP_LENGTH}-Digit Code</span>
                  {countdown.seconds > 0 ? (
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Resend in {formatCountdown(countdown.seconds)}</span>
                  ) : (
                    <button
                      className="font-label-sm text-label-sm text-primary hover:underline disabled:opacity-60"
                      disabled={send.isPending}
                      type="button"
                      onClick={requestOtp}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <OtpInput className="flex justify-center gap-space-sm" inputClassName={OTP_BOX} value={otp} onChange={setOtp} />
                <DemoOtpHint />
                <button
                  className="mt-space-xs h-10 w-full rounded-lg bg-primary font-label-md text-label-md text-on-primary shadow-xs hover:shadow-sm disabled:opacity-70"
                  disabled={verify.isPending || otp.some((d) => !d)}
                  type="button"
                  onClick={() => verify.mutate({ phone, otp: otp.join("") })}
                >
                  {verify.isPending ? "Verifying…" : "Verify & Enter Portal"}
                </button>
                <button
                  className="w-full font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    countdown.start(0);
                    verify.reset();
                  }}
                >
                  Change mobile number
                </button>
              </div>
            )}

            {error && (
              <p className="flex items-center gap-space-xs font-body-sm text-body-sm text-error" role="alert">
                <CircleAlert className="size-4 shrink-0" />
                {error}
              </p>
            )}
          </form>

          <div className="flex items-center justify-between border-t border-outline-variant/30 pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <span>Having trouble?</span>
            <Link className="inline-flex items-center gap-space-xs font-semibold text-primary hover:underline" href={ROUTES.resetPassword}>
              <Headset className="size-4 shrink-0" />Student Support Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
