import React, { createContext, useState, useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import es from '../i18n/es.json';
import en from '../i18n/en.json';

const AppContext = createContext();

const searchReducer = (state, action) => {
    switch (action.type) {
        case 'SET_INDEX': return action.payload;
        default: return state;
    }
};

export const AppProvider = ({ children }) => {
    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('es');
    const [mode, setMode] = useState('read'); // 'read' or 'edit'
    const [searchIndex, dispatchSearch] = useReducer(searchReducer, []);

    const translations = { es, en };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const fetchInitialData = async () => {
        try {
            const [foldersRes, docsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/folders`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/documents`)
            ]);
            setFolders(foldersRes.data);
            setDocuments(docsRes.data);
            if (docsRes.data.length > 0) setCurrentDoc(docsRes.data[0]);

            // RF08: Indexing files for search
            const index = docsRes.data.map(doc => ({
                id: doc.id,
                path: doc.title,
                content: doc.content
            }));
            dispatchSearch({ type: 'SET_INDEX', payload: index });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const toggleMode = () => setMode(prev => prev === 'read' ? 'edit' : 'read');

    const [unsavedDocs, setUnsavedDocs] = useState([]);

    const updateDocumentContentLocal = (id, newContent) => {
        setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, content: newContent } : doc));
        if (currentDoc?.id === id) setCurrentDoc(prev => ({ ...prev, content: newContent }));

        // Add to unsaved if not already there
        if (!unsavedDocs.includes(id)) {
            setUnsavedDocs(prev => [...prev, id]);
        }
    };

    const saveDocument = async (id, content) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await axios.put(`${apiUrl}/api/documents/${id}`, { content });

            // Remove from unsaved on success
            setUnsavedDocs(prev => prev.filter(docId => docId !== id));
            console.log('Document saved successfully');
        } catch (error) {
            console.error('Error saving document:', error);
            alert('Error al guardar el documento. Por favor, verifica la conexión con el servidor.');
        }
    };

    const addFolder = async (name) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/folders`, { name });
            setFolders(prev => [...prev, res.data]);
            return res.data;
        } catch (error) {
            console.error('Error adding folder:', error);
        }
    };

    const addDocument = async (title, content, folderId) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/documents`, {
                title, content, folder_id: folderId
            });
            setDocuments(prev => [...prev, res.data]);
            return res.data;
        } catch (error) {
            console.error('Error adding document:', error);
        }
    };

    const deleteFolder = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/folders/${id}`);
            setFolders(prev => prev.filter(f => f.id !== id));
            setDocuments(prev => prev.filter(d => d.folder_id !== id));
            if (currentDoc?.folder_id === id) setCurrentDoc(null);
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };

    return (
        <AppContext.Provider value={{
            folders, documents, currentDoc, setCurrentDoc,
            theme, toggleTheme, language, setLanguage, t,
            mode, toggleMode, searchIndex, updateDocumentContent: updateDocumentContentLocal,
            saveDocument, addFolder, addDocument, fetchInitialData, deleteFolder, unsavedDocs
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
