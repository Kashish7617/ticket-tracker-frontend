import { STATUS_LABELS, TICKET_STATUSES, type TicketStatus } from '../api/types';

interface Props {
  status: TicketStatus | '';
  search: string;
  onStatusChange: (status: TicketStatus | '') => void;
  onSearchChange: (search: string) => void;
}

export function TicketFilters({ status, search, onStatusChange, onSearchChange }: Props) {
  return (
    <div className="filters" role="search">
      <div className="field">
        <label htmlFor="search">Search title</label>
        <input
          id="search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g. login"
          maxLength={120}
        />
      </div>
      <div className="field">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as TicketStatus | '')}
        >
          <option value="">All statuses</option>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
