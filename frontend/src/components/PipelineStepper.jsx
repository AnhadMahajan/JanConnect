export default function PipelineStepper({ currentStep }) {
  return (
    <div className="pipeline-stepper">
      <div className="stepper-header">
        <span>Citizen Grievance Resolution Lifecycle</span>
        <span>{currentStep === 5 ? "✅ Ticket Active" : `Step ${currentStep} of 5`}</span>
      </div>
      <div className="stepper-flow">
        <div className={`step-card ${currentStep >= 1 ? (currentStep > 1 ? "completed" : "active") : ""}`}>
          <div className="step-number">{currentStep > 1 ? "✓" : "1"}</div>
          <div className="step-info">
            <span className="step-title">Citizen Intake</span>
            <span className="step-desc">Voice / Text in any language</span>
          </div>
        </div>

        <div className={`step-card ${currentStep >= 2 ? (currentStep > 2 ? "completed" : "active") : ""}`}>
          <div className="step-number">{currentStep > 2 ? "✓" : "2"}</div>
          <div className="step-info">
            <span className="step-title">Language Translation</span>
            <span className="step-desc">Azure Translator working copy</span>
          </div>
        </div>

        <div className={`step-card ${currentStep >= 3 ? (currentStep > 3 ? "completed" : "active") : ""}`}>
          <div className="step-number">{currentStep > 3 ? "✓" : "3"}</div>
          <div className="step-info">
            <span className="step-title">Dept. Routing</span>
            <span className="step-desc">Classifier & Intent match</span>
          </div>
        </div>

        <div className={`step-card ${currentStep >= 4 ? (currentStep > 4 ? "completed" : "active") : ""}`}>
          <div className="step-number">{currentStep > 4 ? "✓" : "4"}</div>
          <div className="step-info">
            <span className="step-title">Grounded AI Agent</span>
            <span className="step-desc">Azure AI Search + GPT-5-mini</span>
          </div>
        </div>

        <div className={`step-card ${currentStep >= 5 ? "completed active" : ""}`}>
          <div className="step-number">{currentStep >= 5 ? "✓" : "5"}</div>
          <div className="step-info">
            <span className="step-title">Filing & SLA Track</span>
            <span className="step-desc">Azure Storage ticket generation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
