import React, { useState } from 'react';
import type { RegisteredUser } from '../App';
import type { Announcement } from '../types';

const initialAnnouncements: Announcement[] = [
    { id: 'anno-1', author: 'Ana García', title: 'Cambio de turno extra', content: 'Busco cambiar mi turno extra del sábado por uno entre semana. Interesados contactar por WhatsApp.', createdAt: Date.now() - 86400000 * 1 },
    { id: 'anno-2', author: 'Recursos Humanos', title: 'Actualización Política de Vacaciones', content: 'Se ha actualizado el documento de política de vacaciones en el portal interno. Por favor, revisadlo todos.', createdAt: Date.now() - 86400000 * 2 },
    { id: 'anno-3', author: 'Carlos Rodriguez', title: 'Encontrada chaqueta en sala de descanso', content: 'He encontrado una chaqueta de color negro en la sala de descanso del personal de conducción. El propietario puede pasar a recogerla.', createdAt: Date.now() - 3600000 * 3 },
    { id: 'anno-4', author: 'Comité de Empresa', title: 'Próxima reunión informativa', content: 'La próxima reunión informativa sobre el nuevo convenio será el día 15 del mes que viene a las 10:00 en la sala principal.', createdAt: Date.now() - 86400000 * 3 },
    { id: 'anno-5', author: 'Sofía Martínez', title: 'Venta de Herramientas', content: 'Vendo juego de llaves de vaso casi nuevo. Ideal para mecánicos. Interesados, preguntad por mí en el taller.', createdAt: Date.now() - 86400000 * 5 },
    { id: 'anno-6', author: 'Administración', title: 'Recordatorio Cierre Parking Norte', content: 'Recordamos que el parking norte estará cerrado por obras durante toda la semana que viene. Usad el parking sur.', createdAt: Date.now() - 3600000 * 8 },
    { id: 'anno-7', author: 'Javier Moreno', title: 'Organización de cena de Navidad', content: 'Estamos empezando a organizar la cena de Navidad. Buscamos voluntarios para el comité organizador. ¡Animaos!', createdAt: Date.now() - 86400000 * 1 },
    { id: 'anno-8', author: 'David López', title: 'Plaza de garaje en alquiler', content: 'Alquilo plaza de garaje grande cerca de las cocheras. Precio especial para compañeros. Contactad para más info.', createdAt: Date.now() - 86400000 * 6 },
    { id: 'anno-9', author: 'Seguridad y Salud', title: 'Campaña de vacunación contra la gripe', content: 'La campaña de vacunación de este año comenzará la primera semana de Octubre. Pronto publicaremos las fechas y horarios.', createdAt: Date.now() - 86400000 * 4 },
    { id: 'anno-10', author: 'Lucía Fernández', title: 'Objeto perdido: Gafas', content: 'He perdido unas gafas graduadas con montura azul. Creo que fue en el bus de la línea 5. Si alguien las encuentra, por favor, avíseme.', createdAt: Date.now() - 3600000 * 1 },
];


interface TablonAnunciosAppProps {
    registeredUser: RegisteredUser;
}

const TablonAnunciosApp: React.FC<TablonAnunciosAppProps> = ({ registeredUser }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements.sort((a,b) => b.createdAt - a.createdAt));
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim() === '' || newContent.trim() === '') {
            setError('El título y el contenido no pueden estar vacíos.');
            return;
        }

        const newAnnouncement: Announcement = {
            id: `anno-${Date.now()}`,
            author: registeredUser.employeeName,
            title: newTitle,
            content: newContent,
            createdAt: Date.now(),
        };

        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setNewTitle('');
        setNewContent('');
        setError(null);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                    Tablón de Anuncios
                </h1>
                <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
                    Un espacio para comunicados, avisos y anuncios de interés para todo el personal.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4">
                     {announcements.map(anno => (
                        <div key={anno.id} className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-xl text-indigo-700">{anno.title}</h4>
                                    <p className="text-sm text-gray-600 font-semibold">
                                        Publicado por: {anno.author}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 flex-shrink-0 ml-4">
                                    {new Date(anno.createdAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <p className="mt-4 text-gray-800 bg-gray-50 p-3 rounded-md border">{anno.content}</p>
                        </div>
                    ))}
                </div>

                <div className="sticky top-8 bg-white p-6 rounded-xl shadow-lg border">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">Publicar Nuevo Anuncio</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                id="title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Asunto del anuncio"
                            />
                        </div>
                         <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                            <textarea
                                id="content"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Escribe aquí los detalles de tu anuncio..."
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-lg">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                        >
                            Publicar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TablonAnunciosApp;
