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
                <div className="pane-header">
                    <span>{t('editor_title')}</span>
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
