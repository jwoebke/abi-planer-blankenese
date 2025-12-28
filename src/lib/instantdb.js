import { init } from '@instantdb/react';

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID;

// Initialize InstantDB without schema (schema is managed in InstantDB dashboard)
// The schema will be automatically inferred when we write data
const db = init({
  appId: APP_ID,
});

export { db };
