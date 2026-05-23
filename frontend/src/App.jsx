import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { GlobalSearch } from './components/GlobalSearch';
import { IndexNavigation } from './components/IndexNavigation';
import { MarkdownEditor } from './components/MarkdownEditor';
import { Home } from './components/Home';
import { exportProjectToPDF } from './utils/PDFService';
import './App.css';

const Header = ({ showHomeLink, projectId }) => {
    const { theme, toggleTheme, t, setLanguage, language, mode, toggleMode, documents, folders } = useAppContext();
    const navigate = useNavigate();

    const handleExportPDF = () => {
        const project = folders.find(f => f.id === parseInt(projectId));
        const projectName = project ? project.name : "VisorMD Project";
        const projectDocs = documents.filter(d => d.folder_id === parseInt(projectId));
        exportProjectToPDF(projectDocs, projectName, t);
    };

    return (
        <header className="app-header">
            <div className="header-left">
                {showHomeLink ? (
                    <button className="btn btn-icon" onClick={() => navigate('/')}>
                        <i className="fas fa-home"></i>
                        <span>{t('back_to_home')}</span>
                    </button>
                ) : (
                    <div className="logo-container">VisorMD V2</div>
                )}
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

                {projectId && (
                    <button className="btn btn-primary" onClick={handleExportPDF}>
                        <i className="fas fa-file-pdf"></i>
                        <span>{t('generate_pdf')}</span>
                    </button>
                )}
            </div>
        </header>
    );
};

const FileTree = ({ projectId }) => {
    const { folders, documents, setCurrentDoc, t, currentDoc, addDocument, unsavedDocs } = useAppContext();
    const projectFolders = folders.filter(f => f.id === parseInt(projectId));

    const handleAddDocument = async (folderId) => {
        const title = prompt(t('document_title_prompt') || 'Nuevo Documento');
        if (title) {
            await addDocument(title, '# ' + title, folderId);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{t('files_title')}</h3>
                {projectFolders.length > 0 && (
                    <button className="btn btn-icon btn-sm" onClick={() => handleAddDocument(projectFolders[0].id)}>
                        <i className="fas fa-plus-circle"></i>
                    </button>
                )}
            </div>
            <div className="file-tree">
                {projectFolders.map(folder => (
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
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span><i className="fab fa-markdown"></i> {doc.title}</span>
                                    {unsavedDocs.includes(doc.id) && (
                                        <span className="unsaved-dot" title="Cambios sin guardar">●</span>
                                    )}
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
            // Configure marked with mermaid support
            const renderer = new marked.Renderer();
            renderer.code = (code, language) => {
                if (language === 'mermaid') {
                    return `<pre class="mermaid">${code}</pre>`;
                }
                return `<pre><code class="language-${language}">${code}</code></pre>`;
            };

            const cleanContent = (currentDoc.content || '').replace(/\\n/g, '\n');
            const parsedHtml = marked(cleanContent, { renderer });
            setHtml(parsedHtml);
        }
    }, [currentDoc]);

    useEffect(() => {
        if (html) {
            mermaid.initialize({
                startOnLoad: false,
                theme: theme === 'dark' ? 'dark' : 'default',
                securityLevel: 'loose'
            });
            mermaid.contentLoaded();
            // Force re-render of mermaid diagrams if they were missed
            const mermaidElements = document.querySelectorAll('.mermaid');
            if (mermaidElements.length > 0) {
                mermaid.run({
                    nodes: mermaidElements
                }).catch(err => console.error('Mermaid run error:', err));
            }
        }
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

const ProjectViewer = () => {
    const { id } = useParams();
    const { theme, documents, setCurrentDoc } = useAppContext();

    useEffect(() => {
        const projectDocs = documents.filter(d => d.folder_id === parseInt(id));
        if (projectDocs.length > 0) {
            setCurrentDoc(projectDocs[0]);
        } else {
            setCurrentDoc(null);
        }
    }, [id, documents]);

    return (
        <div className={`app-root ${theme}-mode`}>
            <Header showHomeLink={true} projectId={id} />
            <main className="app-container">
                <FileTree projectId={id} />
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
                    <Route path="/" element={<Home />} />
                    <Route path="/project/:id" element={<ProjectViewer />} />
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
