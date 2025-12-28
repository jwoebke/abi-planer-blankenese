import { useState, useCallback } from 'react';
import AbiturWizard from './components/AbiturWizard';
import GradeMatrix from './components/GradeMatrix';
import ResultsDashboard from './components/ResultsDashboard';
import SaveLoadManager from './components/SaveLoadManager';
import AuthButton from './components/AuthButton';
import { PROFILES } from './data/profiles';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [step, setStep] = useState('wizard'); // 'wizard', 'grades', 'results'
  const [wizardData, setWizardData] = useState(null); // { profile, coreSubjects, examSubjects, additionalSubjects }
  const [grades, setGrades] = useState(null);
  const [examResults, setExamResults] = useState(null);
  const [currentCalculationId, setCurrentCalculationId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);

  const createEmptyAdditionalSubjects = () => ({
    S1: [],
    S2: [],
    S3: [],
    S4: [],
  });

  const normalizeAdditionalSubjects = (value) => {
    if (!value) return createEmptyAdditionalSubjects();

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

  const handleWizardComplete = (data) => {
    setWizardData(data);
    setGrades(data?.grades || {});
    setExamResults(data?.examResults || {});
    setCurrentResult(data?.result || null);
    setStep('wizard');
  };

  const handleShowDetails = (data) => {
    setWizardData(data);
    setGrades(data?.grades || {});
    setExamResults(data?.examResults || {});
    setCurrentResult(data?.result || null);
    setStep('results');
  };

  const handleGradesComplete = (gradeData) => {
    setGrades(gradeData);
    setCurrentResult(null);
    setStep('results');
  };

  const handleBackToWizard = () => {
    setStep('wizard');
    setCurrentResult(null);
  };

  const handleBackToGrades = () => {
    setStep('wizard');
    setCurrentResult(null);
  };

  const handleLoad = (savedCalc) => {
    // Find the profile object from saved profileId
    const profile = Object.values(PROFILES).find(p => p.id === savedCalc.profileId);

    if (!profile) {
      alert('Profil nicht gefunden. Die Berechnung könnte mit einer älteren Version erstellt worden sein.');
      return;
    }

    // Restore all state
    setWizardData({
      profile,
      coreSubjects: savedCalc.coreSubjects,
      examSubjects: savedCalc.examSubjects,
      additionalSubjects: normalizeAdditionalSubjects(savedCalc.additionalSubjects),
      examResults: savedCalc.examResults || {},
      grades: savedCalc.grades || {},
    });
    setGrades(savedCalc.grades || {});
    setExamResults(savedCalc.examResults || {});
    setCurrentCalculationId(savedCalc.id);
    setCurrentResult(null);

    // Jump to results
    setStep('results');
  };

  const handleSaveComplete = (calculationId) => {
    setCurrentCalculationId(calculationId);
  };

  const handleResultCalculated = useCallback((result, updatedExamResults) => {
    setCurrentResult(result);
    if (updatedExamResults) {
      setExamResults(updatedExamResults);
    }
  }, []);

  const getCurrentCalculation = () => {
    if (!wizardData) {
      return null;
    }

    const resolvedExamResults = examResults ?? wizardData.examResults;

    return {
      profile: wizardData.profile,
      coreSubjects: wizardData.coreSubjects,
      examSubjects: wizardData.examSubjects,
      additionalSubjects: wizardData.additionalSubjects,
      examResults: resolvedExamResults,
      grades: grades,
      result: currentResult,
      calculationId: currentCalculationId,
    };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Save/Load Manager - Always visible in header */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <SaveLoadManager
          currentCalculation={getCurrentCalculation()}
          onLoad={handleLoad}
          onSaveComplete={handleSaveComplete}
        />
        <AuthButton />
      </div>

      {/* Main Content */}
      {step === 'wizard' && (
        <AbiturWizard
          onComplete={handleWizardComplete}
          onShowDetails={handleShowDetails}
          initialData={wizardData}
        />
      )}

      {step === 'grades' && wizardData && (
        <div className="min-h-screen bg-white">
          {/* Back Button */}
          <div className="sticky top-0 z-20 bg-white border-b border-notion-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <button
                onClick={handleBackToWizard}
                className="flex items-center gap-2 text-notion-gray-600 hover:text-notion-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Zurück zur Fächerwahl</span>
              </button>
            </div>
          </div>

          <GradeMatrix
            profile={wizardData.profile}
            coreSubjects={wizardData.coreSubjects}
            examSubjects={wizardData.examSubjects}
            additionalSubjects={wizardData.additionalSubjects}
            initialGrades={grades}
            onComplete={handleGradesComplete}
            onBack={handleBackToWizard}
          />
        </div>
      )}

      {step === 'results' && wizardData && grades && (
        <ResultsDashboard
          key={currentCalculationId || 'draft'}
          profile={wizardData.profile}
          coreSubjects={wizardData.coreSubjects}
          examSubjects={wizardData.examSubjects}
          grades={grades}
          initialExamResults={examResults}
          onBack={handleBackToGrades}
          onResultCalculated={handleResultCalculated}
        />
      )}
    </div>
  );
}

export default App;
