import { useState } from 'react';
import AbiturWizard from './components/AbiturWizard';
import GradeMatrix from './components/GradeMatrix';
import ResultsDashboard from './components/ResultsDashboard';
import SaveLoadManager from './components/SaveLoadManager';
import { PROFILES } from './data/profiles';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [step, setStep] = useState('wizard'); // 'wizard', 'grades', 'results'
  const [wizardData, setWizardData] = useState(null); // { profile, coreSubjects, examSubjects, additionalSubjects }
  const [grades, setGrades] = useState(null);
  const [currentCalculationId, setCurrentCalculationId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);

  const handleWizardComplete = (data) => {
    setWizardData(data);
    setStep('grades');
  };

  const handleGradesComplete = (gradeData) => {
    setGrades(gradeData);
    setStep('results');
  };

  const handleBackToWizard = () => {
    setStep('wizard');
    setGrades(null);
  };

  const handleBackToGrades = () => {
    setGrades(null);
    setStep('grades');
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
      additionalSubjects: savedCalc.additionalSubjects || []
    });
    setGrades(savedCalc.grades);
    setCurrentCalculationId(savedCalc.id);

    // Jump to results
    setStep('results');
  };

  const handleSaveComplete = (calculationId) => {
    setCurrentCalculationId(calculationId);
  };

  const handleResultCalculated = (result) => {
    setCurrentResult(result);
  };

  const getCurrentCalculation = () => {
    if (!wizardData) {
      return null;
    }

    return {
      profile: wizardData.profile,
      coreSubjects: wizardData.coreSubjects,
      examSubjects: wizardData.examSubjects,
      additionalSubjects: wizardData.additionalSubjects,
      grades: grades,
      result: currentResult,
      calculationId: currentCalculationId,
    };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Save/Load Manager - Always visible in header */}
      <div className="fixed top-4 right-4 z-50">
        <SaveLoadManager
          currentCalculation={getCurrentCalculation()}
          onLoad={handleLoad}
          onSaveComplete={handleSaveComplete}
        />
      </div>

      {/* Main Content */}
      {step === 'wizard' && (
        <AbiturWizard
          onComplete={handleWizardComplete}
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
            onComplete={handleGradesComplete}
            onBack={handleBackToWizard}
          />
        </div>
      )}

      {step === 'results' && wizardData && grades && (
        <ResultsDashboard
          profile={wizardData.profile}
          coreSubjects={wizardData.coreSubjects}
          examSubjects={wizardData.examSubjects}
          grades={grades}
          onBack={handleBackToGrades}
          onResultCalculated={handleResultCalculated}
        />
      )}
    </div>
  );
}

export default App;
