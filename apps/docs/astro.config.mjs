import { defineConfig } from 'astro/config';

// Local verification only: no integrations, no adapters, no site. The page renders what
// `@brikka-ui/tokens` publishes, so there is nothing here to configure. The dev toolbar is
// off because it floats over the inventory while it is being read, and this page exists to
// be looked at.
export default defineConfig({
  devToolbar: { enabled: false },
});
