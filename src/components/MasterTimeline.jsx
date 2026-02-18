import React from 'react';
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, isWithinInterval, isSameWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const MasterTimeline = () => {
  const { projectData } = useProject();

  // Generate weeks from Feb 9 to Apr 25, 2026
  const startDate = new Date(2026, 1, 9); // Feb 9
  const endDate = new Date(2026, 3, 25); // Apr 25
  const weeks = [];
  let current = startOfWeek(startDate, { weekStartsOn: 1 });
  while (current <= endDate) {
    weeks.push({
      start: current,
      end: endOfWeek(current, { weekStartsOn: 1 }),
    });
    current = addWeeks(current, 1);
  }

  // Get milestones per week
  const getMilestonesForWeek = (week) => {
    return projectData.milestones.filter(ms => {
      const msDate = parseISO(ms.date);
      return isWithinInterval(msDate, { start: week.start, end: week.end });
    });
  };

  // Get tasks due in week
  const getTasksForWeek = (week) => {
    const tasks = [];
    projectData.workstreams.forEach(ws => {
      ws.tasks.forEach(task => {
        const taskDate = parseISO(task.dueDate);
        if (isWithinInterval(taskDate, { start: week.start, end: week.end })) {
          tasks.push({ ...task, workstreamColor: ws.color, workstreamName: ws.name });
        }
      });
    });
    return tasks;
  };

  const isCurrentWeek = (week) => {
    return isSameWeek(new Date(), week.start, { weekStartsOn: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-6 text-sm">
        <span className="font-medium text-gray-700">Legenda:</span>
        {projectData.workstreams.map(ws => (
          <div key={ws.id} className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ws.color }} />
            <span className="text-gray-600">{ws.name}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {weeks.map((week, idx) => {
          const milestones = getMilestonesForWeek(week);
          const tasks = getTasksForWeek(week);
          const isCurrent = isCurrentWeek(week);

          return (
            <div
              key={idx}
              className={`bg-white rounded-lg shadow overflow-hidden ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`px-5 py-3 flex items-center justify-between ${isCurrent ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-bold ${isCurrent ? 'text-blue-700' : 'text-gray-700'}`}>
                    Semana {idx + 1}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(week.start, "d MMM", { locale: ptBR })} - {format(week.end, "d MMM", { locale: ptBR })}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Semana Atual
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {milestones.length > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {milestones.length} marco{milestones.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {tasks.length > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {tasks.length} tarefa{tasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {(milestones.length > 0 || tasks.length > 0) && (
                <div className="px-5 py-3">
                  {/* Milestones */}
                  {milestones.map(ms => (
                    <div key={ms.id} className="flex items-center space-x-3 py-1.5">
                      {ms.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : ms.critical ? (
                        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">{ms.title}</span>
                      <span className="text-xs text-gray-500">{ms.owner}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        ms.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {ms.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  ))}

                  {/* Tasks */}
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center space-x-3 py-1.5">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.workstreamColor }} />
                      </div>
                      <span className="text-sm text-gray-700">{task.title}</span>
                      <span className="text-xs text-gray-400">{task.workstreamName}</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${task.progress}%`, backgroundColor: task.workstreamColor }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{task.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasterTimeline;
