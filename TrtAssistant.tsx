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
