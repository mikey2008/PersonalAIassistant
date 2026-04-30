// Vercel Speed Insights Integration
import { injectSpeedInsights } from './node_modules/@vercel/speed-insights/dist/index.mjs';

// Inject Vercel Speed Insights script
injectSpeedInsights({
  // Automatically detect environment (production/development)
});
