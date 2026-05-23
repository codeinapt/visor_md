import html2pdf from 'html2pdf.js';
import { marked } from 'marked';
import mermaid from 'mermaid';

export const exportProjectToPDF = async (files, projectName, t) => {
    // Hidden container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '21cm'; // A4 width
    document.body.appendChild(tempContainer);

    const renderBox = document.createElement('div');
    renderBox.className = 'markdown-body pdf-export';
    renderBox.style.padding = '1cm';
    renderBox.style.backgroundColor = 'white';
    renderBox.style.color = 'black';
    tempContainer.appendChild(renderBox);

    // Cover Page
    const cover = document.createElement('div');
    cover.className = 'pdf-cover';
    cover.style.height = '26cm';
    cover.style.display = 'flex';
    cover.style.flexDirection = 'column';
    cover.style.alignItems = 'center';
    cover.style.justifyContent = 'center';
    cover.style.padding = '2cm';

    const title = document.createElement('h1');
    title.textContent = projectName;
    title.style.fontSize = '42pt';
    title.style.marginBottom = '1cm';
    cover.appendChild(title);

    const version = document.createElement('p');
    version.textContent = 'Versión 2.0.0 (Full Stack)';
    version.style.fontSize = '18pt';
    cover.appendChild(version);

    const meta = document.createElement('div');
    meta.className = 'pdf-metadata';
    meta.innerHTML = `
        <p><strong>Responsable:</strong> Equipo de Desarrollo VisorMD</p>
        <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total de Archivos:</strong> ${files.length}</p>
    `;
    cover.appendChild(meta);
    renderBox.appendChild(cover);
    renderBox.appendChild(createPageBreak());

    // TOC
    const toc = document.createElement('div');
    toc.className = 'pdf-toc';
    toc.innerHTML = `<h1 style="text-align: center; margin-bottom: 2cm;">${t('index_title')}</h1>`;

    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'pdf-toc-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.marginBottom = '0.5cm';
        item.innerHTML = `
            <span>${index + 1}. ${file.title || file.path}</span>
            <span style="flex: 1; border-bottom: 1px dotted #ccc; margin: 0 10px;"></span>
            <span>${index + 1}</span>
        `;
        toc.appendChild(item);
    });
    renderBox.appendChild(toc);
    renderBox.appendChild(createPageBreak());

    // Content
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
        if (language === 'mermaid') {
            return `<pre class="mermaid">${code}</pre>`;
        }
        return `<pre><code class="language-${language}">${code}</code></pre>`;
    };

    for (const file of files) {
        const section = document.createElement('div');
        section.className = 'pdf-section';
        section.style.minHeight = '28cm';

        const titleHeader = document.createElement('h1');
        titleHeader.textContent = file.title || file.path;
        titleHeader.style.borderBottom = '2px solid #DC5A04';
        section.appendChild(titleHeader);

        const contentDiv = document.createElement('div');
        const cleanContent = (file.content || '').replace(/\\n/g, '\n');
        contentDiv.innerHTML = marked(cleanContent, { renderer });
        section.appendChild(contentDiv);

        renderBox.appendChild(section);
        renderBox.appendChild(createPageBreak());
    }

    // Process Mermaid in the shadow DOM
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
    await mermaid.run({
        nodes: renderBox.querySelectorAll('.mermaid')
    });

    const options = {
        margin: [1, 1, 1, 1],
        filename: `${projectName}_Docs_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css', after: '.page-break' }
    };

    try {
        await html2pdf().from(renderBox).set(options).save();
    } finally {
        document.body.removeChild(tempContainer);
    }
};

const createPageBreak = () => {
    const div = document.createElement('div');
    div.className = 'page-break';
    div.style.pageBreakAfter = 'always';
    return div;
};
