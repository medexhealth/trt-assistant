import React, { useState, useEffect } from 'react';
import TrtAssistant from './TrtAssistant';
import Paywall from './components/Paywall';

type AccessState = 'validating' | 'valid' | 'invalid' | 'expired' | 'missing';

const App: React.FC = () => {
  const [accessState, setAccessState] = useState<AccessState>('validating');

  useEffect(() => {
    const validateToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setAccessState('missing');
        return;
      }
      
      try {
        // This fetch call now points to our Vercel Serverless Function.
        const response = await fetch(`/api/validateToken?token=${token}`);
        
        if (response.ok) {
          setAccessState('valid');
        } else {
          const data = await response.json();
          setAccessState(data.reason || 'invalid');
        }
      } catch (error) {
        console.error('Validation API error:', error);
        setAccessState('invalid');
      }
    };

    validateToken();
  }, []);

  if (accessState === 'validating') {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-200">Verifying Access...</h2>
        </div>
      </div>
    );
  }

  if (accessState === 'valid') {
    return <TrtAssistant />;
  }

  return <Paywall reason={accessState as 'invalid' | 'expired' | 'missing'} />;
};

export default App;
