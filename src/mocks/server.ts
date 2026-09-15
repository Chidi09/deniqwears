import { setupServer } from 'msw/node';
import { gatewayHandlers } from './gateway-handlers';

/**
 * Node-side MSW server. Two callers:
 *  - instrumentation.ts starts this in dev when PAYMENT_MOCKING=enabled, so
 *    checkout/verify/webhook can be exercised without real gateway keys.
 *  - test setup (tests/setup.ts) starts/stops it around the test run.
 */
export const server = setupServer(...gatewayHandlers);
