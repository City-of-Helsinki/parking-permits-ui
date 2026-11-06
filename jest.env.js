// Loads environment variables for the Jest test run so that code relying on
// getEnv(process.env.REACT_APP_*) has values available. Runs before the test
// framework is set up (wired via `setupFiles` in jest.config.js).
const dotenv = require('dotenv');
const { TextDecoder, TextEncoder } = require('node:util');

Object.assign(globalThis, { TextDecoder, TextEncoder });

dotenv.config({ path: '.env.test' });
