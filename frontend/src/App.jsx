import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { GlobalSearch } from './components/GlobalSearch';
import { IndexNavigation } from './components/IndexNavigation';
import { MarkdownEditor } from './components/MarkdownEditor';
import { exportProjectToPDF } from './utils/PDFService';
import './App.css';

const Header = () => {
    const { theme, toggleTheme, t, setLanguage, language, mode, toggleMode, documents } = useAppContext();

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo-container">VisorMD V2</div>
            </div>

            <div className="header-center">
                <GlobalSearch />
            </div>

            <div className="header-right">
                <div className="lang-switcher" style={{ marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-language" style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}></i>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="select-input"
                        style={{
                            border: '1px solid var(--accent)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <button className="btn btn-icon" onClick={toggleMode} style={{ marginRight: '0.5rem' }}>
                    <i className={`fas fa-${mode === 'read' ? 'book-open' : 'edit'}`}></i>
                    <span>{mode === 'read' ? t('mode_read') : t('mode_edit')}</span>
                </button>

                <button className="btn btn-icon" onClick={toggleTheme}>
                    <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`}></i>
                </button>

                <button className="btn btn-primary" onClick={() => exportProjectToPDF(documents, "VisorMD Project", t)}>
                    <i className="fas fa-file-pdf"></i>
                    <span>{t('generate_pdf')}</span>
                </button>
            </div>
        </header>
    );
};

const FileTree = () => {
    const { folders, documents, setCurrentDoc, t, currentDoc } = useAppContext();
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h3>{t('files_title')}</h3>
            </div>
            <div className="file-tree">
                {folders.map(folder => (
                    <div key={folder.id} className="folder">
                        <div className="folder-name">
                            <i className="fas fa-folder"></i> {folder.name}
                        </div>
                        <div className="folder-content">
                            {documents.filter(d => d.folder_id === folder.id).map(doc => (
                                <div
                                    key={doc.id}
                                    className={`file-item ${currentDoc?.id === doc.id ? 'active' : ''}`}
                                    onClick={() => setCurrentDoc(doc)}
                                >
                                    <i className="fab fa-markdown"></i> {doc.title}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

const DocViewer = () => {
    const { currentDoc, theme, mode } = useAppContext();
    const [html, setHtml] = useState('');

    useEffect(() => {
        if (currentDoc) {
            // Fix literal \n strings that might come from the DB/Mock
            const cleanContent = (currentDoc.content || '').replace(/\\n/g, '\n');
            setHtml(marked.parse(cleanContent));
        }
    }, [currentDoc]);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default' });
        mermaid.contentLoaded();
    }, [html, theme]);

    if (!currentDoc) return (
        <div className="welcome-screen">
            <i className="fas fa-file-code welcome-icon"></i>
            <h3>Selecciona un documento</h3>
        </div>
    );

    return (
        <div className="viewer-layout">
            <article className="content-area">
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
                {mode === 'edit' && <MarkdownEditor />}
            </article>
            <IndexNavigation html={html} />
        </div>
    );
};

const MainApp = () => {
    const { theme } = useAppContext();
    return (
        <div className={`app-root ${theme}-mode`}>
            <Header />
            <main className="app-container">
                <FileTree />
                <DocViewer />
            </main>
        </div>
    );
};

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainApp />} />
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
