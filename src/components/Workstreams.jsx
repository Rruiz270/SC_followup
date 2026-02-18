import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, Clock, CheckCircle,
  AlertCircle, Scale, Handshake, Laptop,
  ClipboardCheck, MapPin, FileText, Plus
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import TaskEditModal from './TaskEditModal';

const iconMap = {
  Scale, Handshake, Laptop, ClipboardCheck, MapPin, FileText,
};

const Workstreams = () => {
  const { projectData, updateTask, addTask } = useProject();
  const [expandedWs, setExpandedWs] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedWorkstream, setSelectedWorkstream] = useState(null);
  const [addingToWs, setAddingToWs] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleTaskClick = (task, ws) => {
    setSelectedTask(task);
    setSelectedWorkstream(ws);
  };

  const handleTaskSave = (updatedTask) => {
    updateTask(updatedTask.id, updatedTask);
  };

  const handleAddTask = (wsId) => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `new-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'not-started',
      priority: 'medium',
      dueDate: '2026-04-25',
      assignees: [],
      progress: 0,
      description: '',
      subtasks: [],
    };
    addTask(wsId, newTask);
    setNewTaskTitle('');
    setAddingToWs(null);
  };

  const getStatusBadge = (status) => {
    const map = {
      'not-started': { label: 'Não Iniciada', cls: 'bg-gray-100 text-gray-700' },
      'in-progress': { label: 'Em Andamento', cls: 'bg-blue-100 text-blue-700' },
      'urgent': { label: 'Urgente', cls: 'bg-red-100 text-red-700' },
      'completed': { label: 'Concluída', cls: 'bg-green-100 text-green-700' },
    };
    return map[status] || map['not-started'];
  };

  const getPriorityBadge = (priority) => {
    const map = {
      critical: { label: 'Crítica', cls: 'bg-red-100 text-red-700' },
      high: { label: 'Alta', cls: 'bg-orange-100 text-orange-700' },
      medium: { label: 'Média', cls: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Baixa', cls: 'bg-green-100 text-green-700' },
    };
    return map[priority] || map.medium;
  };

  const totalTasks = projectData.workstreams.reduce((s, ws) => s + ws.tasks.length, 0);
  const completedTasks = projectData.workstreams.reduce((s, ws) => s + ws.tasks.filter(t => t.status === 'completed').length, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">{projectData.workstreams.length}</div>
            <div className="text-sm text-gray-600">Frentes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">{totalTasks}</div>
            <div className="text-sm text-gray-600">Tarefas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-gray-600">Concluídas</div>
          </div>
        </div>
      </div>

      {/* Workstreams */}
      <div className="space-y-4">
        {projectData.workstreams.map((ws) => {
          const Icon = iconMap[ws.icon] || Laptop;
          const isExpanded = expandedWs === ws.id;
          const wsCompleted = ws.tasks.filter(t => t.status === 'completed').length;
          const avgProgress = ws.tasks.length > 0
            ? Math.round(ws.tasks.reduce((s, t) => s + t.progress, 0) / ws.tasks.length)
            : 0;

          return (
            <div key={ws.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedWs(isExpanded ? null : ws.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${ws.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: ws.color }} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">{ws.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Líder: {ws.leads.join(', ')} - {ws.tasks.length} tarefas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{avgProgress}%</div>
                      <div className="text-xs text-gray-500">{wsCompleted}/{ws.tasks.length}</div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${avgProgress}%`, backgroundColor: ws.color }} />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-5 space-y-3">
                  {ws.description && (
                    <p className="text-sm text-gray-600 mb-3">{ws.description}</p>
                  )}

                  {ws.tasks.map((task) => {
                    const statusBadge = getStatusBadge(task.status);
                    const priorBadge = getPriorityBadge(task.priority);
                    return (
                      <div
                        key={task.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleTaskClick(task, ws)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${statusBadge.cls}`}>{statusBadge.label}</span>
                              <span className={`px-2 py-0.5 rounded-full font-medium ${priorBadge.cls}`}>{priorBadge.label}</span>
                              <span className="text-gray-500">
                                Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                              </span>
                              {task.assignees && task.assignees.length > 0 && (
                                <span className="text-gray-500">{task.assignees.join(', ')}</span>
                              )}
                            </div>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                Subtarefas: {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                              </div>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xl font-bold" style={{ color: ws.color }}>{task.progress}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Task */}
                  {addingToWs === ws.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(ws.id)}
                        placeholder="Título da nova tarefa"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddTask(ws.id)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => { setAddingToWs(null); setNewTaskTitle(''); }}
                        className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-md"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingToWs(ws.id); }}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nova Tarefa</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
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

export default Workstreams;
