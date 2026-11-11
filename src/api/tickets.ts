import { request } from './client';
import type {
  CreateTicketRequest,
  PagedResult,
  Ticket,
  TicketQuery,
  TicketStatus,
  TicketSummary,
} from './types';

export const ticketsApi = {
  list(query: TicketQuery, signal?: AbortSignal): Promise<PagedResult<Ticket>> {
    const params = new URLSearchParams({
      page: String(query.page),
      pageSize: String(query.pageSize),
    });
    if (query.status) params.set('status', query.status);
    if (query.search?.trim()) params.set('search', query.search.trim());
    return request(`/api/tickets?${params.toString()}`, { signal });
  },

  get(id: number, signal?: AbortSignal): Promise<Ticket> {
    return request(`/api/tickets/${id}`, { signal });
  },

  create(body: CreateTicketRequest): Promise<Ticket> {
    return request('/api/tickets', { method: 'POST', body: JSON.stringify(body) });
  },

  updateStatus(id: number, status: TicketStatus): Promise<Ticket> {
    return request(`/api/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  remove(id: number): Promise<void> {
    return request(`/api/tickets/${id}`, { method: 'DELETE' });
  },

  summary(signal?: AbortSignal): Promise<TicketSummary> {
    return request('/api/tickets/summary', { signal });
  },
};
