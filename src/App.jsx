import React, { useState } from 'react';
import {
  LayoutDashboard, Calendar, Users, Layers,
  Activity, GraduationCap
} from 'lucide-react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import Dashboard from './components/Dashboard';
import MasterTimeline from './components/MasterTimeline';
import Workstreams from './components/Workstreams';
import TeamView from './components/TeamView';
import ActivityLog from './components/ActivityLog';
import CountdownBanner from './components/CountdownBanner';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const { calculateOverallProgress, resetToDefault } = useProject();

  const navigationItems = [
    { id: 'dashboard', name: 'Painel Principal', icon: LayoutDashboard },
    { id: 'timeline', name: 'Cronograma Geral', icon: Calendar },
    { id: 'workstreams', name: 'Frentes de Trabalho', icon: Layers },
    { id: 'team', name: 'Equipe', icon: Users },
    { id: 'activity', name: 'Registro de Atividades', icon: Activity },
  ];

  const renderView = () => {
    try {
      switch (activeView) {
        case 'dashboard': return <Dashboard />;
        case 'timeline': return <MasterTimeline />;
        case 'workstreams': return <Workstreams />;
        case 'team': return <TeamView />;
        case 'activity': return <ActivityLog />;
        default: return <Dashboard />;
      }
    } catch (error) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro ao carregar {activeView}</h2>
          <p className="text-gray-600">Erro: {error.message}</p>
          <button
            onClick={() => setActiveView('dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar ao Painel
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SC Launch</h1>
              <p className="text-xs text-gray-500">Educação Santa Catarina</p>
            </div>
          </div>
        </div>

        <nav className="px-4 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar countdown */}
        <div className="px-4 pb-4">
          <CountdownBanner compact />
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Progresso Geral</div>
            <div className="text-sm font-bold text-blue-600">{calculateOverallProgress()}%</div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeView)?.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Atualizado: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Resetar Dados
            </button>
          </div>
        </header>

        <main className="p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
