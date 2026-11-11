// Typed models mirroring the backend contract (BE/src/TicketTracker.Api/Contracts).
// Enum values are serialized by the API as snake_case strings.

export const TICKET_STATUSES = ['open', 'in_progress', 'closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 4000;

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string; // ISO-8601 UTC
  updatedAt: string; // ISO-8601 UTC
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TicketSummary {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
}

export interface TicketQuery {
  status?: TicketStatus;
  search?: string;
  page: number;
  pageSize: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string | null;
  priority: TicketPriority;
}

/** RFC 9457 ProblemDetails, as returned by ASP.NET Core for errors. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}
