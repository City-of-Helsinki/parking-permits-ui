// Loads environment variables for the Jest test run so that code relying on
// getEnv(process.env.REACT_APP_*) has values available. Runs before the test
// framework is set up (wired via `setupFiles` in jest.config.js).
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });
