import React, { useState } from 'react';
import type { RegisteredUser } from '../types';
import type { SwapRequest } from '../types';
import { IS_DEVELOPMENT_MODE } from '../constants';

interface RegistrationScreenProps {
  allUsers: SwapRequest[];
  onRegister: (userData: RegisteredUser) => void;
  onGoToLogin: () => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ allUsers, onRegister, onGoToLogin }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    employeeType: 'Conductor' as 'Conductor' | 'Taller',
    email: '',
    whatsapp: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { employeeName, employeeId, email, whatsapp } = formData;
    if (!employeeName.trim() || !employeeId.trim() || !email.trim() || !whatsapp.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // --- Validation Checks ---
    // These checks are skipped if IS_DEVELOPMENT_MODE is true.
    if (!IS_DEVELOPMENT_MODE) {
        const trimmedEmail = email.trim();
        const trimmedWhatsapp = whatsapp.trim();

        const isBlocked = allUsers.some(user => 
            user.status === 'blocked' && (user.email === trimmedEmail || user.whatsapp === trimmedWhatsapp)
        );

        if (isBlocked) {
            setError('El email o WhatsApp proporcionado está asociado a una cuenta bloqueada. No puedes registrarte. Contacta con el administrador.');
            return;
        }
        
        if (allUsers.some(user => user.employeeId === employeeId.trim())) {
            setError('Este número de empleado ya está registrado. Por favor, inicia sesión.');
            return;
        }

        if (allUsers.some(user => user.email === trimmedEmail)) {
            setError('Este email ya está registrado. Por favor, inicia sesión o usa otro email.');
            return;
        }

        if (allUsers.some(user => user.whatsapp === trimmedWhatsapp)) {
            setError('Este número de WhatsApp ya está registrado. Por favor, inicia sesión o usa otro número.');
            return;
        }
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Por favor, introduce un email válido.');
        return;
    }
    if (!agreedToTerms) {
        setError('Debes aceptar las condiciones de uso para registrarte.');
        return;
    }
    onRegister({ ...formData, email: email.trim(), whatsapp: whatsapp.trim() });
  };

  return (
    <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Registro de Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Nº Empleado</label>
                <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input type="text" name="employeeName" id="employeeName" value={formData.employeeName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                <label htmlFor="employeeType" className="block text-sm font-medium text-gray-700">Grupo</label>
                <select name="employeeType" id="employeeType" value={formData.employeeType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900">
                    <option value="Conductor">Conductor</option>
                    <option value="Taller">Taller</option>
                </select>
                </div>
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp (ej: 612345678)</label>
                <input type="tel" name="whatsapp" id="whatsapp" value={formData.whatsapp} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                
                <div className="pt-4 space-y-3">
                    <div className="bg-gray-100 p-3 rounded-lg border max-h-32 overflow-y-auto text-xs text-gray-600">
                        <h4 className="font-bold text-sm text-gray-800 mb-2">Condiciones de Uso</h4>
                        <p>1. Esta plataforma es exclusivamente para empleados. El uso no autorizado está prohibido.</p>
                        <p>2. Toda la información personal (nombre, email, WhatsApp) será visible para otros empleados con el fin de facilitar los intercambios.</p>
                        <p>3. Los intercambios acordados en esta plataforma son acuerdos entre empleados. La formalización final siempre debe ser comunicada y aprobada por el departamento correspondiente según los procedimientos habituales de la empresa.</p>
                        <p>4. El uso de esta herramienta implica una conducta respetuosa y profesional. Cualquier abuso podrá resultar en la revocación del acceso.</p>
                        <p>5. La plataforma no se hace responsable de los acuerdos fallidos o no formalizados.</p>
                    </div>
                    <div className="flex items-center">
                        <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        He leído y acepto las condiciones de uso.
                        </label>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
                
                <button 
                    type="submit" 
                    disabled={!agreedToTerms}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Registrarse y Entrar
                </button>
            </form>
            <div className="mt-6 text-center">
                <button onClick={onGoToLogin} className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">
                ¿Ya tienes cuenta? Inicia sesión
                </button>
            </div>
        </div>
    </div>
  );
};

export default RegistrationScreen;