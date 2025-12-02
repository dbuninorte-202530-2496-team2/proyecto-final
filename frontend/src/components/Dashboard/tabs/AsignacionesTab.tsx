import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui/Card';
import { BookOpen, Users, Clock3 } from 'lucide-react';
import TutorAulaTab from './TutorAulaTab';
import AulaHorarioTab from './AulaHorarioTab';

const AsignacionesTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tutor-aula' | 'aula-horario'>('tutor-aula');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4 w-full">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              Asignaciones
            </CardTitle>
            <CardDescription>
              Gestión de asignaciones del programa.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tutor-aula')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'tutor-aula'
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Users className="w-4 h-4" />
            Tutor ↔ Aula
          </button>
          <button
            onClick={() => setActiveTab('aula-horario')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'aula-horario'
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Clock3 className="w-4 h-4" />
            Aula ↔ Horario
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'tutor-aula' ? <TutorAulaTab /> : <AulaHorarioTab />}
        </div>
      </CardContent>
    </Card>
  );
};

export default AsignacionesTab;
