import { db } from '../lib/instantdb';
import { id } from '@instantdb/react';

/**
 * Saves a complete Abitur calculation to InstantDB
 */
export async function saveCalculation({
  name,
  profile,
  coreSubjects,
  examSubjects,
  additionalSubjects,
  grades,
  examResults,
  result,
  userId = null,
  userEmail = null,
  calculationId = null,
}) {
  const timestamp = Date.now();
  const calcId = calculationId || id();

  const calculationData = {
    id: calcId,
    name: name || `${profile.name} - ${new Date().toLocaleDateString('de-DE')}`,
    profileId: profile.id,
    profileName: profile.name,
    coreEA1: coreSubjects.coreEA1,
    coreEA2: coreSubjects.coreEA2,
    coreGA: coreSubjects.coreGA,
    examSubjects: JSON.stringify(examSubjects),
    additionalSubjects: JSON.stringify(additionalSubjects || {}),
    grades: JSON.stringify(grades),
    examResults: JSON.stringify(examResults || {}),
    userId,
    userEmail,
    createdAt: calculationId ? undefined : timestamp, // Only set on create
    updatedAt: timestamp,
    finalGrade: result?.finalGrade || null,
    totalPoints: result?.totalPoints || 0,
  };

  try {
    await db.transact([
      db.tx.calculations[calcId].update(calculationData),
    ]);

    return { success: true, id: calcId };
  } catch (error) {
    console.error('Error saving calculation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Loads a saved calculation from InstantDB
 */
export function parseCalculation(savedCalc) {
  try {
    const normalizeAdditionalSubjects = (value) => {
      if (!value) return { S1: [], S2: [], S3: [], S4: [] };

      const list = Array.isArray(value) ? value : Object.values(value).flat();
      const unique = new Map();
      list.forEach((subject) => {
        if (subject?.name && !unique.has(subject.name)) {
          unique.set(subject.name, subject);
        }
      });
      const shared = Array.from(unique.values());

      return {
        S1: shared,
        S2: shared,
        S3: shared,
        S4: shared,
      };
    };

    const parsedAdditionalSubjects = normalizeAdditionalSubjects(
      JSON.parse(savedCalc.additionalSubjects || '{}')
    );

    return {
      id: savedCalc.id,
      name: savedCalc.name,
      profileId: savedCalc.profileId,
      profileName: savedCalc.profileName,
      coreSubjects: {
        coreEA1: savedCalc.coreEA1,
        coreEA2: savedCalc.coreEA2,
        coreGA: savedCalc.coreGA,
      },
      examSubjects: JSON.parse(savedCalc.examSubjects),
      additionalSubjects: parsedAdditionalSubjects,
      grades: JSON.parse(savedCalc.grades),
      examResults: JSON.parse(savedCalc.examResults),
      userId: savedCalc.userId,
      userEmail: savedCalc.userEmail,
      createdAt: savedCalc.createdAt,
      updatedAt: savedCalc.updatedAt,
      finalGrade: savedCalc.finalGrade,
      totalPoints: savedCalc.totalPoints,
    };
  } catch (error) {
    console.error('Error parsing calculation:', error);
    return null;
  }
}

/**
 * Deletes a saved calculation
 */
export async function deleteCalculation(calculationId) {
  try {
    await db.transact([
      db.tx.calculations[calculationId].delete(),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error deleting calculation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates the name of a saved calculation
 */
export async function renameCalculation(calculationId, newName) {
  try {
    await db.transact([
      db.tx.calculations[calculationId].update({
        name: newName,
        updatedAt: Date.now(),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error renaming calculation:', error);
    return { success: false, error: error.message };
  }
}
