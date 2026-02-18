import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const TaskEditModal = ({ task, workstream, isOpen, onClose, onSave }) => {
  const { projectData } = useProject();
  const [editedTask, setEditedTask] = useState(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task, subtasks: task.subtasks || [] });
    }
  }, [task]);

  if (!isOpen || !task || !editedTask) return null;

  const statusOptions = [
    { value: 'not-started', label: 'Não Iniciada' },
    { value: 'in-progress', label: 'Em Andamento' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'completed', label: 'Concluída' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' },
  ];

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const updateSubtask = (subtaskId, completed) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed } : st
      ),
    }));
  };

  const addSubtask = () => {
    const newSt = {
      id: `${editedTask.id}.${editedTask.subtasks.length + 1}`,
      title: '',
      completed: false,
    };
    setEditedTask(prev => ({ ...prev, subtasks: [...prev.subtasks, newSt] }));
  };

  const removeSubtask = (subtaskId) => {
    setEditedTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subtaskId),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: workstream?.color }} />
            <h3 className="text-xl font-semibold text-gray-900">Editar Tarefa</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Assignees + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsáveis</label>
              <input
                type="text"
                value={(editedTask.assignees || []).join(', ')}
                onChange={(e) => setEditedTask({ ...editedTask, assignees: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input
                type="date"
                value={editedTask.dueDate}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progresso ({editedTask.progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={editedTask.progress}
              onChange={(e) => setEditedTask({ ...editedTask, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Subtarefas ({editedTask.subtasks.filter(s => s.completed).length}/{editedTask.subtasks.length})
              </label>
              <button onClick={addSubtask} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + Adicionar
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {editedTask.subtasks.map((st) => (
                <div key={st.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={(e) => updateSubtask(st.id, e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => {
                      setEditedTask(prev => ({
                        ...prev,
                        subtasks: prev.subtasks.map(s =>
                          s.id === st.id ? { ...s, title: e.target.value } : s
                        ),
                      }));
                    }}
                    placeholder="Descreva a subtarefa"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button onClick={() => removeSubtask(st.id)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">Frente: {workstream?.name}</div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
