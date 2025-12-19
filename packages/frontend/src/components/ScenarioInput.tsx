import { useState, ChangeEvent, FormEvent } from 'react';

interface ScenarioInputProps {
  onSubmit: (scenario: string) => void;
  isLoading: boolean;
  maxLength: number;
}

/**
 * ScenarioInput component for capturing and validating user input
 * Requirements: 1.1, 1.2, 1.3, 1.5, 8.2, 8.3
 */
export function ScenarioInput({ onSubmit, isLoading, maxLength }: ScenarioInputProps) {
  const [scenario, setScenario] = useState('');
  const [error, setError] = useState<string | null>(null);

  const remainingChars = maxLength - scenario.length;
  const isOverLimit = remainingChars < 0;
  const isEmpty = scenario.trim().length === 0;
  const isInvalid = isEmpty || isOverLimit;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setScenario(e.target.value);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate
    if (isEmpty) {
      setError('Scenario cannot be empty');
      return;
    }

    if (isOverLimit) {
      setError(`Scenario must be ${maxLength} characters or less`);
      return;
    }

    // Submit
    onSubmit(scenario);
    setScenario(''); // Clear input after successful submission
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        <div>
          <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a scenario, dilemma, or decision to analyze
          </label>
          <textarea
            id="scenario"
            value={scenario}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Example: A train will kill either my entire server infrastructure or 5 people. I can control the lever. What should I do?"
            className={`w-full h-40 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
              isOverLimit
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              {error && <span className="text-red-600">{error}</span>}
            </div>
            <div
              className={`text-sm ${
                isOverLimit ? 'text-red-600 font-semibold' : 'text-gray-500'
              }`}
            >
              {remainingChars} characters remaining
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isInvalid || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isInvalid || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Analyzing...' : 'Audit the framing'}
        </button>
      </div>
    </form>
  );
}
