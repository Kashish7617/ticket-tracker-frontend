import {
  DESCRIPTION_MAX_LENGTH,
  TICKET_PRIORITIES,
  TITLE_MAX_LENGTH,
  type TicketPriority,
} from './api/types';

export interface TicketFormValues {
  title: string;
  description: string;
  priority: TicketPriority;
}

export type TicketFormErrors = Partial<Record<keyof TicketFormValues, string>>;

/** Client-side rules mirror the server's so most mistakes never leave the browser. */
export function validateTicketForm(values: TicketFormValues): TicketFormErrors {
  const errors: TicketFormErrors = {};
  const title = values.title.trim();

  if (!title) errors.title = 'Title is required.';
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Title must be at most ${TITLE_MAX_LENGTH} characters.`;

  if (values.description.length > DESCRIPTION_MAX_LENGTH)
    errors.description = `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`;

  if (!TICKET_PRIORITIES.includes(values.priority)) errors.priority = 'Choose a priority.';

  return errors;
}
