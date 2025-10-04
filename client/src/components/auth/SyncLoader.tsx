import { useEffect, useState } from 'react';

const loadingMessages = [
  "Setting up your organization...",
  "Syncing your profile...", 
  "Preparing your dashboard...",
  "Almost ready...",
];

export function SyncLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 px-4">
        {/* Creative animated logo/icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-border"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-primary/60 border-b-transparent animate-spin animate-reverse" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Animated message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground animate-fade-in">
            Welcome to Reflect! 
          </h2>
          <p 
            key={messageIndex} 
            className="text-lg text-muted-foreground animate-fade-in-up transition-all duration-300"
          >
            {loadingMessages[messageIndex]}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index <= messageIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted'
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
              }}
            />
          ))}
        </div>

        {/* Fun fact or tip */}
        <div className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground italic animate-fade-in" style={{ animationDelay: '2s' }}>
            💡 Tip: Use keyboard shortcuts to navigate faster once you&apos;re in!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}