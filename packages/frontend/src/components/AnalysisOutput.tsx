import { AnalysisResult, FramingVerdict, LeverType } from '../types/index';

interface AnalysisOutputProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * AnalysisOutput component renders structured analysis results
 * Requirements: 2.1-2.8, 3.1-3.8, 4.1, 5.1, 5.6, 6.1, 6.5, 7.6-7.7, 8.4
 */
export function AnalysisOutput({ analysis, isLoading, error }: AnalysisOutputProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Analyzing framing...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // Handle refusal responses
  if (analysis.refusalReason) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
        <RefusalSection
          refusalReason={analysis.refusalReason}
          reframedQuestion={analysis.reframedQuestion}
        />
      </div>
    );
  }

  // Render full analysis
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {analysis.frameAudit && <FrameAuditSection frameAudit={analysis.frameAudit} />}
      {analysis.systemMap && <SystemMapSection systemMap={analysis.systemMap} />}
      {analysis.realityCompression && (
        <RealityCompressionSection realityCompression={analysis.realityCompression} />
      )}
      {analysis.levers && <LeversSection levers={analysis.levers} />}
    </div>
  );
}

// Refusal Section Component
function RefusalSection({
  refusalReason,
  reframedQuestion,
}: {
  refusalReason: string;
  reframedQuestion?: string;
}) {
  return (
    <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
      <h2 className="text-xl font-semibold text-yellow-900 mb-4">Analysis Refused</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Reason:</h3>
          <p className="text-yellow-900">{refusalReason}</p>
        </div>
        {reframedQuestion && (
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Suggested Reframe:</h3>
            <p className="text-yellow-900 italic">{reframedQuestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Frame Audit Section Component
function FrameAuditSection({ frameAudit }: { frameAudit: any }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Frame Audit</h2>
        <FramingVerdictBadge verdict={frameAudit.framingVerdict} />
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Confidence:</span>
          <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${frameAudit.confidenceScore * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(frameAudit.confidenceScore * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {frameAudit.assumptions.length > 0 && (
          <DetailSection title="Assumptions" items={frameAudit.assumptions} />
        )}
        {frameAudit.falseBinaries.length > 0 && (
          <DetailSection title="False Binaries" items={frameAudit.falseBinaries} />
        )}
        {frameAudit.artificialConstraints.length > 0 && (
          <DetailSection title="Artificial Constraints" items={frameAudit.artificialConstraints} />
        )}
        {frameAudit.beneficiaries && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Who Benefits:</h3>
            <p className="text-gray-900">{frameAudit.beneficiaries}</p>
          </div>
        )}
        {frameAudit.hiddenElements.length > 0 && (
          <DetailSection title="What's Hidden" items={frameAudit.hiddenElements} />
        )}
        {frameAudit.whyThisFramingPersists && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Why This Framing Persists:</h3>
            <p className="text-gray-900">{frameAudit.whyThisFramingPersists}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// System Map Section Component
function SystemMapSection({ systemMap }: { systemMap: any }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">System Map</h2>

      {/* Power Asymmetry Callout */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 className="text-sm font-semibold text-purple-900 mb-3">Power Analysis</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-purple-800">Controls outcomes:</span>{' '}
            <span className="text-purple-900">{systemMap.primaryControlHolder}</span>
          </div>
          <div>
            <span className="font-medium text-purple-800">Bears costs:</span>{' '}
            <span className="text-purple-900">{systemMap.primaryCostBearer}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-purple-200">
            <span className="font-medium text-purple-800">Misalignment:</span>{' '}
            <span className="text-purple-900">{systemMap.misalignmentDescription}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {systemMap.actors.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Actors:</h3>
            <ul className="space-y-1">
              {systemMap.actors.map((actor: any, i: number) => (
                <li key={i} className="text-gray-900">
                  • <span className="font-medium">{actor.name}</span> ({actor.type}) - {actor.role}
                </li>
              ))}
            </ul>
          </div>
        )}
        {systemMap.controlPoints.length > 0 && (
          <DetailSection title="Control Points" items={systemMap.controlPoints} />
        )}
        {systemMap.failureModes.length > 0 && (
          <DetailSection title="Failure Modes" items={systemMap.failureModes} />
        )}
      </div>
    </div>
  );
}

// Reality Compression Section Component
function RealityCompressionSection({ realityCompression }: { realityCompression: any }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reality Compression</h2>
      <div className="space-y-3">
        {realityCompression.coreTruths.map((truth: string, i: number) => (
          <div key={i} className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
            <p className="text-gray-900 font-medium">{truth}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Levers Section Component
function LeversSection({ levers }: { levers: any }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Levers</h2>
      <p className="text-sm text-gray-600 mb-4 italic">
        Descriptive system change points, not recommendations
      </p>
      <div className="space-y-3">
        {levers.changePoints.map((lever: any, i: number) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <LeverTypeBadge leverType={lever.leverType} />
              <span className="text-xs text-gray-500 uppercase">{lever.focus}</span>
            </div>
            <p className="text-gray-900">{lever.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper Components
function FramingVerdictBadge({ verdict }: { verdict: FramingVerdict }) {
  const colors = {
    WELL_FRAMED: 'bg-green-100 text-green-800 border-green-200',
    PARTIALLY_FLAWED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    FUNDAMENTALLY_FLAWED: 'bg-red-100 text-red-800 border-red-200',
    FALSE_DILEMMA: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[verdict]}`}>
      {verdict.replace(/_/g, ' ')}
    </span>
  );
}

function LeverTypeBadge({ leverType }: { leverType: LeverType }) {
  const colors = {
    STRUCTURAL: 'bg-blue-100 text-blue-800',
    INCENTIVE: 'bg-green-100 text-green-800',
    INFORMATION: 'bg-purple-100 text-purple-800',
    GOVERNANCE: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[leverType]}`}>
      {leverType}
    </span>
  );
}

function DetailSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}:</h3>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-gray-900">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
