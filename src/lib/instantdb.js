import { init } from '@instantdb/react';

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID;

// Schema definition for saving complete Abitur calculations
const schema = {
  calculations: {
    id: 'string',
    name: 'string',  // User-friendly name for this calculation
    profileId: 'string',  // ID of selected profile (e.g., "humanities")
    profileName: 'string',  // Display name for easier access

    // Core subjects configuration
    coreEA1: 'string',
    coreEA2: 'string',
    coreGA: 'string',

    // Exam subjects (stored as JSON)
    examSubjects: 'string',  // JSON array of exam subject objects

    // All grades (stored as JSON)
    grades: 'string',  // JSON object with all semester grades

    // Exam results (stored as JSON)
    examResults: 'string',  // JSON object with exam predictions/results

    // Metadata
    createdAt: 'number',
    updatedAt: 'number',

    // Calculated results for quick preview
    finalGrade: 'number',
    totalPoints: 'number',
  },
};

// Initialize InstantDB
const db = init({
  appId: APP_ID,
  schema,
});

export { db };
