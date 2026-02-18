import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  Calendar, ArrowRight, AlertCircle, Layers, Target
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import CountdownBanner from './CountdownBanner';
import DecisionsPanel from './DecisionsPanel';
import CriticalPath from './CriticalPath';
import TaskEditModal from './TaskEditModal';

const Dashboard = () => {
  const { projectData, getTasksByStatus, getUpcomingDeadlines, calculateOverallProgress, updateTask, getWorkstreamById } = useProject();
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedWorkstream, setSelectedWorkstream] = useState(null);

  const urgentTasks = getTasksByStatus('urgent');
  const inProgressTasks = getTasksByStatus('in-progress');
  const upcomingDeadlines = getUpcomingDeadlines(21);
  const overallProgress = calculateOverallProgress();

  const allTasks = projectData.workstreams.flatMap(ws => ws.tasks);
  const completedCount = allTasks.filter(t => t.status === 'completed').length;
  const criticalCount = allTasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;

  const handleTaskClick = (task) => {
    const ws = getWorkstreamById(task.workstreamId);
    setSelectedTask(task);
    setSelectedWorkstream(ws);
  };

  const handleTaskSave = (updatedTask) => {
    updateTask(updatedTask.id, updatedTask);
  };

  return (
    <div className="space-y-6">
      {/* Countdown */}
      <CountdownBanner />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm text-gray-600">Progresso Geral</h3>
          <div className="text-2xl font-bold text-gray-900">{overallProgress}%</div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm text-gray-600">Tarefas Críticas</h3>
          <div className="text-2xl font-bold text-gray-900">{criticalCount}</div>
          <p className="text-xs text-gray-500 mt-1">{urgentTasks.length} urgentes</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm text-gray-600">Concluídas</h3>
          <div className="text-2xl font-bold text-gray-900">{completedCount}/{allTasks.length}</div>
          <p className="text-xs text-gray-500 mt-1">{inProgressTasks.length} em andamento</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm text-gray-600">Frentes Ativas</h3>
          <div className="text-2xl font-bold text-gray-900">{projectData.workstreams.length}</div>
          <p className="text-xs text-gray-500 mt-1">{projectData.team.length} membros</p>
        </div>
      </div>

      {/* Critical Path */}
      <CriticalPath steps={projectData.criticalPath} />

      {/* Urgent Alerts */}
      {urgentTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Ações Urgentes</h3>
          </div>
          <div className="space-y-2">
            {urgentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between bg-white rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: task.workstreamColor }} />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.workstreamName} - Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workstream Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso das Frentes</h3>
          <div className="space-y-4">
            {projectData.workstreams.map((ws) => {
              const avgProgress = ws.tasks.length > 0
                ? Math.round(ws.tasks.reduce((s, t) => s + t.progress, 0) / ws.tasks.length)
                : 0;
              return (
                <div key={ws.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ws.color }} />
                      <span className="text-sm font-medium text-gray-900">{ws.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{avgProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${avgProgress}%`, backgroundColor: ws.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Prazos</h3>
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center space-x-3">
                  {task.priority === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.workstreamName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className={`text-xs ${task.daysUntilDue <= 7 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {task.daysUntilDue}d
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marcos do Projeto</h3>
        <div className="relative">
          <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {projectData.milestones.filter(m => m.critical).map((ms) => {
              const isPast = ms.status === 'completed';
              const date = new Date(ms.date);
              const isNear = !isPast && (date - new Date()) < 14 * 24 * 60 * 60 * 1000 && date > new Date();
              const isOverdue = !isPast && date < new Date();
              return (
                <div key={ms.id} className="flex items-center space-x-4">
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                    isPast ? 'bg-green-100' : isOverdue ? 'bg-red-100' : isNear ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {isPast ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${
                        isOverdue ? 'bg-red-500' : isNear ? 'bg-orange-500' : 'bg-gray-400'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{ms.title}</h4>
                    <p className="text-xs text-gray-500">
                      {date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' - '}{ms.owner}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isPast ? 'bg-green-100 text-green-700' :
                    isOverdue ? 'bg-red-100 text-red-700' :
                    isNear ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {isPast ? 'Concluído' : isOverdue ? 'Atrasado' : isNear ? 'Próximo' : 'Futuro'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decisions & Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DecisionsPanel decisions={projectData.decisions} />

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riscos Identificados</h3>
          <div className="space-y-3">
            {projectData.risks.map((risk) => (
              <div key={risk.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{risk.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    risk.impact === 'critical' ? 'bg-red-100 text-red-700' :
                    risk.impact === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {risk.impact === 'critical' ? 'Crítico' : risk.impact === 'high' ? 'Alto' : 'Médio'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{risk.mitigation}</p>
                <p className="text-xs text-gray-400 mt-1">Responsável: {risk.owner}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskEditModal
        task={selectedTask}
        workstream={selectedWorkstream}
        isOpen={!!selectedTask}
        onClose={() => { setSelectedTask(null); setSelectedWorkstream(null); }}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default Dashboard;
