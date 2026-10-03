'use client';

import { useState } from 'react';
import Link from 'next/link';
import { inquiries } from '@/lib/api';

export default function ContactForm() {
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  function validate(form) {
    const e = {};
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();
    if (!name) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!subject) e.subject = 'Subject is required';
    if (!message) e.message = 'Message is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitError('');
    setStatus('sending');

    const result = await inquiries.contact({
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    });

    if (result && result.ok) {
      setStatus('success');
      form.reset();
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('idle');
      setSubmitError((result && result.error) || 'Something went wrong. Please try again or email hello@teakle.in.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form reveal" suppressHydrationWarning noValidate>
      <div className="form-two-col">
        <div className="form-row">
          <label htmlFor="contactName">Name <span className="required" aria-hidden="true">*</span></label>
          <input type="text" id="contactName" name="name" required aria-required="true" aria-invalid={!!errors.name} />
          {errors.name && <span className="form-error" role="alert">{errors.name}</span>}
        </div>
        <div className="form-row">
          <label htmlFor="contactEmail">Email <span className="required" aria-hidden="true">*</span></label>
          <input type="email" id="contactEmail" name="email" required aria-required="true" aria-invalid={!!errors.email} />
          {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="contactSubject">Subject <span className="required" aria-hidden="true">*</span></label>
        <input type="text" id="contactSubject" name="subject" required aria-required="true" aria-invalid={!!errors.subject} />
        {errors.subject && <span className="form-error" role="alert">{errors.subject}</span>}
      </div>
      <div className="form-row">
        <label htmlFor="contactMessage">Message <span className="required" aria-hidden="true">*</span></label>
        <textarea id="contactMessage" name="message" required aria-required="true" aria-invalid={!!errors.message}></textarea>
        {errors.message && <span className="form-error" role="alert">{errors.message}</span>}
      </div>
      <button type="submit" className="btn-primary contact-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
      {submitError ? <p className="form-error" role="alert" style={{ marginTop: '0.5rem' }}>{submitError}</p> : null}
      <p className="form-privacy-note">By submitting this form, you acknowledge that your information will be handled in accordance with our <Link href="/privacy">Privacy Policy</Link>.</p>
      {status === 'success' && (
        <p className="contact-form-status is-visible" role="status">
          Message received. We will reply within two working days.
        </p>
      )}
    </form>
  );
}
