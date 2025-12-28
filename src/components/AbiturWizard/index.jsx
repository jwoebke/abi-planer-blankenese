import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import SemesterMatrix from './SemesterMatrix';
import ProfilePicker from './ProfilePicker';
import CoreSubjects from './CoreSubjects';
import ExamSubjects from './ExamSubjects';
import AdditionalSubjects from './AdditionalSubjects';

/**
 * AbiturWizard - Single-page wizard with progressive disclosure
 * Features:
 * - Fixed SemesterMatrix at top showing all selections
 * - Progressive sections that activate as user completes previous steps
 * - Smooth scroll between sections
 */
export default function AbiturWizard({ onComplete, initialData = null }) {
  // State
  const [selectedProfile, setSelectedProfile] = useState(initialData?.profile || null);
  const [coreSubjects, setCoreSubjects] = useState(initialData?.coreSubjects || null);
  const [examSubjects, setExamSubjects] = useState(initialData?.examSubjects || null);
  const [additionalSubjects, setAdditionalSubjects] = useState(initialData?.additionalSubjects || []);

  // Refs for smooth scrolling
  const coreSubjectsRef = useRef(null);
  const examSubjectsRef = useRef(null);
  const additionalSubjectsRef = useRef(null);

  // Auto-scroll to next section when previous is completed
  useEffect(() => {
    if (selectedProfile && !coreSubjects && coreSubjectsRef.current) {
      setTimeout(() => {
        coreSubjectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [selectedProfile, coreSubjects]);

  useEffect(() => {
    if (coreSubjects && !examSubjects && examSubjectsRef.current) {
      setTimeout(() => {
        examSubjectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [coreSubjects, examSubjects]);

  useEffect(() => {
    if (examSubjects && additionalSubjectsRef.current) {
      setTimeout(() => {
        additionalSubjectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [examSubjects]);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    // Reset subsequent selections if profile changes
    if (selectedProfile?.id !== profile.id) {
      setCoreSubjects(null);
      setExamSubjects(null);
      setAdditionalSubjects([]);
    }
  };

  const handleCoreSubjectsChange = (subjects) => {
    setCoreSubjects(subjects);
    // Reset subsequent selections if core subjects change
    if (subjects && JSON.stringify(coreSubjects) !== JSON.stringify(subjects)) {
      setExamSubjects(null);
    }
  };

  const handleExamSubjectsChange = (subjects) => {
    setExamSubjects(subjects);
  };

  const handleAdditionalSubjectsChange = (subjects) => {
    // subjects will be null if validation fails, or an array if valid
    setAdditionalSubjects(subjects || []);
  };

  const handleProceedToGrades = () => {
    if (!selectedProfile || !coreSubjects || !examSubjects || !additionalSubjects) return;

    onComplete({
      profile: selectedProfile,
      coreSubjects,
      examSubjects,
      additionalSubjects
    });
  };

  // Can only proceed if all required fields are filled AND additionalSubjects validation passed
  const canProceed = selectedProfile && coreSubjects && examSubjects && additionalSubjects && additionalSubjects.length >= 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header with SemesterMatrix */}
      <SemesterMatrix
        profile={selectedProfile}
        coreSubjects={coreSubjects}
        examSubjects={examSubjects}
        additionalSubjects={additionalSubjects}
      />

      {/* Main Content - Scrollable Sections */}
      <div className="max-w-7xl mx-auto">
        {/* Step 1: Profile Selection */}
        <ProfilePicker
          selectedProfile={selectedProfile}
          onSelectProfile={handleProfileSelect}
        />

        {/* Step 2: Core Subjects */}
        <div ref={coreSubjectsRef}>
          <CoreSubjects
            profile={selectedProfile}
            coreSubjects={coreSubjects}
            onCoreSubjectsChange={handleCoreSubjectsChange}
            isActive={!!selectedProfile}
          />
        </div>

        {/* Step 3: Exam Subjects */}
        <div ref={examSubjectsRef}>
          <ExamSubjects
            profile={selectedProfile}
            coreSubjects={coreSubjects}
            examSubjects={examSubjects}
            onExamSubjectsChange={handleExamSubjectsChange}
            isActive={!!coreSubjects}
          />
        </div>

        {/* Step 4: Additional Subjects (Optional) */}
        <div ref={additionalSubjectsRef}>
          <AdditionalSubjects
            profile={selectedProfile}
            coreSubjects={coreSubjects}
            examSubjects={examSubjects}
            additionalSubjects={additionalSubjects}
            onAdditionalSubjectsChange={handleAdditionalSubjectsChange}
            isActive={!!examSubjects}
          />
        </div>

        {/* Proceed Button - Fixed at bottom */}
        {canProceed && (
          <div className="sticky bottom-0 bg-white border-t border-notion-gray-100 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-notion-gray-900">
                    Alle Pflichtangaben vollständig
                  </p>
                  <p className="text-xs text-notion-gray-400">
                    Du kannst jetzt mit der Noteneingabe fortfahren
                  </p>
                </div>
                <button
                  onClick={handleProceedToGrades}
                  className="notion-btn-primary flex items-center gap-2 text-base px-6 py-3"
                >
                  Weiter zur Noteneingabe
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
