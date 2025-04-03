import React from 'react';

const StepIndicator = ({ currentStep, totalSteps, labels = [] }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            {/* Step circle */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
              index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            
            {/* Connector line between steps */}
            {index < totalSteps - 1 && (
              <div className={`h-1 flex-1 ${
                index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Optional step labels */}
      {labels.length > 0 && (
        <div className="mt-2 flex items-center justify-between">
          {labels.map((label, index) => (
            <div 
              key={index} 
              className={`text-xs ${
                index + 1 <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}
              style={{ width: `${100 / totalSteps}%`, textAlign: 'center' }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StepIndicator;
