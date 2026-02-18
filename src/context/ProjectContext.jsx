import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PROJECT_DATA } from '../data/projectData';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

const STORAGE_KEY = 'sc-launch-control-data';
const LOG_KEY = 'sc-launch-control-log';

export const ProjectProvider = ({ children }) => {
  const [projectData, setProjectData] = useState(PROJECT_DATA);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setProjectData(JSON.parse(savedData));
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
    const savedLog = localStorage.getItem(LOG_KEY);
    if (savedLog) {
      try {
        setActivityLog(JSON.parse(savedLog));
      } catch (e) {
        console.error('Erro ao carregar log:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
  }, [projectData]);

  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(activityLog));
  }, [activityLog]);

  const addLogEntry = useCallback((action, details) => {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      ...details,
    };
    setActivityLog(prev => [entry, ...prev]);
  }, []);

  const updateTask = useCallback((taskId, updatedFields) => {
    let oldTask = null;
    let wsName = '';
    projectData.workstreams.forEach(ws => {
      const t = ws.tasks.find(tk => tk.id === taskId);
      if (t) { oldTask = t; wsName = ws.name; }
    });

    setProjectData(prev => ({
      ...prev,
      workstreams: prev.workstreams.map(ws => ({
        ...ws,
        tasks: ws.tasks.map(task =>
          task.id === taskId ? { ...task, ...updatedFields } : task
        ),
      })),
    }));

    const changes = [];
    if (oldTask) {
      if (updatedFields.status && updatedFields.status !== oldTask.status) changes.push(`status: ${oldTask.status} → ${updatedFields.status}`);
      if (updatedFields.progress !== undefined && updatedFields.progress !== oldTask.progress) changes.push(`progresso: ${oldTask.progress}% → ${updatedFields.progress}%`);
      if (updatedFields.title && updatedFields.title !== oldTask.title) changes.push(`título alterado`);
      if (updatedFields.priority && updatedFields.priority !== oldTask.priority) changes.push(`prioridade: ${oldTask.priority} → ${updatedFields.priority}`);
    }

    addLogEntry('task_updated', {
      taskId,
      taskTitle: updatedFields.title || oldTask?.title || taskId,
      workstream: wsName,
      changes: changes.length > 0 ? changes : ['tarefa atualizada'],
    });
  }, [projectData, addLogEntry]);

  const addTask = useCallback((workstreamId, newTask) => {
    const ws = projectData.workstreams.find(w => w.id === workstreamId);
    setProjectData(prev => ({
      ...prev,
      workstreams: prev.workstreams.map(w =>
        w.id === workstreamId
          ? { ...w, tasks: [...w.tasks, newTask] }
          : w
      ),
    }));
    addLogEntry('task_created', {
      taskId: newTask.id,
      taskTitle: newTask.title,
      workstream: ws?.name || workstreamId,
    });
  }, [projectData, addLogEntry]);

  const deleteTask = useCallback((taskId) => {
    let taskTitle = '';
    let wsName = '';
    projectData.workstreams.forEach(ws => {
      const t = ws.tasks.find(tk => tk.id === taskId);
      if (t) { taskTitle = t.title; wsName = ws.name; }
    });

    setProjectData(prev => ({
      ...prev,
      workstreams: prev.workstreams.map(ws => ({
        ...ws,
        tasks: ws.tasks.filter(task => task.id !== taskId),
      })),
    }));
    addLogEntry('task_deleted', { taskId, taskTitle, workstream: wsName });
  }, [projectData, addLogEntry]);

  const updateMilestone = useCallback((milestoneId, updates) => {
    setProjectData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === milestoneId ? { ...m, ...updates } : m
      ),
    }));
    const ms = projectData.milestones.find(m => m.id === milestoneId);
    addLogEntry('milestone_updated', {
      milestoneId,
      milestoneTitle: ms?.title || milestoneId,
      changes: updates.status ? [`status: ${updates.status}`] : ['atualizado'],
    });
  }, [projectData, addLogEntry]);

  const resetToDefault = useCallback(() => {
    setProjectData(PROJECT_DATA);
    setActivityLog([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOG_KEY);
  }, []);

  const getTasksByStatus = useCallback((status) => {
    const tasks = [];
    projectData.workstreams.forEach(ws => {
      ws.tasks.forEach(task => {
        if (task.status === status) {
          tasks.push({ ...task, workstreamId: ws.id, workstreamName: ws.name, workstreamColor: ws.color });
        }
      });
    });
    return tasks;
  }, [projectData]);

  const getUpcomingDeadlines = useCallback((days = 30) => {
    const tasks = [];
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    projectData.workstreams.forEach(ws => {
      ws.tasks.forEach(task => {
        const taskDate = new Date(task.dueDate);
        if (taskDate >= today && taskDate <= futureDate) {
          tasks.push({
            ...task,
            workstreamId: ws.id,
            workstreamName: ws.name,
            workstreamColor: ws.color,
            daysUntilDue: Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24)),
          });
        }
      });
    });
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [projectData]);

  const calculateOverallProgress = useCallback(() => {
    let total = 0;
    let sum = 0;
    projectData.workstreams.forEach(ws => {
      ws.tasks.forEach(task => {
        total++;
        sum += task.progress;
      });
    });
    return total > 0 ? Math.round(sum / total) : 0;
  }, [projectData]);

  const getWorkstreamById = useCallback((id) => {
    return projectData.workstreams.find(ws => ws.id === id);
  }, [projectData]);

  const getTaskById = useCallback((taskId) => {
    for (const ws of projectData.workstreams) {
      const task = ws.tasks.find(t => t.id === taskId);
      if (task) return { ...task, workstreamId: ws.id, workstreamName: ws.name, workstreamColor: ws.color };
    }
    return null;
  }, [projectData]);

  const getTeamMember = useCallback((id) => {
    return projectData.team.find(m => m.id === id);
  }, [projectData]);

  const value = {
    projectData,
    activityLog,
    updateTask,
    addTask,
    deleteTask,
    updateMilestone,
    resetToDefault,
    getTasksByStatus,
    getUpcomingDeadlines,
    calculateOverallProgress,
    getWorkstreamById,
    getTaskById,
    getTeamMember,
    addLogEntry,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
