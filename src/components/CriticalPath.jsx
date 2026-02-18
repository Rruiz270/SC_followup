import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Circle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CriticalPath = ({ steps }) => {
  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'in-progress': return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      default: return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStepBg = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Caminho Crítico</h3>
      <div className="flex items-start overflow-x-auto pb-4 space-x-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className={`flex-shrink-0 w-44 rounded-lg border p-4 ${getStepBg(step.status)}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getStepIcon(step.status)}
                <span className="text-xs font-medium text-gray-500 uppercase">Etapa {idx + 1}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{step.step}</h4>
              <p className="text-xs text-gray-500 mb-2">{step.description}</p>
              <div className="text-xs font-medium text-gray-600">
                {format(parseISO(step.target), "d MMM", { locale: ptBR })}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-shrink-0 flex items-center pt-8">
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CriticalPath;
