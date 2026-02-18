import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DecisionsPanel = ({ decisions }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Decisões da Reunião</h3>
      <div className="space-y-2">
        {decisions.map((d) => {
          const isExpanded = expandedId === d.id;
          return (
            <div key={d.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : d.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">{d.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mt-3">{d.details}</p>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{d.participants.join(', ')}</span>
                    </div>
                    <span>{format(parseISO(d.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionsPanel;
