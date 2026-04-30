// Vercel Speed Insights Integration
import { injectSpeedInsights } from './node_modules/@vercel/speed-insights/dist/index.mjs';

// Inject Vercel Speed Insights script
injectSpeedInsights({
  debug: false // Set to true to enable debug logging in development
});
