

import * as React from 'react';
import type { RegisteredUser } from '../types';
import type { Announcement, AnnouncementCategory, Comment, SwapRequest } from '../types';
import ArchiveAnnouncementModal from './ArchiveAnnouncementModal';

const initialAnnouncements: Announcement[] = [
    { id: 'anno-1', authorId: 'C001', author: 'Ana García', title: 'Cambio de turno extra', content: 'Busco cambiar mi turno extra del sábado por uno entre semana. Interesados contactar por WhatsApp.', createdAt: Date.now() - 86400000 * 1, expiresAt: Date.now() + 86400000 * 29, category: 'avisos_generales', includeContact: true, comments: [], status: 'active' },
    { id: 'anno-2', authorId: 'system', author: 'Recursos Humanos', title: 'Actualización Política de Vacaciones', content: 'Se ha actualizado el documento de política de vacaciones en el portal interno. Por favor, revisadlo todos.', createdAt: Date.now() - 86400000 * 2, expiresAt: Date.now() + 86400000 * 28, category: 'avisos_generales', includeContact: false, comments: [], status: 'active' },
    { id: 'anno-3', authorId: 'C002', author: 'Carlos Rodriguez', title: 'Encontrada chaqueta en sala de descanso', content: 'He encontrado una chaqueta de color negro en la sala de descanso del personal de conducción. El propietario puede pasar a recogerla.', createdAt: Date.now() - 3600000 * 3, expiresAt: Date.now() + 86400000 * 15, category: 'objetos_perdidos', includeContact: true, comments: [], status: 'active' },
    { id: 'anno-4', authorId: 'system', author: 'Comité de Empresa', title: 'Próxima reunión informativa', content: 'La próxima reunión informativa sobre el nuevo convenio será el día 15 del mes que viene a las 10:00 en la sala principal.', createdAt: Date.now() - 86400000 * 3, expiresAt: Date.now() - 86400000 * 1, category: 'avisos_generales', includeContact: false, comments: [], status: 'active' },
    { id: 'anno-5', authorId: 'T001', author: 'Sofía Martínez', title: 'Venta de Herramientas', content: 'Vendo juego de llaves de vaso casi nuevo. Ideal para mecánicos. Interesados, preguntad por mí en el taller.', createdAt: Date.now() - 86400000 * 5, expiresAt: Date.now() + 86400000 * 25, category: 'mercadillo', includeContact: true, comments: [], status: 'active' },
    { id: 'anno-6', authorId: 'system', author: 'Administración', title: 'Recordatorio Cierre Parking Norte', content: 'Recordamos que el parking norte estará cerrado por obras durante toda la semana que viene. Usad el parking sur.', createdAt: Date.now() - 3600000 * 8, expiresAt: Date.now() - 86400000 * 2, category: 'avisos_generales', includeContact: false, comments: [], status: 'active' },
    { id: 'anno-7', authorId: 'C004', author: 'Javier Moreno', title: 'Organización de cena de Navidad', content: 'Estamos empezando a organizar la cena de Navidad. Buscamos voluntarios para el comité organizador. ¡Animaos!', createdAt: Date.now() - 86400000 * 1, expiresAt: Date.now() + 86400000 * 20, category: 'avisos_generales', includeContact: false, comments: [], status: 'active' },
    { id: 'anno-8', authorId: 'T002', author: 'David López', title: 'Plaza de garaje en alquiler', content: 'Alquilo plaza de garaje grande cerca de las cocheras. Precio especial para compañeros. Contactad para más info.', createdAt: Date.now() - 86400000 * 6, expiresAt: Date.now() + 86400000 * 24, category: 'mercadillo', includeContact: true, comments: [], status: 'active' },
    { id: 'anno-10', authorId: 'C003', author: 'Lucía Fernández', title: 'Objeto perdido: Gafas', content: 'He perdido unas gafas graduadas con montura azul. Creo que fue en el bus de la línea 5. Si alguien las encuentra, por favor, avíseme.', createdAt: Date.now() - 3600000 * 1, expiresAt: Date.now() + 86400000 * 10, category: 'objetos_perdidos', includeContact: true, comments: [{id: 'comment-1', authorId: 'C001', authorName: 'Ana García', content: '¿Has mirado en la oficina de objetos perdidos de cocheras?', createdAt: Date.now() - 1800000 }], status: 'active' },
];


interface TablonAnunciosAppProps {
    registeredUser: RegisteredUser;
    allUsers: SwapRequest[];
}

const CategoryPill: React.FC<{ category: AnnouncementCategory }> = ({ category }) => {
    const categoryInfo = {
        mercadillo: {
            text: 'Mercadillo',
            classes: 'bg-green-100 text-green-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        },
        objetos_perdidos: {
            text: 'Objetos Perdidos',
            classes: 'bg-yellow-100 text-yellow-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        },
        avisos_generales: {
            text: 'Avisos',
            classes: 'bg-blue-100 text-blue-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.378 1.282 18.735 1 19 1s.622.282.832.486M5.436 13.683L5 15a4 4 0 006.928 2.572" /></svg>
        },
    };
    const { text, classes, icon } = categoryInfo[category];
    return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${classes}`}>{icon}{text}</span>;
};

const ArchiveReasonPill: React.FC<{ reason?: 'success' | 'no_reason' | 'expired' }> = ({ reason }) => {
    const reasonInfo = {
        success: { text: 'Éxito', classes: 'bg-green-100 text-green-800' },
        expired: { text: 'Caducado', classes: 'bg-yellow-100 text-yellow-800' },
        no_reason: { text: 'Archivado', classes: 'bg-gray-200 text-gray-800' },
    };
    if (!reason) return null;

    const { text, classes } = reasonInfo[reason];
    return <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${classes}`}>{text}</span>;
};


const TablonAnunciosApp: React.FC<TablonAnunciosAppProps> = ({ registeredUser, allUsers }) => {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>(initialAnnouncements);
    const [newTitle, setNewTitle] = React.useState('');
    const [newContent, setNewContent] = React.useState('');
    const [newCategory, setNewCategory] = React.useState<AnnouncementCategory>('avisos_generales');
    const [newExpiresAt, setNewExpiresAt] = React.useState('');
    const [includeContact, setIncludeContact] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = React.useState<'all' | AnnouncementCategory>('all');
    const [boardView, setBoardView] = React.useState<'active' | 'archived'>('active');
    const [expandedCommentsId, setExpandedCommentsId] = React.useState<string | null>(null);
    const [replyInputs, setReplyInputs] = React.useState<Record<string, string>>({});
    
    // User-specific states for followed and hidden announcements
    const [followedAnnouncements, setFollowedAnnouncements] = React.useState<Record<string, number>>({});
    const [hiddenAnnouncements, setHiddenAnnouncements] = React.useState<string[]>([]);
    const [specialView, setSpecialView] = React.useState<'none' | 'hidden' | 'favorites' | 'my_posts'>('none');
    const [archivingAnnouncement, setArchivingAnnouncement] = React.useState<Announcement | null>(null);


    const followedStorageKey = `followed_announcements_${registeredUser.employeeId}`;
    const hiddenStorageKey = `hidden_announcements_${registeredUser.employeeId}`;

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    const maxDate = oneMonthFromNow.toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];

    React.useEffect(() => {
        setNewExpiresAt(maxDate);
        try {
            const storedFollowed = localStorage.getItem(followedStorageKey);
            if (storedFollowed) setFollowedAnnouncements(JSON.parse(storedFollowed));

            const storedHidden = localStorage.getItem(hiddenStorageKey);
            if (storedHidden) setHiddenAnnouncements(JSON.parse(storedHidden));
        } catch (e) {
            console.error("Failed to load user preferences from localStorage", e);
        }
    }, [registeredUser.employeeId]);

    React.useEffect(() => {
        const now = Date.now();
        const needsArchiving = announcements.some(
            anno => anno.status === 'active' && anno.expiresAt <= now
        );

        if (needsArchiving) {
            setAnnouncements(prev =>
                prev.map(anno =>
                    anno.status === 'active' && anno.expiresAt <= now
                        ? { ...anno, status: 'archived', archiveReason: 'expired' }
                        : anno
                )
            );
        }
    }, [announcements]);

    React.useEffect(() => {
        localStorage.setItem(followedStorageKey, JSON.stringify(followedAnnouncements));
    }, [followedAnnouncements, followedStorageKey]);

    React.useEffect(() => {
        localStorage.setItem(hiddenStorageKey, JSON.stringify(hiddenAnnouncements));
    }, [hiddenAnnouncements, hiddenStorageKey]);

    const handleToggleFollow = (announcementId: string) => {
        setFollowedAnnouncements(prev => {
            const newFollowed = { ...prev };
            if (newFollowed[announcementId]) {
                delete newFollowed[announcementId];
            } else {
                newFollowed[announcementId] = Date.now();
            }
            return newFollowed;
        });
    };

    const handleHide = (announcementId: string) => {
        if (!hiddenAnnouncements.includes(announcementId)) {
            setHiddenAnnouncements(prev => [...prev, announcementId]);
        }
    };
    
    const handleUnhide = (announcementId: string) => {
        setHiddenAnnouncements(prev => prev.filter(id => id !== announcementId));
    };

    const handleToggleComments = (announcementId: string) => {
        setExpandedCommentsId(prev => (prev === announcementId ? null : announcementId));
        // If the announcement is followed, mark its comments as "seen" by updating the timestamp
        if (followedAnnouncements[announcementId]) {
            setFollowedAnnouncements(prev => ({ ...prev, [announcementId]: Date.now() }));
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim() === '' || newContent.trim() === '' || !newCategory || !newExpiresAt) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        const newAnnouncement: Announcement = {
            id: `anno-${Date.now()}`,
            authorId: registeredUser.employeeId,
            author: registeredUser.employeeName,
            title: newTitle,
            content: newContent,
            createdAt: Date.now(),
            expiresAt: new Date(newExpiresAt).getTime() + 86400000, // End of selected day
            category: newCategory,
            includeContact: includeContact,
            comments: [],
            status: 'active',
            renewalCount: 0,
        };

        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setNewTitle('');
        setNewContent('');
        setNewCategory('avisos_generales');
        setNewExpiresAt(maxDate);
        setIncludeContact(true);
        setError(null);
    };
    
    const handlePostReply = (announcementId: string) => {
        const content = replyInputs[announcementId];
        if (!content || content.trim() === '') return;

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            authorId: registeredUser.employeeId,
            authorName: registeredUser.employeeName,
            content: content,
            createdAt: Date.now(),
        };

        setAnnouncements(prev => prev.map(anno => {
            if (anno.id === announcementId) {
                return { ...anno, comments: [...anno.comments, newComment] };
            }
            return anno;
        }));
        
        setReplyInputs(prev => ({ ...prev, [announcementId]: '' }));
    };
    
    const handleArchive = (announcementId: string, reason: 'success' | 'no_reason') => {
        setAnnouncements(prev =>
            prev.map(anno =>
                anno.id === announcementId
                    ? { ...anno, status: 'archived', archiveReason: reason }
                    : anno
            )
        );
        setArchivingAnnouncement(null);
    };

    const handleReactivate = (announcementId: string) => {
        setAnnouncements(prev =>
            prev.map(anno => {
                if (anno.id === announcementId) {
                    const newExpiresAt = new Date();
                    newExpiresAt.setDate(newExpiresAt.getDate() + 30); // 30 days from now

                    return {
                        ...anno,
                        status: 'active',
                        archiveReason: undefined,
                        expiresAt: newExpiresAt.getTime(),
                        renewalCount: (anno.renewalCount || 0) + 1,
                        createdAt: Date.now(), // Update creation date to bring it to the top
                    };
                }
                return anno;
            })
        );
        setBoardView('active');
    };

    const myPostsCount = announcements.filter(anno => anno.authorId === registeredUser.employeeId).length;

    const filteredAnnouncements = announcements.filter(anno => {
        if (specialView === 'hidden') {
            return hiddenAnnouncements.includes(anno.id);
        }

        if (specialView === 'my_posts') {
            return anno.authorId === registeredUser.employeeId;
        }
        
        // Exclude hidden items from all other views
        if (hiddenAnnouncements.includes(anno.id)) return false;

        if (specialView === 'favorites') {
            return followedAnnouncements[anno.id] !== undefined;
        }

        // specialView is 'none', apply normal filters
        if (boardView === 'active' && anno.status !== 'active') return false;
        if (boardView === 'archived' && anno.status !== 'archived') return false;
        
        if (categoryFilter !== 'all' && anno.category !== categoryFilter) return false;
        
        return true;
    }).sort((a,b) => b.createdAt - a.createdAt);

    const getCategoryFilterButtonClasses = (buttonFilter: 'all' | AnnouncementCategory) => {
        const base = "px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none flex-grow text-center";
        if (categoryFilter === buttonFilter) {
            return `${base} bg-indigo-600 text-white shadow`;
        }
        return `${base} bg-gray-200 text-gray-700 hover:bg-gray-300`;
    };

    const getBoardViewButtonClasses = (buttonFilter: 'active' | 'archived') => {
        const base = "px-4 py-2 font-semibold rounded-md transition-colors duration-200 focus:outline-none";
         if (boardView === buttonFilter) {
            return `${base} bg-indigo-600 text-white shadow`;
        }
        return `${base} bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200`;
    };

    return (
        <>
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
                <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        {specialView === 'none' && (
                            <div className="flex space-x-2 p-1 bg-white rounded-lg border shadow-sm">
                                <button onClick={() => setBoardView('active')} className={getBoardViewButtonClasses('active')}>Activos</button>
                                <button onClick={() => setBoardView('archived')} className={getBoardViewButtonClasses('archived')}>Archivados</button>
                            </div>
                        )}
                        <div className="flex-grow flex justify-end items-center gap-2">
                            {specialView !== 'none' ? (
                                <button 
                                    onClick={() => setSpecialView('none')} 
                                    className="flex items-center px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15l-3-3m0 0l3-3m-3 3h12a6 6 0 010 12h-3" /></svg>
                                    Volver a Anuncios
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setSpecialView('my_posts')}
                                        className="flex items-center px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none bg-blue-500 text-white hover:bg-blue-600 shadow"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                        </svg>
                                        Mis Anuncios ({myPostsCount})
                                    </button>
                                    <button 
                                        onClick={() => setSpecialView('favorites')}
                                        className="flex items-center px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        Favoritos ({Object.keys(followedAnnouncements).length})
                                    </button>
                                    <button 
                                        onClick={() => setSpecialView('hidden')} 
                                        className="flex items-center px-4 py-2 font-semibold text-sm rounded-md transition-colors duration-200 focus:outline-none bg-gray-600 text-white hover:bg-gray-700 shadow"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-2.145 2.145" /></svg>
                                        Ocultos ({hiddenAnnouncements.length})
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {specialView === 'none' && (
                        <div className="flex space-x-2 p-1.5 bg-gray-100 rounded-lg flex-grow mb-4">
                            <button onClick={() => setCategoryFilter('all')} className={getCategoryFilterButtonClasses('all')}>Todos</button>
                            <button onClick={() => setCategoryFilter('mercadillo')} className={getCategoryFilterButtonClasses('mercadillo')}>Mercadillo</button>
                            <button onClick={() => setCategoryFilter('objetos_perdidos')} className={getCategoryFilterButtonClasses('objetos_perdidos')}>Objetos Perdidos</button>
                            <button onClick={() => setCategoryFilter('avisos_generales')} className={getCategoryFilterButtonClasses('avisos_generales')}>Avisos</button>
                        </div>
                    )}

                     <div className="space-y-4">
                        {filteredAnnouncements.length > 0 ? (
                            filteredAnnouncements.map(anno => {
                                const authorDetails = allUsers.find(u => u.employeeId === anno.authorId);
                                const isFollowed = !!followedAnnouncements[anno.id];
                                const isMyPost = anno.authorId === registeredUser.employeeId;
                                let hasNewComments = false;
                                if (isFollowed && anno.comments.length > 0) {
                                    const lastSeen = followedAnnouncements[anno.id];
                                    const latestCommentTime = Math.max(...anno.comments.map(c => c.createdAt));
                                    if (latestCommentTime > lastSeen) {
                                        hasNewComments = true;
                                    }
                                }
                                
                                let mailtoLink = '';
                                let whatsappLink = '';

                                if (authorDetails) {
                                    const subject = `Contacto sobre tu anuncio: "${anno.title}"`;
                                    let mailBody = `Hola ${authorDetails.employeeName},\n\nTe escribo en referencia a tu anuncio en el tablón con el título "${anno.title}".`;
                                    let whatsappText = `Hola ${authorDetails.employeeName}, te escribo sobre tu anuncio en el tablón: "${anno.title}".`;

                                    if (anno.comments.length > 0) {
                                        const commentsHeader = "\n\n--- Comentarios Recientes (del más nuevo al más antiguo) ---\n";
                                        const sortedComments = anno.comments.slice().sort((a, b) => b.createdAt - a.createdAt);
                                        const commentsString = sortedComments.map(c => 
                                            `- ${c.authorName} (${new Date(c.createdAt).toLocaleString('es-ES')}): "${c.content}"`
                                        ).join("\n");
                                        
                                        mailBody += commentsHeader + commentsString + "\n\nUn saludo.";
                                        whatsappText += commentsHeader + commentsString;
                                    } else {
                                        mailBody += "\n\nUn saludo.";
                                    }

                                    mailtoLink = `mailto:${authorDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
                                    whatsappLink = `https://wa.me/${authorDetails.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText)}`;
                                }
                                
                                const isDimmed = boardView === 'archived' || specialView === 'hidden';

                                return (
                                <div key={anno.id} className={`bg-white p-5 rounded-xl shadow-lg border ${isDimmed ? 'border-gray-100 opacity-80' : 'border-gray-200'}`}>
                                    <div className="flex justify-between items-start flex-wrap gap-y-2">
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-xl text-indigo-700">{anno.title}</h4>
                                            <p className="text-sm text-gray-600 font-semibold">
                                                Publicado por: {anno.author}
                                            </p>
                                             <p className="text-xs text-gray-500">
                                                {new Date(anno.createdAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3 flex-shrink-0">
                                            {(anno.renewalCount || 0) > 0 && (
                                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m-5.222 1.888a9 9 0 111.06 7.222M20 8h-5V3" /></svg>
                                                    Renovado {anno.renewalCount} {anno.renewalCount === 1 ? 'vez' : 'veces'}
                                                </span>
                                            )}
                                            {anno.status === 'archived' && <ArchiveReasonPill reason={anno.archiveReason} />}
                                            <CategoryPill category={anno.category} />

                                            {/* Unhide button: only in hidden view */}
                                            {specialView === 'hidden' && (
                                                <button onClick={() => handleUnhide(anno.id)} title="Mostrar anuncio" className="text-gray-400 hover:text-green-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Follow/Unfollow button: in active view (normal or favorites) */}
                                            {anno.status === 'active' && specialView !== 'hidden' && !isMyPost && (
                                                <button onClick={() => handleToggleFollow(anno.id)} title={isFollowed ? "Dejar de seguir" : "Seguir anuncio"} className="text-gray-400 hover:text-yellow-500 transition-colors">
                                                    {isFollowed ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}

                                            {/* Hide button: only in normal active view */}
                                            {anno.status === 'active' && boardView === 'active' && specialView === 'none' && (
                                                <button onClick={() => handleHide(anno.id)} title="Ocultar anuncio" className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m0 0l-2.145 2.145" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-gray-800 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">{anno.content}</p>
                                    
                                    <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                        <div className="flex-grow flex items-center gap-4">
                                            {anno.status === 'active' && (
                                                <p className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full inline-block">
                                                    Caduca el: {new Date(anno.expiresAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            )}
                                             {isMyPost && anno.status === 'active' && specialView !== 'hidden' && (
                                                <button onClick={() => setArchivingAnnouncement(anno)} className="text-xs font-bold py-1 px-3 rounded-full transition-colors bg-gray-600 text-white hover:bg-gray-700">
                                                    Archivar
                                                </button>
                                            )}
                                            {isMyPost && anno.status === 'archived' && specialView !== 'hidden' && (
                                                <button onClick={() => handleReactivate(anno.id)} className="text-xs font-bold py-1 px-3 rounded-full transition-colors bg-green-600 text-white hover:bg-green-700">
                                                    Reactivar Anuncio
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button 
                                                onClick={() => handleToggleComments(anno.id)}
                                                className={`flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors rounded-full px-3 py-1 ${hasNewComments ? 'animate-pulse-strong bg-yellow-100' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                Comentarios ({anno.comments.length}) {hasNewComments && <span className="ml-2 text-yellow-800 font-bold text-xs">NUEVO</span>}
                                            </button>
                                            
                                            {anno.includeContact && authorDetails && (
                                                <>
                                                    <a href={mailtoLink} target="_blank" rel="noopener noreferrer" title={`Enviar email a ${authorDetails.email}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    </a>
                                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" title={`Contactar por WhatsApp`} className="text-gray-400 hover:text-green-500 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.45 16.86L2.05 22L7.31 20.62C8.75 21.41 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 9.28 20.94 6.81 19.1 4.97C17.26 3.13 14.79 2.12 12.16 2.12L12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.5 17.87 6.05C19.42 7.61 20.28 9.67 20.28 11.88C20.28 16.45 16.63 20.1 12.04 20.1C10.5 20.1 9 19.64 7.74 18.86L7.33 18.61L4.43 19.43L5.27 16.61L5.02 16.19C4.16 14.86 3.78 13.33 3.78 11.88C3.78 7.31 7.43 3.67 12.04 3.67ZM9.11 7.23C8.89 7.23 8.7 7.22 8.51 7.22C8.2 7.22 7.88 7.31 7.69 7.62C7.5 7.93 6.87 8.54 6.87 9.71C6.87 10.88 7.71 11.99 7.85 12.17C8 12.35 9.08 14.03 10.8 14.8C12.21 15.44 12.56 15.58 13.04 15.77C13.78 16.06 14.36 16.02 14.78 15.65C15.28 15.21 15.71 14.54 15.89 14.23C16.08 13.92 16.17 13.74 16.12 13.56C16.08 13.38 15.89 13.29 15.65 13.17C15.42 13.06 14.25 12.49 14.02 12.4C13.78 12.31 13.6 12.26 13.41 12.57C13.22 12.88 12.72 13.45 12.58 13.61C12.43 13.77 12.29 13.79 12.04 13.68C11.8 13.58 11.07 13.34 10.16 12.54C9.44 11.91 8.94 11.13 8.8 10.92C8.65 10.71 8.78 10.58 8.91 10.45C9.02 10.33 9.16 10.15 9.3 10C9.44 9.85 9.49 9.73 9.58 9.54C9.67 9.35 9.62 9.18 9.55 9.07C9.49 8.96 9.11 8.05 8.94 7.62C8.77 7.18 8.6 7.23 8.44 7.23H8.43L8.24 7.23H9.11Z" /></svg>
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {expandedCommentsId === anno.id && (
                                        <div className="mt-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                {anno.comments.length > 0 ? anno.comments.slice().sort((a,b) => b.createdAt - a.createdAt).map(comment => (
                                                    <div key={comment.id} className="text-sm bg-white p-2 rounded-md border">
                                                        <p className="font-semibold text-gray-800">{comment.authorName}</p>
                                                        <p className="text-gray-600">{comment.content}</p>
                                                        <p className="text-xs text-gray-400 text-right">{new Date(comment.createdAt).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</p>
                                                    </div>
                                                )) : <p className="text-sm text-gray-500 text-center">No hay comentarios todavía.</p>}
                                            </div>
                                            <div className="mt-4 flex items-start space-x-2">
                                                <textarea
                                                    value={replyInputs[anno.id] || ''}
                                                    onChange={(e) => setReplyInputs(prev => ({...prev, [anno.id]: e.target.value}))}
                                                    rows={2}
                                                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Escribe una respuesta..."
                                                />
                                                <button onClick={() => handlePostReply(anno.id)} className="bg-indigo-500 text-white font-semibold text-sm py-2 px-3 rounded-lg shadow hover:bg-indigo-600">
                                                    Enviar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                                );
                            })
                        ) : (
                             <div className="text-center py-10 px-6 bg-gray-50 rounded-xl shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {(() => {
                                    if (specialView === 'hidden') {
                                        return <>
                                            <h3 className="mt-2 text-lg font-medium text-gray-500">No tienes anuncios ocultos.</h3>
                                            <p className="mt-1 text-sm text-gray-400">Cuando ocultes un anuncio, podrás verlo y recuperarlo desde aquí.</p>
                                        </>;
                                    }
                                    if (specialView === 'favorites') {
                                         return <>
                                            <h3 className="mt-2 text-lg font-medium text-gray-500">No tienes anuncios favoritos.</h3>
                                            <p className="mt-1 text-sm text-gray-400 inline-flex items-center">
                                                Usa el icono de la estrella
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-1 text-yellow-500" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                para seguir un anuncio y verlo aquí.
                                            </p>
                                        </>;
                                    }
                                    if (specialView === 'my_posts') {
                                        return <>
                                            <h3 className="mt-2 text-lg font-medium text-gray-500">No has publicado ningún anuncio.</h3>
                                            <p className="mt-1 text-sm text-gray-400">Utiliza el formulario de la derecha para crear tu primer anuncio.</p>
                                        </>;
                                    }
                                    return <>
                                        <h3 className="mt-2 text-lg font-medium text-gray-500">No hay anuncios que coincidan con tu filtro.</h3>
                                        <p className="mt-1 text-sm text-gray-400">Prueba a seleccionar otra categoría o publica un nuevo anuncio.</p>
                                    </>;
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky top-24 bg-white p-6 rounded-xl shadow-lg border">
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
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Escribe aquí los detalles de tu anuncio..."
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                id="category"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value as AnnouncementCategory)}
                                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="avisos_generales">Aviso General</option>
                                <option value="mercadillo">Mercadillo (Vendo/Compro/Alquilo)</option>
                                <option value="objetos_perdidos">Objeto Perdido/Encontrado</option>
                            </select>
                        </div>
                        <div>
                           <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Caducidad (máx. 1 mes)</label>
                           <input
                                type="date"
                                id="expiresAt"
                                value={newExpiresAt}
                                onChange={(e) => setNewExpiresAt(e.target.value)}
                                min={todayDate}
                                max={maxDate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">¿Añadir información de contacto?</label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input type="radio" name="contact" checked={includeContact} onChange={() => setIncludeContact(true)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                    <span className="ml-2 text-sm text-gray-700">Sí</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="contact" checked={!includeContact} onChange={() => setIncludeContact(false)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                    <span className="ml-2 text-sm text-gray-700">No</span>
                                </label>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-center text-sm bg-red-100 p-3 rounded-lg">{error}</p>}
                        
                        <button 
                            type="submit" 
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105"
                        >
                            Publicar Anuncio
                        </button>
                    </form>
                </div>
            </div>
        </div>
        {archivingAnnouncement && (
            <ArchiveAnnouncementModal 
                announcement={archivingAnnouncement}
                onClose={() => setArchivingAnnouncement(null)}
                onArchive={handleArchive}
            />
        )}
        </>
    );
};
// FIX: Added missing default export for the TablonAnunciosApp component.
export default TablonAnunciosApp;