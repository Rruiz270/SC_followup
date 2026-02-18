import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit3, Plus, Trash2, Flag, Filter, Clock } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const ActivityLog = () => {
  const { activityLog, projectData } = useProject();
  const [filterWorkstream, setFilterWorkstream] = useState('all');

  const getActionIcon = (action) => {
    switch (action) {
      case 'task_created': return <Plus className="w-4 h-4 text-green-500" />;
      case 'task_updated': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'task_deleted': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'milestone_updated': return <Flag className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'task_created': return 'Tarefa criada';
      case 'task_updated': return 'Tarefa editada';
      case 'task_deleted': return 'Tarefa excluída';
      case 'milestone_updated': return 'Marco atualizado';
      default: return 'Ação';
    }
  };

  const filteredLog = filterWorkstream === 'all'
    ? activityLog
    : activityLog.filter(entry => entry.workstream === filterWorkstream);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={filterWorkstream}
          onChange={(e) => setFilterWorkstream(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as frentes</option>
          {projectData.workstreams.map(ws => (
            <option key={ws.id} value={ws.name}>{ws.name}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">{filteredLog.length} registros</span>
      </div>

      {/* Log Entries */}
      {filteredLog.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma atividade registrada</h3>
          <p className="text-sm text-gray-400">
            As atividades aparecerão aqui conforme você editar, criar ou excluir tarefas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {filteredLog.map((entry) => {
            const ws = projectData.workstreams.find(w => w.name === entry.workstream);
            return (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getActionIcon(entry.action)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getActionLabel(entry.action)}
                      </span>
                      {ws && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
                        >
                          {ws.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {entry.taskTitle || entry.milestoneTitle}
                    </p>
                    {entry.changes && entry.changes.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {entry.changes.map((change, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {change}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {format(parseISO(entry.timestamp), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
