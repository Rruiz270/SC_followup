import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import TaskEditModal from './TaskEditModal';

const TeamView = () => {
  const { projectData, updateTask, getWorkstreamById } = useProject();
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedWorkstream, setSelectedWorkstream] = useState(null);

  // Get tasks assigned to a team member
  const getTasksForMember = (memberName) => {
    const tasks = [];
    projectData.workstreams.forEach(ws => {
      ws.tasks.forEach(task => {
        if (task.assignees && task.assignees.some(a =>
          a.toLowerCase().includes(memberName.toLowerCase()) ||
          memberName.toLowerCase().includes(a.toLowerCase())
        )) {
          tasks.push({ ...task, workstreamId: ws.id, workstreamName: ws.name, workstreamColor: ws.color });
        }
      });
    });
    return tasks;
  };

  const handleTaskClick = (task) => {
    const ws = getWorkstreamById(task.workstreamId);
    setSelectedTask(task);
    setSelectedWorkstream(ws);
  };

  const getStatusDot = (status) => {
    const map = {
      'completed': 'bg-green-500',
      'in-progress': 'bg-blue-500',
      'urgent': 'bg-red-500',
      'not-started': 'bg-gray-300',
    };
    return map[status] || 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectData.team.map((member) => {
          const tasks = getTasksForMember(member.name.split(' ')[0]);
          const completedCount = tasks.filter(t => t.status === 'completed').length;
          const avgProgress = tasks.length > 0
            ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length)
            : 0;

          return (
            <div key={member.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header */}
              <div className="p-5" style={{ borderTop: `4px solid ${member.color}` }}>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{tasks.length}</div>
                    <div className="text-xs text-gray-500">Tarefas</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{completedCount}</div>
                    <div className="text-xs text-gray-500">Feitas</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold" style={{ color: member.color }}>{avgProgress}%</div>
                    <div className="text-xs text-gray-500">Progresso</div>
                  </div>
                </div>

                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${avgProgress}%`, backgroundColor: member.color }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="border-t border-gray-200 divide-y divide-gray-100">
                {tasks.length === 0 ? (
                  <div className="p-4 text-sm text-gray-400 text-center">Nenhuma tarefa atribuída</div>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(task.status)}`} />
                          <span className="text-sm text-gray-800 truncate">{task.title}</span>
                        </div>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.workstreamColor }} />
                        <span className="text-xs text-gray-400">{task.workstreamName}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1 ml-2">
                          <div
                            className="h-1 rounded-full"
                            style={{ width: `${task.progress}%`, backgroundColor: task.workstreamColor }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{task.progress}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskEditModal
        task={selectedTask}
        workstream={selectedWorkstream}
        isOpen={!!selectedTask}
        onClose={() => { setSelectedTask(null); setSelectedWorkstream(null); }}
        onSave={(t) => updateTask(t.id, t)}
      />
    </div>
  );
};

export default TeamView;
