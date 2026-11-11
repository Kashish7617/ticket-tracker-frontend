import { useCallback, useState } from 'react';
import { ticketsApi } from './api/tickets';
import type { TicketStatus } from './api/types';
import { CreateTicketForm } from './components/CreateTicketForm';
import { Pagination } from './components/Pagination';
import { SummaryPanel } from './components/SummaryPanel';
import { TicketFilters } from './components/TicketFilters';
import { TicketList } from './components/TicketList';
import { useAsync } from './hooks/useAsync';
import { useDebouncedValue } from './hooks/useDebouncedValue';

const PAGE_SIZE = 10;

export default function App() {
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // Bumped after any mutation so the list and the summary refetch.
  const [version, setVersion] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const loadTickets = useCallback(
    (signal: AbortSignal) =>
      ticketsApi.list(
        { status: status || undefined, search: debouncedSearch, page, pageSize: PAGE_SIZE },
        signal,
      ),
    // `version` is not read inside, but changing it must trigger a refetch.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [status, debouncedSearch, page, version],
  );
  const loadSummary = useCallback(
    (signal: AbortSignal) => ticketsApi.summary(signal),
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
  const tickets = useAsync(loadTickets);
  const summary = useAsync(loadSummary);

  const refresh = useCallback(() => {
    setActionError(null);
    setVersion((v) => v + 1);
  }, []);

  const handleChanged = useCallback(
    (change: 'status' | 'delete') => {
      // Deleting the only ticket on the last page: step back so we don't show an empty page.
      if (change === 'delete' && page > 1 && tickets.data?.items.length === 1) {
        setPage(page - 1);
      }
      refresh();
    },
    [page, tickets.data, refresh],
  );

  const totalPages = tickets.data?.totalPages ?? 0;
  const hasFilters = Boolean(status || debouncedSearch);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Support Ticket Tracker</h1>
        <p>Track, triage and close customer issues.</p>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <CreateTicketForm
            onCreated={() => {
              setPage(1);
              refresh();
            }}
          />
          <SummaryPanel summary={summary.data} loading={summary.loading} error={summary.error} />
        </aside>

        <section className="card tickets" aria-labelledby="tickets-heading">
          <div className="tickets-header">
            <h2 id="tickets-heading">Tickets</h2>
            {tickets.loading && (
              <span className="spinner" role="status" aria-label="Loading tickets" />
            )}
          </div>

          <TicketFilters
            status={status}
            search={search}
            onStatusChange={(s) => {
              setStatus(s);
              setPage(1);
            }}
            onSearchChange={(s) => {
              setSearch(s);
              setPage(1);
            }}
          />

          {actionError && (
            <div className="alert alert-error" role="alert">
              <span>{actionError}</span>
              <button type="button" className="btn-link" onClick={() => setActionError(null)}>
                Dismiss
              </button>
            </div>
          )}

          {tickets.error ? (
            <div className="alert alert-error" role="alert">
              <span>Couldn't load tickets: {tickets.error}</span>
              <button type="button" className="btn" onClick={refresh}>
                Retry
              </button>
            </div>
          ) : !tickets.data && tickets.loading ? (
            <div className="skeleton-list" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          ) : (
            <>
              <TicketList
                tickets={tickets.data?.items ?? []}
                loading={tickets.loading}
                hasFilters={hasFilters}
                onChanged={handleChanged}
                onError={setActionError}
              />
              <Pagination
                page={tickets.data?.page ?? page}
                totalPages={totalPages}
                totalCount={tickets.data?.totalCount ?? 0}
                disabled={tickets.loading}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
