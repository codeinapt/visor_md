import html2pdf from 'html2pdf.js';
import { marked } from 'marked';

export const exportProjectToPDF = async (files, projectName, t) => {
    const tempContainer = document.createElement('div');
    tempContainer.className = 'markdown-body pdf-export';
    tempContainer.style.padding = '1cm';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.color = 'black';

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
        <p><strong>${t('responsable')}:</strong> Equipo de Desarrollo VisorMD</p>
        <p><strong>${t('fecha_generacion')}:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>${t('total_archivos')}:</strong> ${files.length}</p>
    `;
    cover.appendChild(meta);
    tempContainer.appendChild(cover);
    tempContainer.appendChild(createPageBreak());

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
    tempContainer.appendChild(toc);
    tempContainer.appendChild(createPageBreak());

    // Content
    for (const file of files) {
        const section = document.createElement('div');
        section.className = 'pdf-section';
        section.style.minHeight = '28cm';

        const titleHeader = document.createElement('h1');
        titleHeader.textContent = file.title || file.path;
        titleHeader.style.borderBottom = '2px solid #DC5A04';
        section.appendChild(titleHeader);

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = marked.parse(file.content || '');
        section.appendChild(contentDiv);

        tempContainer.appendChild(section);
        tempContainer.appendChild(createPageBreak());
    }

    const options = {
        margin: [1, 1, 1, 1],
        filename: `${projectName}_Docs_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css', after: '.page-break' }
    };

    html2pdf().from(tempContainer).set(options).save();
};

const createPageBreak = () => {
    const div = document.createElement('div');
    div.className = 'page-break';
    div.style.pageBreakAfter = 'always';
    return div;
};
