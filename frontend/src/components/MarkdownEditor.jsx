import React from 'react';
import Editor from '@monaco-editor/react';
import { useAppContext } from '../context/AppContext';

export const MarkdownEditor = () => {
    const { currentDoc, updateDocumentContent, saveDocument, t, theme } = useAppContext();

    if (!currentDoc) return null;

    const handleEditorChange = (value) => {
        updateDocumentContent(currentDoc.id, value || '');
    };

    return (
        <div className="editor-container">
            <div className="editor-pane">
                <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('editor_title')}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => saveDocument(currentDoc.id, currentDoc.content)}>
                        <i className="fas fa-save"></i> {t('save')}
                    </button>
                </div>
                <div className="monaco-wrapper" style={{ height: 'calc(100% - 40px)', borderTop: '1px solid var(--border-color)' }}>
                    <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                        value={currentDoc.content}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
