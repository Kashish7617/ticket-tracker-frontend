import { useState } from 'react';
import { errorMessage } from '../api/client';
import { ticketsApi } from '../api/tickets';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
} from '../api/types';

interface Props {
  tickets: Ticket[];
  loading: boolean;
  hasFilters: boolean;
  onChanged: (change: 'status' | 'delete') => void;
  onError: (message: string) => void;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function TicketList({ tickets, loading, hasFilters, onChanged, onError }: Props) {
  // Ids of rows with a request in flight, so we can disable just those controls.
  const [busy, setBusy] = useState<ReadonlySet<number>>(new Set());

  async function withBusy(
    id: number,
    change: 'status' | 'delete',
    action: () => Promise<unknown>,
  ) {
    setBusy((prev) => new Set(prev).add(id));
    try {
      await action();
      onChanged(change);
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setBusy((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function changeStatus(ticket: Ticket, status: TicketStatus) {
    if (status === ticket.status) return;
    void withBusy(ticket.id, 'status', () => ticketsApi.updateStatus(ticket.id, status));
  }

  function remove(ticket: Ticket) {
    if (!window.confirm(`Delete ticket #${ticket.id} "${ticket.title}"? This cannot be undone.`))
      return;
    void withBusy(ticket.id, 'delete', () => ticketsApi.remove(ticket.id));
  }

  if (!loading && tickets.length === 0) {
    return (
      <p className="empty">
        {hasFilters ? 'No tickets match these filters.' : 'No tickets yet. Create the first one.'}
      </p>
    );
  }

  return (
    <ul className={loading ? 'ticket-list is-refreshing' : 'ticket-list'} aria-busy={loading}>
      {tickets.map((ticket) => {
        const isBusy = busy.has(ticket.id);
        return (
          <li key={ticket.id} className="ticket">
            <div className="ticket-main">
              <div className="ticket-title-row">
                <span className="ticket-id">#{ticket.id}</span>
                <h3 className="ticket-title">{ticket.title}</h3>
              </div>
              {ticket.description && <p className="ticket-desc">{ticket.description}</p>}
              <div className="ticket-meta">
                <span className={`badge badge-${ticket.priority}`}>
                  {PRIORITY_LABELS[ticket.priority]}
                </span>
                <span title={`Updated ${dateFormat.format(new Date(ticket.updatedAt))}`}>
                  Created {dateFormat.format(new Date(ticket.createdAt))}
                </span>
              </div>
            </div>

            <div className="ticket-actions">
              <label className="visually-hidden" htmlFor={`status-${ticket.id}`}>
                Status for ticket {ticket.id}
              </label>
              <select
                id={`status-${ticket.id}`}
                className={`status-select status-${ticket.status}`}
                value={ticket.status}
                disabled={isBusy}
                onChange={(e) => changeStatus(ticket, e.target.value as TicketStatus)}
              >
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isBusy}
                onClick={() => remove(ticket)}
                aria-label={`Delete ticket ${ticket.id}`}
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
