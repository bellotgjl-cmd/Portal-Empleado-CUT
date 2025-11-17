

import * as React from 'react';

const ConstructionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const AppCard: React.FC<{
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ title, description, onClick, disabled }) => {
    const baseClasses = "w-full p-6 rounded-xl shadow-lg text-left transition-all duration-300 transform flex flex-col justify-between h-full";
    const enabledClasses = "bg-white hover:shadow-2xl hover:-translate-y-2 cursor-pointer";
    const disabledClasses = "bg-gray-100 border border-gray-200 cursor-not-allowed";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}
        >
            <div>
                <h3 className={`text-2xl font-bold ${disabled ? 'text-gray-500' : 'text-gray-900'}`}>{title}</h3>
                <p className={`mt-2 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
            </div>
            {disabled && (
                 <div className="mt-4 flex items-center justify-end text-sm font-semibold text-yellow-800 bg-yellow-200/80 px-3 py-1 rounded-full self-end">
                    <ConstructionIcon />
                    <span>EN CONSTRUCCIÓN</span>
                </div>
            )}
        </button>
    );
}


const AppSelector: React.FC<{ onSelectApp: (app: string) => void }> = ({ onSelectApp }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800">Bienvenido/a</h2>
                <p className="mt-2 text-lg text-gray-500">Selecciona la herramienta de gestión que deseas utilizar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AppCard 
                    title="Cambio Vacaciones"
                    description="Gestiona y encuentra intercambios para tus Vacaciones. (Mes o Quincenas)."
                    onClick={() => onSelectApp('vacations')}
                />
                 <AppCard 
                    title="Cambio Descanso"
                    description="Organiza cambios en tus días de descanso con otros compañeros."
                    onClick={() => onSelectApp('rest')}
                />
                 <AppCard 
                    title="Cambio Servicio"
                    description="Solicita o acepta cambios de turno o servicio."
                    onClick={() => onSelectApp('shift')}
                    disabled
                />
                 <AppCard 
                    title="Tablón Anuncios"
                    description="Publica y consulta anuncios de interés general para el personal."
                    onClick={() => onSelectApp('board')}
                />
            </div>
        </div>
    );
};

export default AppSelector;