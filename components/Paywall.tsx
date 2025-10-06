import React from 'react';
import LockClosedIcon from './icons/LockClosedIcon';

interface PaywallProps {
  reason: 'invalid' | 'expired' | 'missing';
}

const Paywall: React.FC<PaywallProps> = ({ reason }) => {
  const messages = {
    missing: {
      title: 'Access Required',
      body: 'To use the TRT Optimization Assistant, you need a valid access pass. Please purchase one to proceed.',
    },
    invalid: {
      title: 'Invalid Access Token',
      body: 'The access token in your URL is not valid. Please check the link provided or purchase a new pass.',
    },
    expired: {
      title: 'Access Pass Expired',
      body: 'Your 7-day access pass has expired. To continue using the assistant, please purchase a new pass.',
    },
  };

  const { title, body } = messages[reason];

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

        <main className="max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
                <LockClosedIcon className="h-8 w-8 text-red-400" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-3">{title}</h2>
            <p className="text-gray-300 mb-8 max-w-sm mx-auto">{body}</p>
            <a
                href="https://buy.stripe.com/test_8x23cvbiLdbOgsuflV5Vu00"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block px-8 py-3 bg-green-600 rounded-lg hover:bg-green-500 font-bold transition-all shadow-lg"
            >
                Purchase 7-Day Access
            </a>
            <p className="text-xs text-gray-500 mt-6">
                After purchasing, you will receive a unique link that grants you access for 7 days.
            </p>
        </main>
      </div>
    </div>
  );
};

export default Paywall;
