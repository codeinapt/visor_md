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

    const updateDocumentContent = async (id, newContent) => {
        try {
            // Update local state first for responsiveness
            setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, content: newContent } : doc));
            if (currentDoc?.id === id) setCurrentDoc({ ...currentDoc, content: newContent });

            // In a real app, send to API. Assuming endpoint exists or will be fixed
            // axios.put(`${import.meta.env.VITE_API_URL}/api/documents/${id}`, { content: newContent });
        } catch (error) {
            console.error('Error updating document:', error);
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

    return (
        <AppContext.Provider value={{
            folders, documents, currentDoc, setCurrentDoc,
            theme, toggleTheme, language, setLanguage, t,
            mode, toggleMode, searchIndex, updateDocumentContent,
            addFolder, addDocument, fetchInitialData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
