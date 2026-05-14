// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Form, { type Field } from '../../../shared/components/Form';
import { forgotPasswordApi } from '../service/forgotPassword';

// ── Types ──────────────────────────────────────────────────
interface ForgotFormValues {
  email: string;
}

interface ForgotFormErrors {
  email?: string;
  [key: string]: string | undefined;
}

// ── Form fields ────────────────────────────────────────────
const FORGOT_FIELDS: Field[] = [
  {
    name:        'email',
    label:       'Email address',
    type:        'email',
    placeholder: 'Enter your registered email',
    required:    true,
    colSpan:     'full',
  },
];

// ── Medigo pill SVG ───────────────────────────────────────
const MedigoMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="10" y="18" width="44" height="28" rx="14" fill="white" />
    <path
      d="M22 28h20M22 36h20M22 44h12"
      stroke="#0B5E4F"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="46" cy="32" r="7" fill="#0B5E4F" />
  </svg>
);

// ── Envelope sent illustration ─────────────────────────────
const EmailSentIllustration: React.FC = () => (
  <div className="relative w-24 h-24 mx-auto mb-6">
    {/* Outer glow ring */}
    <div className="absolute inset-0 rounded-full bg-red-50 animate-ping opacity-30" />
    <div className="absolute inset-0 rounded-full bg-red-50" />

    {/* Icon */}
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    </div>

    {/* Check badge */}
    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-white">
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>
);

// ── Step indicator ─────────────────────────────────────────
const STEPS = ['Enter email', 'Check inbox', 'Reset password'];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {STEPS.map((label, i) => {
      const done    = i < current;
      const active  = i === current;
      const isLast  = i === STEPS.length - 1;

      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              transition-all duration-300
              ${done   ? 'bg-primary text-white'           : ''}
              ${active ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
              ${!done && !active ? 'bg-gray-100 text-dark/30 border border-gray-200' : ''}
            `}>
              {done ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap transition-colors duration-300
              ${active ? 'text-primary' : done ? 'text-dark/50' : 'text-dark/25'}`}>
              {label}
            </span>
          </div>

          {!isLast && (
            <div className={`h-px flex-1 mx-2 mb-4 transition-colors duration-500
              ${done ? 'bg-primary' : 'bg-gray-200'}`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Main Component ─────────────────────────────────────────
const ForgotPasswordPage: React.FC = () => {
  const [step, setStep]       = useState<0 | 1>(0); // 0 = form, 1 = success
  const [values, setValues]   = useState<ForgotFormValues>({ email: '' });
  const [errors, setErrors]   = useState<ForgotFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Validation ────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: ForgotFormErrors = {};
    const email = values.email.trim();

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (name: string, value: unknown) => {
    const nextValue = typeof value === "string" ? value : "";
    setValues((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await forgotPasswordApi(values.email.trim());
      setStep(1);
      setCountdown(60);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message;
      setApiError(msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await forgotPasswordApi(values.email.trim());
      setCountdown(60);
    } catch {
      // silent — email already shown
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── LEFT PANEL ──────────────────────────────────── */}
      <div
        className={`
          hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col relative
          bg-[#0F5E4F] overflow-hidden
          transition-all duration-700
          ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
        `}
      >
        {/* Background depth circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/30" />
          <div className="absolute -bottom-40 -right-20 w-[520px] h-[520px] rounded-full bg-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/15" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <MedigoMark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold text-xl tracking-tight">Medigo</p>
              <p className="text-xs uppercase text-white/70 tracking-[0.25em]">e-Pharmacy</p>
            </div>
          </div>

          {/* Illustration area */}
          <div className="mt-auto mb-auto flex flex-col gap-6 pt-16">
            {/* Big lock icon */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Forgot your<br />
              <span className="text-red-300">password?</span>
            </h1>

            <p className="text-white/70 text-base leading-relaxed max-w-xs">
              No worries — it happens. Enter your registered Medigo email and
              we'll send you a secure password reset link instantly.
            </p>

            {/* How it works */}
            <div className="flex flex-col gap-3 mt-2">
              {[
                { icon: '01', text: 'Enter your registered email address' },
                { icon: '02', text: 'Check your inbox for the reset link' },
                { icon: '03', text: 'Set a strong new password' },
              ].map(item => (
                <div key={item.icon} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary/80 w-6 shrink-0">{item.icon}</span>
                  <span className="text-white/70 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-auto text-white/30 text-xs">
            © 2026 Medigo e-Pharmacy. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────── */}
      <div
        className={`
          flex-1 flex flex-col items-center justify-center
          bg-[#FAF7F4] px-6 sm:px-10 py-12
          transition-all duration-700 delay-150
          ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
        `}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <MedigoMark className="w-4 h-4" />
          </div>
          <div className="text-sm font-bold text-dark">
            <div>Medigo</div>
            <div className="text-xs text-slate-500">e-Pharmacy</div>
          </div>
        </div>
        <div className="w-full max-w-[420px]">

          {/* Back to login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-dark/40 hover:text-dark/70 transition-colors mb-8 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to login
          </Link>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* ── STEP 0: FORM ── */}
          {step === 0 && (
            <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="mb-7">
                <h2 className="text-3xl font-bold text-dark tracking-tight">
                  Reset your<br />
                  <span className="text-primary">password</span>
                </h2>
                <p className="mt-2.5 text-sm text-dark/50 leading-relaxed">
                  We'll email you a secure link to reset your password. The link
                  expires in 15 minutes.
                </p>
              </div>

              {/* API error */}
              {apiError && (
                <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-primary/20 rounded-xs px-4 py-3">
                  <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-sm text-primary">{apiError}</p>
                </div>
              )}

              <Form
                fields={FORGOT_FIELDS}
                values={values}
                onChange={handleChange}
                onSubmit={handleSubmit}
                errors={errors as Record<string, string>}
                loading={loading}
                layout="single"
                submitText={
                  <span className="flex items-center justify-center gap-2">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                    {!loading && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                }
              />

              <p className="mt-5 text-center text-xs text-dark/35">
                Remember your password?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-2">
                  Sign in instead
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 1: SUCCESS ── */}
          {step === 1 && (
            <div className="text-center transition-all duration-500">
              <EmailSentIllustration />

              <h2 className="text-2xl font-bold text-dark">Check your inbox</h2>
              <p className="mt-3 text-sm text-dark/50 leading-relaxed max-w-sm mx-auto">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-dark">{values.email}</span>.
                It'll expire in 15 minutes.
              </p>

              {/* Email tips card */}
              <div className="mt-6 bg-white border border-gray-200 rounded-xs px-5 py-4 text-left space-y-2.5">
                <p className="text-xs font-semibold text-dark/60 uppercase tracking-wider">
                  Didn't receive it?
                </p>
                {[
                  'Check your spam or junk folder',
                  'Make sure you used your registered email',
                  'Allow up to 2 minutes for delivery',
                ].map(tip => (
                  <div key={tip} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-xs text-dark/50">{tip}</p>
                  </div>
                ))}
              </div>

              {/* Resend button */}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className={`
                  mt-5 w-full py-2.5 rounded-xs text-sm font-semibold
                  border transition-all duration-200
                  ${countdown > 0 || loading
                    ? 'border-gray-200 text-dark/25 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white cursor-pointer'}
                `}
              >
                {loading
                  ? 'Resending…'
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend email'}
              </button>

              {/* Try different email */}
              <button
                onClick={() => { setStep(0); setValues({ email: '' }); setErrors({}); }}
                className="mt-3 text-xs text-dark/35 hover:text-dark/60 transition-colors underline underline-offset-2"
              >
                Use a different email address
              </button>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Return to login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
