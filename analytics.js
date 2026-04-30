// Vercel Web Analytics Integration
import { inject } from './node_modules/@vercel/analytics/dist/index.mjs';

// Inject Vercel Analytics script
inject({
  mode: 'auto', // Automatically detect environment (production/development)
  debug: false  // Enable debug logging in development if needed
});
