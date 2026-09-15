import { setupWorker } from 'msw/browser';
import { apiHandlers } from './handlers';

export const worker = setupWorker(...apiHandlers);
