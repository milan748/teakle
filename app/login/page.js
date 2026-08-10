'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { customerAuth } from '@/lib/api';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const otpInputRef = useRef(null);
  const pendingRef = useRef({ name: '', email: '', password: '' });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Teakle && window.Teakle.isLoggedIn()) {
      window.location.href = '/account';
    }
  }, []);

  function showError(msg) {
    setSuccessMsg('');
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }

  function showSuccess(msg) {
    setErrorMsg('');
    setSuccessMsg(msg);
  }

  function clearMessages() {
    setErrorMsg('');
    setSuccessMsg('');
  }

  function showOTP(email) {
    setOtpEmail(email);
    setShowOtp(true);
    setOtpValue('');
    setTimeout(() => otpInputRef.current?.focus(), 300);
  }

  function sendOTP() {
    const otp = window.Teakle.generateOTP(pendingRef.current.email);
    alert('Your verification code is: ' + otp);
    showOTP(pendingRef.current.email);
  }

  async function handleLogin(e) {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    const email = loginEmail.trim();
    const password = loginPassword;

    const serverResult = await customerAuth.login(email, password);
    if (serverResult && serverResult.ok) {
      localStorage.setItem('teakle_currentUser', JSON.stringify(serverResult.customer));
      showSuccess('Signed in successfully. Redirecting to your account...');
      setTimeout(() => { window.location.href = '/account'; }, 1200);
      return;
    }

    const result = window.Teakle.login(email, password);
    if (result.ok) {
      showSuccess('Signed in successfully. Redirecting to your account...');
      setTimeout(() => { window.location.href = '/account'; }, 1200);
    } else {
      setIsLoading(false);
      showError(result.msg);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    clearMessages();
    const name = regName.trim();
    const email = regEmail.trim();
    const password = regPassword;
    const confirm = regConfirm;
    if (password !== confirm) {
      showError('Passwords do not match.');
      return;
    }

    const serverResult = await customerAuth.register(name, email, password, confirm);
    if (serverResult && serverResult.ok) {
      localStorage.setItem('teakle_currentUser', JSON.stringify(serverResult.customer));
      showSuccess('Account created. Welcome to Teakle.');
      setTimeout(() => { window.location.href = '/account'; }, 1200);
      return;
    }

    if (serverResult && serverResult.error) {
      showError(serverResult.error);
      return;
    }

    pendingRef.current = { name, email, password };
    sendOTP();
  }

  function handleOtpVerify() {
    clearMessages();
    setIsLoading(true);
    const otp = otpValue.trim();
    if (otp.length !== 6) {
      setIsLoading(false);
      showError('Please enter a 6-digit code.');
      return;
    }
    const result = window.Teakle.verifyOTP(pendingRef.current.email, otp);
    setTimeout(() => {
      if (result.ok) {
        const reg = window.Teakle.register(
          pendingRef.current.name,
          pendingRef.current.email,
          pendingRef.current.password
        );
        if (reg.ok) {
          showSuccess('Account created. Welcome to Teakle.');
          setTimeout(() => { window.location.href = '/account'; }, 1200);
        } else {
          setIsLoading(false);
          showError(reg.msg);
        }
      } else {
        setIsLoading(false);
        showError(result.msg);
      }
    }, 800);
  }

  function handleOtpResend(e) {
    e.preventDefault();
    clearMessages();
    sendOTP();
  }

  return (
    <>
      <title>Sign In — Teakle</title>
      <style>{`
        /* ============================================
           LOGIN — Private Atelier Experience
           ============================================ */

        /* --- Background Layer --- */
        .auth-section {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 1.5rem;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
          animation: bgFadeIn 800ms var(--ease) both;
        }

        @keyframes bgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Warm light sweep */
        .auth-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 30% 40%, rgba(167,134,89,0.06) 0%, transparent 60%);
          animation: lightSweep 20s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes lightSweep {
          0% { transform: translate(0, 0); }
          100% { transform: translate(8%, 5%); }
        }

        /* Wood dust particles */
        .auth-dust {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .dust-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--bronze);
          border-radius: 50%;
          opacity: 0;
          animation: dustFloat linear infinite;
        }
        .dust-particle:nth-child(1) { left: 15%; animation-duration: 18s; animation-delay: 0s; }
        .dust-particle:nth-child(2) { left: 35%; animation-duration: 22s; animation-delay: 3s; }
        .dust-particle:nth-child(3) { left: 55%; animation-duration: 16s; animation-delay: 6s; }
        .dust-particle:nth-child(4) { left: 75%; animation-duration: 20s; animation-delay: 2s; }
        .dust-particle:nth-child(5) { left: 25%; animation-duration: 24s; animation-delay: 8s; }
        .dust-particle:nth-child(6) { left: 65%; animation-duration: 19s; animation-delay: 5s; }
        .dust-particle:nth-child(7) { left: 45%; animation-duration: 21s; animation-delay: 1s; }
        .dust-particle:nth-child(8) { left: 85%; animation-duration: 17s; animation-delay: 7s; }

        @keyframes dustFloat {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 0.12; }
          90% { opacity: 0.12; }
          100% { transform: translateY(-10vh) translateX(30px); opacity: 0; }
        }

        /* Subtle wood grain texture */
        .auth-grain {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(43,34,27,0.15) 2px,
            rgba(43,34,27,0.15) 3px
          );
          animation: grainShift 30s linear infinite;
        }

        @keyframes grainShift {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }

        /* Vignette */
        .auth-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 50%, rgba(43,34,27,0.08) 100%);
          pointer-events: none;
        }

        /* --- Auth Card --- */
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--bg-primary);
          padding: 3rem 2.5rem;
          border: 1px solid rgba(43,34,27,0.06);
          position: relative;
          z-index: 1;
          animation: cardRise 800ms var(--ease) 200ms both;
        }

        @keyframes cardRise {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Brand --- */
        .auth-brand {
          text-align: center;
          margin-bottom: 2.5rem;
          animation: fadeSlideIn 600ms var(--ease) 400ms both;
        }

        .auth-logo {
          display: block;
          width: 48px;
          height: auto;
          margin: 0 auto 1.5rem;
          opacity: 0.85;
        }

        .auth-brand-line {
          width: 36px;
          height: 1px;
          background: var(--bronze);
          margin: 0 auto;
          opacity: 0.5;
        }

        /* --- Heading --- */
        .auth-heading {
          text-align: center;
          margin-bottom: 0.5rem;
          animation: fadeSlideIn 600ms var(--ease) 500ms both;
        }

        .auth-heading h1 {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 3vw, var(--text-h2));
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          margin: 0;
          max-width: none;
        }

        .auth-subtitle {
          text-align: center;
          font-size: var(--text-body);
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: var(--lh-relaxed);
          max-width: none;
          animation: fadeSlideIn 600ms var(--ease) 550ms both;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Tabs --- */
        .auth-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(43,34,27,0.08);
          position: relative;
          animation: fadeSlideIn 600ms var(--ease) 600ms both;
        }

        .auth-tabs button {
          flex: 1;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 0.875rem 0;
          position: relative;
          transition: color var(--dur-fast) var(--ease);
        }

        .auth-tabs button:hover { color: var(--text-primary); }

        .auth-tabs button::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1.5px;
          background: var(--bronze);
          transform: scaleX(0);
          transition: transform 350ms var(--ease);
        }

        .auth-tabs button.is-active {
          color: var(--text-primary);
        }

        .auth-tabs button.is-active::after {
          transform: scaleX(1);
        }

        /* --- Forms --- */
        .auth-forms-wrapper {
          position: relative;
          animation: fadeSlideIn 600ms var(--ease) 650ms both;
        }

        .auth-form {
          display: none;
          opacity: 0;
        }

        .auth-form.is-active {
          display: block;
          animation: formFadeIn 400ms var(--ease) forwards;
        }

        @keyframes formFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* --- Form Groups --- */
        .form-group {
          margin-bottom: 1.25rem;
          opacity: 0;
          animation: fieldAppear 400ms var(--ease) forwards;
        }

        .auth-form.is-active .form-group:nth-child(1) { animation-delay: 100ms; }
        .auth-form.is-active .form-group:nth-child(2) { animation-delay: 160ms; }
        .auth-form.is-active .form-group:nth-child(3) { animation-delay: 220ms; }
        .auth-form.is-active .form-group:nth-child(4) { animation-delay: 280ms; }
        .auth-form.is-active .form-group:nth-child(5) { animation-delay: 340ms; }

        @keyframes fieldAppear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-group label {
          display: block;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem 0;
          font-family: var(--font-body);
          font-size: var(--text-body);
          color: var(--text-primary);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--stone);
          outline: none;
          transition: border-color 300ms var(--ease);
          min-height: 48px;
        }

        .form-group input::placeholder {
          color: var(--stone);
          font-weight: 400;
          transition: transform 300ms var(--ease), font-size 300ms var(--ease);
        }

        .form-group input:focus::placeholder {
          transform: translateY(-2px);
          font-size: 0.7rem;
          opacity: 0.6;
        }

        .form-group input:focus {
          border-bottom-color: var(--bronze);
        }

        /* Warm accent line */
        .input-accent {
          position: relative;
        }

        .input-accent::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1.5px;
          background: var(--bronze);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 350ms var(--ease);
        }

        .input-accent:focus-within::after {
          transform: scaleX(1);
        }

        /* --- Options Row --- */
        .auth-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fieldAppear 400ms var(--ease) 400ms forwards;
        }

        .auth-remember {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        .auth-remember input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border: 1px solid var(--stone);
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          transition: border-color 250ms var(--ease), background 250ms var(--ease);
        }

        .auth-remember input[type="checkbox"]:checked {
          background: var(--bronze);
          border-color: var(--bronze);
        }

        .auth-remember input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1px;
          width: 5px;
          height: 9px;
          border: solid var(--bg-primary);
          border-width: 0 1.5px 1.5px 0;
          transform: rotate(45deg) scale(0);
          animation: checkPop 250ms var(--ease) 100ms forwards;
        }

        @keyframes checkPop {
          to { transform: rotate(45deg) scale(1); }
        }

        .auth-remember span {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }

        .auth-forgot {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          text-decoration: none;
          letter-spacing: 0.02em;
          position: relative;
          transition: color var(--dur-fast) var(--ease);
        }

        .auth-forgot::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--bronze);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease);
        }

        .auth-forgot:hover { color: var(--bronze); }
        .auth-forgot:hover::after { transform: scaleX(1); }

        /* --- Submit Button --- */
        .auth-submit-wrapper {
          opacity: 0;
          animation: fieldAppear 400ms var(--ease) 460ms forwards;
        }

        .auth-submit {
          width: 100%;
          padding: 0.9375rem;
          font-family: var(--font-body);
          font-size: var(--text-caption);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--bg-primary);
          background: var(--walnut);
          border: 1px solid var(--walnut);
          cursor: pointer;
          transition: background 250ms var(--ease), transform 250ms var(--ease), box-shadow 250ms var(--ease), opacity 250ms var(--ease);
          min-height: 52px;
          position: relative;
          overflow: hidden;
        }

        .auth-submit:hover:not(:disabled) {
          background: #3d2e23;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(43,34,27,0.2);
        }

        .auth-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 6px rgba(43,34,27,0.15);
        }

        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-submit:focus-visible {
          outline: 2px solid var(--bronze);
          outline-offset: 3px;
        }

        /* Loading spinner */
        .auth-submit .btn-text { transition: opacity 200ms var(--ease); }
        .auth-submit.is-loading .btn-text { opacity: 0; }

        .auth-submit .btn-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          border: 2px solid rgba(247,244,238,0.3);
          border-top-color: var(--bg-primary);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 200ms var(--ease);
        }

        .auth-submit.is-loading .btn-spinner {
          opacity: 1;
          animation: spin 600ms linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* --- Error / Success --- */
        .auth-message {
          text-align: center;
          font-size: var(--text-caption);
          margin-bottom: 1rem;
          max-width: none;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 350ms var(--ease), opacity 250ms var(--ease), padding 350ms var(--ease), margin 350ms var(--ease);
          padding: 0;
          margin-bottom: 0;
        }

        .auth-message.is-visible {
          max-height: 80px;
          opacity: 1;
          padding: 0.625rem 1rem;
          margin-bottom: 1rem;
        }

        .auth-message.is-error {
          color: #8B6B4A;
          background: rgba(167,134,89,0.08);
          border-left: 2px solid var(--bronze);
        }

        .auth-message.is-success {
          color: var(--forest);
          background: rgba(29,53,40,0.06);
          border-left: 2px solid var(--forest);
        }

        .auth-message.is-shake {
          animation: gentleShake 500ms var(--ease);
        }

        @keyframes gentleShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }

        /* --- OTP Section --- */
        .otp-section {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 400ms var(--ease), opacity 400ms var(--ease);
        }

        .otp-section.is-visible {
          max-height: 400px;
          opacity: 1;
        }

        .otp-info {
          font-size: var(--text-body);
          color: var(--text-secondary);
          margin-bottom: 1rem;
          text-align: center;
          max-width: none;
          line-height: var(--lh-relaxed);
        }

        .otp-info strong { color: var(--text-primary); font-weight: 500; }

        .otp-resend {
          text-align: center;
          margin-top: 1rem;
          font-size: var(--text-caption);
          color: var(--text-secondary);
        }

        .otp-resend a {
          color: var(--bronze);
          cursor: pointer;
          position: relative;
          transition: color var(--dur-fast) var(--ease);
        }

        .otp-resend a::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--bronze);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease);
        }

        .otp-resend a:hover::after { transform: scaleX(1); }
        .otp-resend a:active { opacity: 0.7; }

        /* --- Footer --- */
        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(43,34,27,0.06);
          animation: fadeSlideIn 600ms var(--ease) 700ms both;
        }

        .auth-footer a {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          text-decoration: none;
          letter-spacing: 0.04em;
          position: relative;
          transition: color var(--dur-fast) var(--ease);
        }

        .auth-footer a::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--bronze);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms var(--ease);
        }

        .auth-footer a:hover { color: var(--bronze); }
        .auth-footer a:hover::after { transform: scaleX(1); }

        /* --- Reduced Motion --- */
        @media (prefers-reduced-motion: reduce) {
          .auth-section, .auth-card, .auth-brand, .auth-heading,
          .auth-subtitle, .auth-tabs, .auth-forms-wrapper,
          .auth-footer, .form-group, .auth-options,
          .auth-submit-wrapper, .dust-particle, .auth-grain,
          .auth-section::before {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* --- Responsive --- */
        @media (max-width: 860px) {
          .auth-section { padding: 5rem 1.25rem 3rem; }
          .auth-card { padding: 2.5rem 2rem; }
        }

        @media (max-width: 560px) {
          .auth-section { padding: 4rem 1rem 2rem; }
          .auth-card { padding: 2rem 1.5rem; }
          .auth-brand { margin-bottom: 2rem; }
          .auth-logo { width: 40px; }
        }

        @media (max-width: 430px) {
          .auth-section { padding: 3.5rem 1rem 1.5rem; }
          .auth-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>

      <section className="auth-section">
        {/* Background layers */}
        <div className="auth-dust">
          <div className="dust-particle"></div>
          <div className="dust-particle"></div>
          <div className="dust-particle"></div>
          <div className="dust-particle"></div>
          <div className="dust-particle"></div>
          <div className="dust-particle"></div>
          <div className="dust-particle"></div>
          <div className="dust-particle"></div>
        </div>
        <div className="auth-grain"></div>
        <div className="auth-vignette"></div>

        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <img src="/assets/logo-black.webp" alt="Teakle" className="auth-logo" />
            <div className="auth-brand-line"></div>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h1>{activeTab === 'login' ? 'Welcome Back' : 'Join Teakle'}</h1>
          </div>
          <p className="auth-subtitle">
            {activeTab === 'login'
              ? 'Sign in to manage your collection.'
              : 'Create an account to begin your collection.'}
          </p>

          {/* Tabs */}
          <div className="auth-tabs" role="tablist" aria-label="Authentication method">
            <button
              className={activeTab === 'login' ? 'is-active' : ''}
              role="tab"
              aria-selected={activeTab === 'login'}
              onClick={() => { clearMessages(); setShowOtp(false); setActiveTab('login'); }}
            >
              Sign In
            </button>
            <button
              className={activeTab === 'register' ? 'is-active' : ''}
              role="tab"
              aria-selected={activeTab === 'register'}
              onClick={() => { clearMessages(); setShowOtp(false); setActiveTab('register'); }}
            >
              Create Account
            </button>
          </div>

          {/* Messages */}
          <p className={`auth-message is-error ${errorMsg ? 'is-visible' : ''} ${isShaking ? 'is-shake' : ''}`}>{errorMsg}</p>
          <p className={`auth-message is-success ${successMsg ? 'is-visible' : ''}`}>{successMsg}</p>

          {/* Forms */}
          <div className="auth-forms-wrapper">
            <form
              className={`auth-form ${activeTab === 'login' && !showOtp ? 'is-active' : ''}`}
              onSubmit={handleLogin}
            >
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <div className="input-accent">
                  <input
                    type="email"
                    id="loginEmail"
                    placeholder="you@example.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <div className="input-accent">
                  <input
                    type="password"
                    id="loginPassword"
                    placeholder="Your password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="auth-options">
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled
                    title="Requires Shopify customer accounts"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="auth-forgot" onClick={(e) => e.preventDefault()} title="Requires Shopify customer accounts">
                  Forgot password?
                </a>
              </div>
              <div className="auth-submit-wrapper">
                <button type="submit" className={`auth-submit ${isLoading ? 'is-loading' : ''}`} disabled={isLoading}>
                  <span className="btn-text">Sign In</span>
                  <span className="btn-spinner"></span>
                </button>
              </div>
            </form>

            <form
              className={`auth-form ${activeTab === 'register' && !showOtp ? 'is-active' : ''}`}
              onSubmit={handleRegister}
            >
              <div className="form-group">
                <label htmlFor="regName">Full Name</label>
                <div className="input-accent">
                  <input
                    type="text"
                    id="regName"
                    placeholder="Your name"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="regEmail">Email</label>
                <div className="input-accent">
                  <input
                    type="email"
                    id="regEmail"
                    placeholder="you@example.com"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="regPassword">Password</label>
                <div className="input-accent">
                  <input
                    type="password"
                    id="regPassword"
                    placeholder="Min 6 characters"
                    required
                    minLength="6"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="regConfirm">Confirm Password</label>
                <div className="input-accent">
                  <input
                    type="password"
                    id="regConfirm"
                    placeholder="Repeat password"
                    required
                    minLength="6"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                  />
                </div>
              </div>
              <div className="auth-submit-wrapper">
                <button type="submit" className={`auth-submit ${isLoading ? 'is-loading' : ''}`} disabled={isLoading}>
                  <span className="btn-text">Create Account</span>
                  <span className="btn-spinner"></span>
                </button>
              </div>
            </form>

            {/* OTP Section */}
            <div className={`otp-section ${showOtp ? 'is-visible' : ''}`}>
              <p className="otp-info">We sent a 6-digit code to <strong>{otpEmail}</strong></p>
              <div className="form-group" style={{ opacity: 1, animation: 'none' }}>
                <label htmlFor="otpInput">Verification Code</label>
                <div className="input-accent">
                  <input
                    ref={otpInputRef}
                    type="text"
                    id="otpInput"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    required
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="auth-submit-wrapper" style={{ opacity: 1, animation: 'none' }}>
                <button type="button" className={`auth-submit ${isLoading ? 'is-loading' : ''}`} disabled={isLoading} onClick={handleOtpVerify}>
                  <span className="btn-text">Verify &amp; Create Account</span>
                  <span className="btn-spinner"></span>
                </button>
              </div>
              <p className="otp-resend">
                Didn&apos;t receive it?{' '}
                <a href="#" onClick={handleOtpResend}>Resend code</a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <Link href="/">Back to home</Link>
          </div>
        </div>
      </section>
    </>
  );
}
