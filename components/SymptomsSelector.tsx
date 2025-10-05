import React from 'react';
import { SymptomsList } from '../types';

interface SymptomsSelectorProps {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

const SymptomsSelector: React.FC<SymptomsSelectorProps> = ({ selectedSymptoms, onChange }) => {
  const handleSymptomToggle = (symptom: string) => {
    let newSelection;
    if (symptom === 'None of the above') {
      newSelection = selectedSymptoms.includes(symptom) ? [] : ['None of the above'];
    } else {
      if (selectedSymptoms.includes(symptom)) {
        newSelection = selectedSymptoms.filter((s) => s !== symptom);
      } else {
        newSelection = [...selectedSymptoms.filter(s => s !== 'None of the above'), symptom];
      }
    }
    onChange(newSelection);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {SymptomsList.map((symptom) => (
        <button
          key={symptom}
          type="button"
          onClick={() => handleSymptomToggle(symptom)}
          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
            selectedSymptoms.includes(symptom)
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {symptom}
        </button>
      ))}
    </div>
  );
};

export default SymptomsSelector;
