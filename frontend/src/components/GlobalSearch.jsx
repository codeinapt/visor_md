import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const GlobalSearch = () => {
    const { searchIndex, t, setCurrentDoc, documents } = useAppContext();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const getSnippet = (content, matchIndex, query) => {
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(content.length, matchIndex + query.length + 60);
        let snippet = content.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return snippet.replace(regex, '<span class="match">$1</span>');
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (!val.trim()) {
            setResults([]);
            return;
        }

        const res = [];
        const regex = new RegExp(escapeRegExp(val), 'gi');

        searchIndex.forEach(file => {
            const matches = [...file.content.matchAll(regex)];
            if (matches.length > 0 || file.path.match(regex)) {
                matches.slice(0, 3).forEach(match => {
                    const lineNumber = file.content.substring(0, match.index).split('\n').length;
                    const snippet = getSnippet(file.content, match.index, val);
                    res.push({
                        id: file.id,
                        path: file.path,
                        snippet: snippet,
                        line: lineNumber
                    });
                });
                if (matches.length === 0 && file.path.match(regex)) {
                    res.push({ id: file.id, path: file.path, snippet: t('match_in_filename'), line: '-' });
                }
            }
        });
        setResults(res);
        setIsOpen(true);
    };

    const selectResult = (id) => {
        const doc = documents.find(d => d.id === id);
        if (doc) setCurrentDoc(doc);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder={t('search_placeholder')}
                onFocus={() => query && setIsOpen(true)}
            />

            {isOpen && results.length > 0 && (
                <div className="search-results-dropdown">
                    {results.map((res, i) => (
                        <div key={i} className="search-result-item" onClick={() => selectResult(res.id)}>
                            <div className="search-result-header">
                                <span className="search-result-file">{res.path}</span>
                                <span className="search-result-line">{t('line')} {res.line}</span>
                            </div>
                            <div className="search-result-snippet" dangerouslySetInnerHTML={{ __html: res.snippet }} />
                        </div>
                    ))}
                </div>
            )}

            {isOpen && query && results.length === 0 && (
                <div className="search-results-dropdown">
                    <div className="no-results">{t('no_results')}</div>
                </div>
            )}
        </div>
    );
};
