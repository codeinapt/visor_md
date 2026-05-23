import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const IndexNavigation = ({ html }) => {
    const { t } = useAppContext();
    const [headers, setHeaders] = useState([]);

    useEffect(() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const foundHeaders = Array.from(tempDiv.querySelectorAll('h1, h2, h3')).map(h => ({
            id: h.id || h.textContent.toLowerCase().replace(/\s+/g, '-'),
            text: h.textContent,
            level: h.tagName.toLowerCase()
        }));
        setHeaders(foundHeaders);
    }, [html]);

    if (headers.length === 0) return null;

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav className="document-index">
            <h4>{t('index_title')}</h4>
            <ul>
                {headers.map((h, i) => (
                    <li key={i} className={`index-item level-${h.level}`}>
                        <a href={`#${h.id}`} onClick={(e) => { e.preventDefault(); scrollTo(h.id); }}>
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
