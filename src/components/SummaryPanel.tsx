import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketSummary,
} from '../api/types';

interface Props {
  summary: TicketSummary | null;
  loading: boolean;
  error: string | null;
}

interface Bar {
  key: string;
  label: string;
  count: number;
}

function BarGroup({ title, bars, total }: { title: string; bars: Bar[]; total: number }) {
  return (
    <div className="bar-group">
      <h3>{title}</h3>
      <ul className="bars">
        {bars.map((bar) => {
          const pct = total === 0 ? 0 : Math.round((bar.count / total) * 100);
          return (
            <li key={bar.key} className="bar-row">
              <span className="bar-label">{bar.label}</span>
              <span
                className="bar-track"
                role="meter"
                aria-label={`${bar.label}: ${bar.count} tickets`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={bar.count}
              >
                <span className={`bar-fill bar-${bar.key}`} style={{ width: `${pct}%` }} />
              </span>
              <span className="bar-count">{bar.count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SummaryPanel({ summary, loading, error }: Props) {
  return (
    <section className="card summary" aria-labelledby="summary-heading" aria-busy={loading}>
      <div className="summary-header">
        <h2 id="summary-heading">Summary</h2>
        {summary && <span className="summary-total">{summary.total} total</span>}
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          Couldn't load summary: {error}
        </div>
      )}

      {!summary && loading && <div className="skeleton" style={{ height: 160 }} />}

      {summary && (
        <div className={loading ? 'summary-body is-refreshing' : 'summary-body'}>
          <BarGroup
            title="By status"
            total={summary.total}
            bars={TICKET_STATUSES.map((s) => ({
              key: s,
              label: STATUS_LABELS[s],
              count: summary.byStatus[s] ?? 0,
            }))}
          />
          <BarGroup
            title="By priority"
            total={summary.total}
            bars={TICKET_PRIORITIES.map((p) => ({
              key: p,
              label: PRIORITY_LABELS[p],
              count: summary.byPriority[p] ?? 0,
            }))}
          />
        </div>
      )}
    </section>
  );
}
