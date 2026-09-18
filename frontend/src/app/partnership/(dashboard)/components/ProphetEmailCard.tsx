'use client';

import { FormEvent, useId, useState } from 'react';
import { ArrowLeft, Loader2, Mail, Send } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { ensureCsrfToken } from '../../../lib/csrf';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';

export function ProphetEmailCard() {
  const { user } = useAuth();
  const id = useId();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });

  if (!user?.isPartner) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    setSuccess('');
    if (!form.fullName.trim() || !form.phone.trim() || form.message.trim().length < 10) {
      setError('Please enter your name, phone number, and a message of at least 10 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await ensureCsrfToken();
      const response = await fetch('/api/contactmessages/prophet/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': token },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const validationError = data && Object.values(data).find(Array.isArray);
        throw new Error(
          data?.detail ||
            data?.error ||
            (validationError && validationError.join(' ')) ||
            'Your message could not be sent. Please try again.'
        );
      }
      setForm((current) => ({ ...current, message: '' }));
      setShowForm(false);
      setSuccess('Your message has been sent to the Prophet.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to send your message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm p-6" aria-labelledby={`${id}-title`}>
      <div className="flex items-center gap-2 mb-3">
        {showForm ? (
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setError('');
            }}
            disabled={isSubmitting}
            aria-label="Back to email the Prophet"
            className="text-gray-400 hover:text-purple-600 disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Mail className="h-5 w-5 text-purple-600 shrink-0" />
        )}
        <h2 id={`${id}-title`} className="text-lg font-semibold text-gray-900">
          Email the Prophet
        </h2>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        Send a personal message to Prophet Namara Ernest.
      </p>
      <p className="text-xs text-purple-600 break-all mb-4">prophet@prophetnamara.com</p>
      {success && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}
      {!showForm ? (
        <Button
          type="button"
          onClick={() => {
            setShowForm(true);
            setSuccess('');
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
          <div>
            <Label htmlFor={`${id}-name`}>Full Name</Label>
            <Input
              id={`${id}-name`}
              autoComplete="name"
              required
              maxLength={100}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              disabled={isSubmitting}
              className="mt-1"
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor={`${id}-email`}>Email Address</Label>
            <Input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isSubmitting}
              className="mt-1"
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <Label htmlFor={`${id}-phone`}>Phone Number</Label>
            <Input
              id={`${id}-phone`}
              type="tel"
              autoComplete="tel"
              required
              maxLength={200}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={isSubmitting}
              className="mt-1"
              placeholder="+256 775 123 456"
            />
          </div>
          <div>
            <Label htmlFor={`${id}-message`}>Message</Label>
            <Textarea
              id={`${id}-message`}
              required
              minLength={10}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              disabled={isSubmitting}
              className="mt-1 resize-y"
              placeholder="Your message to the Prophet"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      )}
    </section>
  );
}
