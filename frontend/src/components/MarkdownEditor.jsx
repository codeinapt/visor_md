import React from 'react';
import { useAppContext } from '../context/AppContext';

export const MarkdownEditor = () => {
    const { currentDoc, updateDocumentContent, t } = useAppContext();

    if (!currentDoc) return null;

    const handleChange = (e) => {
        updateDocumentContent(currentDoc.id, e.target.value);
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
                <textarea
                    className="md-textarea"
                    value={currentDoc.content}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};
