// Temporary backup of current App.jsx with SaveLoadManager
import { useState } from 'react';
import ProfileSelector from './components/ProfileSelector';
import CoreSubjectSelector from './components/CoreSubjectSelector';
import ExamSubjectSelector from './components/ExamSubjectSelector';
import GradeMatrix from './components/GradeMatrix';
import ResultsDashboard from './components/ResultsDashboard';
import SaveLoadManager from './components/SaveLoadManager';
import { db } from './lib/instantdb';
import { PROFILES } from './data/profiles';

function App() {
  const [step, setStep] = useState('profile');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [coreSubjects, setCoreSubjects] = useState(null);
  const [examSubjects, setExamSubjects] = useState(null);
  const [grades, setGrades] = useState(null);
  const [currentCalculationId, setCurrentCalculationId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setStep('core');
  };

  const handleCoreSubjectsComplete = (subjects) => {
    setCoreSubjects(subjects);
    setStep('exam');
  };

  const handleExamSubjectsComplete = (subjects) => {
    setExamSubjects(subjects);
    console.log('Profile:', selectedProfile);
    console.log('Core Subjects:', coreSubjects);
    console.log('Exam Subjects:', subjects);
    setStep('grades');
  };

  const handleGradesComplete = (gradeData) => {
    setGrades(gradeData);
    console.log('Grades:', gradeData);
    setStep('results');
  };

  const handleBackToProfile = () => {
    setSelectedProfile(null);
    setCoreSubjects(null);
    setExamSubjects(null);
    setGrades(null);
    setStep('profile');
  };

  const handleBackToCore = () => {
    setCoreSubjects(null);
    setExamSubjects(null);
    setGrades(null);
    setStep('core');
  };

  const handleBackToExam = () => {
    setExamSubjects(null);
    setGrades(null);
    setStep('exam');
  };

  const handleBackToGrades = () => {
    setGrades(null);
    setStep('grades');
  };

  const handleLoad = (savedCalc) => {
    const profile = Object.values(PROFILES).find(p => p.id === savedCalc.profileId);
    if (!profile) {
      alert('Profil nicht gefunden. Die Berechnung könnte mit einer älteren Version erstellt worden sein.');
      return;
    }
    setSelectedProfile(profile);
    setCoreSubjects(savedCalc.coreSubjects);
    setExamSubjects(savedCalc.examSubjects);
    setGrades(savedCalc.grades);
    setCurrentCalculationId(savedCalc.id);
    setStep('results');
  };

  const handleSaveComplete = (calculationId) => {
    setCurrentCalculationId(calculationId);
  };

  const handleResultCalculated = (result, examResults) => {
    setCurrentResult(result);
  };

  const getCurrentCalculation = () => {
    if (!selectedProfile || !coreSubjects || !examSubjects || !grades) {
      return null;
    }
    return {
      profile: selectedProfile,
      coreSubjects,
      examSubjects,
      grades,
      examResults: null,
      result: currentResult,
      calculationId: currentCalculationId,
    };
  };

  return (
    <>
      {step !== 'profile' && (
        <div className="fixed top-4 right-4 z-40">
          <SaveLoadManager
            currentCalculation={getCurrentCalculation()}
            onLoad={handleLoad}
            onSaveComplete={handleSaveComplete}
          />
        </div>
      )}

      {step === 'profile' && (
        <div className="relative">
          <div className="absolute top-4 right-4 z-40">
            <SaveLoadManager
              currentCalculation={null}
              onLoad={handleLoad}
              onSaveComplete={handleSaveComplete}
            />
          </div>
          <ProfileSelector onSelectProfile={handleProfileSelect} />
        </div>
      )}

      {step === 'core' && selectedProfile && (
        <CoreSubjectSelector
          profile={selectedProfile}
          onComplete={handleCoreSubjectsComplete}
          onBack={handleBackToProfile}
        />
      )}

      {step === 'exam' && selectedProfile && coreSubjects && (
        <ExamSubjectSelector
          profile={selectedProfile}
          coreSubjects={coreSubjects}
          onComplete={handleExamSubjectsComplete}
          onBack={handleBackToCore}
        />
      )}

      {step === 'grades' && selectedProfile && coreSubjects && examSubjects && (
        <GradeMatrix
          profile={selectedProfile}
          coreSubjects={coreSubjects}
          examSubjects={examSubjects}
          onComplete={handleGradesComplete}
          onBack={handleBackToExam}
        />
      )}

      {step === 'results' && selectedProfile && coreSubjects && examSubjects && grades && (
        <ResultsDashboard
          profile={selectedProfile}
          coreSubjects={coreSubjects}
          examSubjects={examSubjects}
          grades={grades}
          onBack={handleBackToGrades}
          onResultCalculated={handleResultCalculated}
        />
      )}
    </>
  );
}

export default App;
