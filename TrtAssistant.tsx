import React, { useState, useCallback } from 'react';
import { analyzeLabResults, extractLabValuesFromText } from './geminiService';
import type { FormData, LabData } from './types';
import { InjectionFrequency, BloodTestTiming } from './types';
import StepIndicator from './components/StepIndicator';
import SymptomsSelector from './components/SymptomsSelector';
import ResultDisplay from './components/ResultDisplay';
import ChevronLeftIcon from './components/icons/ChevronLeftIcon';
import ChevronRightIcon from './components/icons/ChevronRightIcon';
import SparklesIcon from './components/icons/SparklesIcon';

const TOTAL_STEPS = 3;

const TrtAssistant: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    injectionFrequency: '',
    bloodTestTiming: '',
    labs: {
      totalTestosterone: '',
      freeTestosterone: '',
      estradiol: '',
      hematocrit: '',
    },
    symptoms: [],
  });
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [labText, setLabText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState('');


  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleLabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        labs: { ...prev.labs, [name]: value }
    }));
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, injectionFrequency: e.target.value as InjectionFrequency }));
  };

  const handleTimingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, bloodTestTiming: e.target.value as BloodTestTiming }));
  };
  
  const handleSymptomChange = (symptoms: string[]) => {
    setFormData(prev => ({ ...prev, symptoms }));
  };

  const handleExtractLabs = useCallback(async () => {
    if (!labText.trim()) {
        setExtractionError('Please paste your lab report text first.');
        return;
    }
    setExtractionError('');
    setIsExtracting(true);
    try {
        const extractedLabs = await extractLabValuesFromText(labText);
        setFormData(prev => ({
            ...prev,
            labs: {
                ...prev.labs,
                totalTestosterone: extractedLabs.totalTestosterone || prev.labs.totalTestosterone,
                freeTestosterone: extractedLabs.freeTestosterone || prev.labs.freeTestosterone,
                estradiol: extractedLabs.estradiol || prev.labs.estradiol,
                hematocrit: extractedLabs.hematocrit || prev.labs.hematocrit
            }
        }));
    } catch (err) {
        console.error("Extraction failed:", err);
        setExtractionError('Could not automatically extract lab values. Please enter them manually.');
    } finally {
        setIsExtracting(false);
    }
  }, [labText]);

  const handleSubmit = useCallback(async () => {
    if (!formData.labs.freeTestosterone || !formData.labs.estradiol || !formData.labs.hematocrit) {
      setError('Please fill in at least Free T, Estradiol, and Hematocrit values.');
      return;
    }
    setError('');
    setIsLoading(true);
    setAnalysisResult('');
    try {
      const result = await analyzeLabResults(formData);
      if (result.toLowerCase().startsWith('error:') || result.toLowerCase().includes("configuration error")) {
          setError(result);
          setAnalysisResult('');
      } else {
          setAnalysisResult(result);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Your Protocol</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="injectionFrequency" className="block text-sm font-medium text-gray-400 mb-2">How often do you inject testosterone?</label>
                        <select id="injectionFrequency" value={formData.injectionFrequency} onChange={handleFrequencyChange} className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select frequency...</option>
                            {Object.values(InjectionFrequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bloodTestTiming" className="block text-sm font-medium text-gray-400 mb-2">When was your blood test relative to your injection?</label>
                        <select id="bloodTestTiming" value={formData.bloodTestTiming} onChange={handleTimingChange} className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select timing...</option>
                            {Object.values(BloodTestTiming).map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        );
      case 2:
        return (
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-2">Your Lab Results</h2>
                
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 mb-8">
                    <h3 className="text-lg font-semibold text-center text-gray-200 mb-3">AI Lab Extraction (Optional)</h3>
                    <p className="text-center text-gray-400 mb-4 text-sm">Save time. Paste your lab report below and let AI find the values.</p>
                    <textarea
                        value={labText}
                        onChange={(e) => setLabText(e.target.value)}
                        placeholder="Paste your full lab report text here..."
                        className="w-full bg-gray-800 border-gray-600 text-white rounded-lg p-3 h-28 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button onClick={handleExtractLabs} disabled={isExtracting} className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 rounded-lg hover:bg-teal-500 font-bold transition-all shadow-md disabled:opacity-60 disabled:cursor-wait">
                        {isExtracting ? (
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                           <SparklesIcon className="w-5 h-5" />
                        )}
                        {isExtracting ? 'Extracting...' : 'Extract Values'}
                    </button>
                    {extractionError && <p className="text-red-400 text-sm text-center mt-2">{extractionError}</p>}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(formData.labs).map(key => {
                        const labels: Record<keyof LabData, { title: string, unit: string, placeholder: string }> = {
                            totalTestosterone: { title: 'Total Testosterone', unit: 'ng/dL', placeholder: 'e.g., 850' },
                            freeTestosterone: { title: 'Free Testosterone', unit: 'pg/mL', placeholder: 'e.g., 200' },
                            estradiol: { title: 'Estradiol (Sensitive)', unit: 'pg/mL', placeholder: 'e.g., 35' },
                            hematocrit: { title: 'Hematocrit', unit: '%', placeholder: 'e.g., 51' },
                        };
                        const item = labels[key as keyof LabData];
                        return (
                             <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-gray-400 mb-2">{item.title}</label>
                                <div className="relative">
                                    <input type="number" id={key} name={key} value={formData.labs[key as keyof LabData]} onChange={handleLabChange} placeholder={item.placeholder} className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 pr-16 focus:ring-blue-500 focus:border-blue-500 appearance-none" />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">{item.unit}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
      case 3:
        return (
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Your Symptoms</h2>
                <p className="text-center text-gray-400 mb-4 text-sm">Select any symptoms you're currently experiencing. This helps correlate your lab results with how you feel.</p>
                <SymptomsSelector selectedSymptoms={formData.symptoms} onChange={handleSymptomChange} />
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 pb-2">
            TRT Optimization Assistant
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get AI-powered "Dr T insights" on your results to help optimize your TRT with your doctor.
          </p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
            {!analysisResult && !isLoading && (
                 <>
                    <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
                    <div className="min-h-[300px] flex flex-col justify-center">
                        {renderStepContent()}
                        {error && (
                          <div className="mt-6 bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                            <p className="font-bold">Analysis Failed</p>
                            <p className="text-sm">{error}</p>
                          </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-8">
                        <button onClick={handleBack} disabled={currentStep === 1} className="flex items-center gap-2 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            <ChevronLeftIcon className="w-5 h-5" />
                            Back
                        </button>
                        {currentStep < TOTAL_STEPS ? (
                            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-all">
                                Next
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-green-600 rounded-lg hover:bg-green-500 font-bold transition-all shadow-lg">
                                <SparklesIcon className="w-5 h-5" />
                                Analyze Results
                            </button>
                        )}
                    </div>
                </>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-200">Analyzing your data...</h2>
                <p className="text-gray-400">The AI is reviewing your labs and symptoms. Please wait a moment.</p>
              </div>
            )}
            
            {analysisResult && (
              <div>
                <ResultDisplay result={analysisResult} />
                <button 
                  onClick={() => {
                      setAnalysisResult(''); 
                      setCurrentStep(1);
                      setError('');
                      setLabText('');
                  }} 
                  className="mt-6 w-full px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 font-bold transition-all"
                >
                  Start New Analysis
                </button>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default TrtAssistant;
