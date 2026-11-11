import { useState, type FormEvent } from 'react';
import { ApiError, errorMessage } from '../api/client';
import { ticketsApi } from '../api/tickets';
import {
  DESCRIPTION_MAX_LENGTH,
  PRIORITY_LABELS,
  TICKET_PRIORITIES,
  TITLE_MAX_LENGTH,
  type Ticket,
  type TicketPriority,
} from '../api/types';
import { validateTicketForm, type TicketFormErrors, type TicketFormValues } from '../validation';

const EMPTY: TicketFormValues = { title: '', description: '', priority: 'medium' };

interface Props {
  onCreated: (ticket: Ticket) => void;
}

export function CreateTicketForm({ onCreated }: Props) {
  const [values, setValues] = useState<TicketFormValues>(EMPTY);
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TicketFormValues, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof TicketFormValues>(key: K, value: TicketFormValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) setErrors(validateTicketForm(next));
  }

  function blur(key: keyof TicketFormValues) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateTicketForm(values));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validation = validateTicketForm(values);
    setErrors(validation);
    setTouched({ title: true, description: true, priority: true });
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await ticketsApi.create({
        title: values.title.trim(),
        description: values.description.trim() || null,
        priority: values.priority,
      });
      setValues(EMPTY);
      setTouched({});
      setErrors({});
      onCreated(created);
    } catch (err) {
      // Surface server-side validation messages next to the matching fields.
      if (err instanceof ApiError && err.status === 400) {
        const fields = err.fieldErrors;
        setErrors({
          title: fields.title?.[0],
          description: fields.description?.[0],
          priority: fields.priority?.[0],
        });
      }
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate aria-labelledby="create-heading">
      <h2 id="create-heading">New ticket</h2>

      <div className="field">
        <label htmlFor="title">
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          onBlur={() => blur('title')}
          aria-invalid={Boolean(errors.title)}
          aria-describedby="title-hint title-error"
          placeholder="Short summary of the problem"
        />
        <div className="field-meta">
          {errors.title ? (
            <span id="title-error" className="field-error" role="alert">
              {errors.title}
            </span>
          ) : (
            <span />
          )}
          <span
            id="title-hint"
            className={values.title.trim().length > TITLE_MAX_LENGTH ? 'counter over' : 'counter'}
          >
            {values.title.trim().length}/{TITLE_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          onBlur={() => blur('description')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby="description-error"
          placeholder="Steps to reproduce, customer impact, links…"
        />
        {errors.description && (
          <span id="description-error" className="field-error" role="alert">
            {errors.description}
          </span>
        )}
        {values.description.length > DESCRIPTION_MAX_LENGTH * 0.9 && (
          <span className="counter">
            {values.description.length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={values.priority}
          onChange={(e) => update('priority', e.target.value as TicketPriority)}
          aria-invalid={Boolean(errors.priority)}
        >
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        {errors.priority && <span className="field-error">{errors.priority}</span>}
      </div>

      {submitError && (
        <div className="alert alert-error" role="alert">
          {submitError}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create ticket'}
      </button>
    </form>
  );
}
