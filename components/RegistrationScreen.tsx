
import React, { useState } from 'react';
import type { RegisteredUser } from '../types';
import type { SwapRequest } from '../types';

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
    password: '',
    confirmPassword: '',
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

      const { employeeName, employeeId, email, whatsapp, password, confirmPassword } = formData;
      
      if (!employeeName.trim() || !employeeId.trim() || !email.trim() || !whatsapp.trim() || !password.trim()) {
        setError('Todos los campos son obligatorios.');
        return;
      }

      if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          return;
      }

      if (password.length < 4) {
          setError('La contraseña debe tener al menos 4 caracteres.');
          return;
      }

      const trimmedEmail = email.trim();
      const trimmedWhatsapp = whatsapp.replace(/\s/g, '').trim();

      // Regex Validations
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
          setError('Por favor, introduce un email válido.');
          return;
      }

      const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
      if (!phoneRegex.test(trimmedWhatsapp)) {
          setError('Por favor, introduce un número de teléfono válido (Ej: 612345678).');
          return;
      }

      // Check duplicates
      if (allUsers.some(user => user.employeeId === employeeId.trim())) {
          setError('Este número de empleado ya está registrado.');
          return;
      }
      if (allUsers.some(user => user.email.toLowerCase() === trimmedEmail.toLowerCase())) {
          setError('Este email ya está registrado.');
          return;
      }

      if (!agreedToTerms) {
        setError('Debes aceptar las condiciones de uso.');
        return;
    }

    onRegister({ 
        employeeName,
        employeeId,
        employeeType: formData.employeeType,
        email: trimmedEmail, 
        whatsapp: trimmedWhatsapp,
        initialAssignment: [], // Will be set inside the app
        password: password
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-teal-600">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                Registro de Usuario
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Nº Empleado</label>
                        <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                    <div>
                        <label htmlFor="employeeType" className="block text-sm font-medium text-gray-700">Grupo</label>
                        <select name="employeeType" id="employeeType" value={formData.employeeType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500">
                            <option value="Conductor">Conductor</option>
                            <option value="Taller">Taller</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <input type="text" name="employeeName" id="employeeName" value={formData.employeeName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
                    <input type="tel" name="whatsapp" id="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="612345678" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                </div>

                <div className="pt-4">
                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                            Acepto las condiciones de uso y privacidad.
                        </label>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
                
                <button 
                    type="submit" 
                    disabled={!agreedToTerms}
                    className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Registrarse
                </button>
            </form>

            <div className="mt-6 text-center">
                <button onClick={onGoToLogin} className="font-medium text-teal-600 hover:text-teal-500 text-sm">
                ¿Ya tienes cuenta? Inicia sesión
                </button>
            </div>
        </div>
    </div>
  );
};

export default RegistrationScreen;
