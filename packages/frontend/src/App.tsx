import { useState } from 'react';
import { ScenarioInput } from './components/ScenarioInput';
import { AnalysisOutput } from './components/AnalysisOutput';
import { AnalysisResult, ErrorResponse } from './types/index';

const MAX_LENGTH = 1500;
const API_URL = '/api/analyze';

/**
 * Main App component
 * Requirements: 8.1, 8.4
 */
function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (scenario: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        setError(errorData.message || 'An error occurred during analysis');
        return;
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to connect to the analysis service. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Frame Audit AI</h1>
          <p className="mt-2 text-gray-600">
            Analyze problem framing before attempting solutions
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ScenarioInput onSubmit={handleSubmit} isLoading={isLoading} maxLength={MAX_LENGTH} />
        <AnalysisOutput analysis={analysis} isLoading={isLoading} error={error} />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Limitations:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Not suitable for real-time emergency decisions</li>
              <li>Not a substitute for legal, medical, or ethical judgment</li>
              <li>Assumes honest user input and qualitative reasoning</li>
              <li>This is a thinking aid, not an oracle</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
