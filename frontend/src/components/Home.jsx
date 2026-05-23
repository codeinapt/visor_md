import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Home = () => {
    const { folders, addFolder, deleteFolder, t, theme } = useAppContext();
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        const folder = await addFolder(newFolderName);
        if (folder) {
            setNewFolderName('');
            setIsCreating(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm(t('delete_project_confirm'))) {
            await deleteFolder(id);
        }
    };

    return (
        <div className={`home-container ${theme}-mode`}>
            <header className="home-header">
                <h1>{t('my_projects')}</h1>
                <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                    <i className="fas fa-plus"></i> {t('new_project')}
                </button>
            </header>

            {isCreating && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{t('create_new_project')}</h3>
                        <form onSubmit={handleCreateFolder}>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder={t('project_name_placeholder')}
                                className="input-text"
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={() => setIsCreating(false)}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {t('create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="project-grid">
                {folders.map(folder => (
                    <div key={folder.id} className="project-card" onClick={() => navigate(`/project/${folder.id}`)}>
                        <button
                            className="btn-delete-project"
                            onClick={(e) => handleDelete(e, folder.id)}
                            title={t('delete')}
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                        <div className="project-icon">
                            <i className="fas fa-folder-open"></i>
                        </div>
                        <div className="project-info">
                            <h3>{folder.name}</h3>
                            <p>{folder.created_at ? new Date(folder.created_at).toLocaleDateString() : ''}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
