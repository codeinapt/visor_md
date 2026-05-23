export class PDFGenerator {
    constructor(fileLoader, renderer) {
        this.fileLoader = fileLoader;
        this.renderer = renderer;
        this.pdfButton = document.getElementById('generatePDF');
        this.pdfModal = document.getElementById('pdfModal');
        this.exportCurrentBtn = document.getElementById('exportCurrent');
        this.exportAllBtn = document.getElementById('exportAll');

        this.init();
    }

    init() {
        this.pdfButton.addEventListener('click', () => {
            this.pdfModal.classList.remove('hidden');
        });

        this.exportCurrentBtn.addEventListener('click', () => {
            this.exportCurrent();
            this.pdfModal.classList.add('hidden');
        });

        this.exportAllBtn.addEventListener('click', () => {
            this.exportAll();
            this.pdfModal.classList.add('hidden');
        });

        // Close modal when clicking outside
        this.pdfModal.addEventListener('click', (e) => {
            if (e.target === this.pdfModal) this.pdfModal.classList.add('hidden');
        });
    }

    async exportCurrent() {
        const viewer = document.getElementById('viewerContent');
        const fileName = document.querySelector('.tree-item.active')?.textContent || 'document';

        const options = {
            margin: 1,
            filename: `${fileName}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(viewer).set(options).save();
    }

    async exportAll() {
        const files = this.fileLoader.files;
        if (files.length === 0) return;

        const tempContainer = document.createElement('div');
        tempContainer.className = 'markdown-body pdf-export';
        tempContainer.style.padding = '1cm';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.color = 'black';

        // RF14: Portada automática del PDF
        const cover = document.createElement('div');
        cover.className = 'pdf-cover';
        cover.style.height = '26cm';
        cover.style.display = 'flex';
        cover.style.flexDirection = 'column';
        cover.style.alignItems = 'center';
        cover.style.justifyContent = 'center';
        cover.style.padding = '2cm';

        const logo = document.getElementById('projectLogo').cloneNode(true);
        logo.style.width = '200px';
        logo.style.height = 'auto';
        logo.style.marginBottom = '2cm';
        cover.appendChild(logo);

        const title = document.createElement('h1');
        title.textContent = document.getElementById('projectNameText').textContent;
        title.style.fontSize = '42pt';
        title.style.marginBottom = '1cm';
        cover.appendChild(title);

        const version = document.createElement('p');
        version.textContent = 'Versión 2.0.0';
        version.style.fontSize = '18pt';
        cover.appendChild(version);

        // RF16: Metadatos
        const lastMod = new Date(Math.max(...files.map(f => f.lastModified)));
        const meta = document.createElement('div');
        meta.className = 'pdf-metadata';
        meta.innerHTML = `
            <p><strong>Responsable:</strong> Equipo de Desarrollo VisorMD</p>
            <p><strong>Fecha Generación:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Última Modificación:</strong> ${lastMod.toLocaleDateString()}</p>
            <p><strong>Total de Archivos:</strong> ${files.length}</p>
        `;
        cover.appendChild(meta);
        tempContainer.appendChild(cover);
        tempContainer.appendChild(this.createPageBreak());

        // RF15: Índice automático en PDF (TOC)
        const toc = document.createElement('div');
        toc.className = 'pdf-toc';
        toc.innerHTML = '<h1 style="text-align: center; margin-bottom: 2cm;">Índice de Contenidos</h1>';

        files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'pdf-toc-item';
            item.innerHTML = `
                <span>${index + 1}. ${file.path.replace('.md', '')}</span>
                <span class="toc-spacer" style="flex: 1; border-bottom: 1px dotted #ccc; margin: 0 10px;"></span>
                <span>Sección ${index + 1}</span>
            `;
            toc.appendChild(item);
        });
        tempContainer.appendChild(toc);
        tempContainer.appendChild(this.createPageBreak());

        // RF13: Exportar documentación completa
        for (const file of files) {
            const section = document.createElement('div');
            section.className = 'pdf-section';
            section.style.minHeight = '28cm';

            // Render content including Mermaid
            const titleHeader = document.createElement('h1');
            titleHeader.textContent = file.path;
            titleHeader.style.borderBottom = '2px solid #DC5A04';
            section.appendChild(titleHeader);

            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = marked.parse(file.content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "<!-- script blocked -->"));
            section.appendChild(contentDiv);

            tempContainer.appendChild(section);
            tempContainer.appendChild(this.createPageBreak());
        }

        const options = {
            margin: [1, 1, 1, 1],
            filename: `VisorMD_Documentacion_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css', after: '.page-break' }
        };

        html2pdf().from(tempContainer).set(options).toPdf().get('pdf').then(function (pdf) {
            // Add page numbers
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(150);
                pdf.text('Página ' + i + ' de ' + totalPages, pdf.internal.pageSize.getWidth() - 3, pdf.internal.pageSize.getHeight() - 1);
            }
        }).save();
    }

    createPageBreak() {
        const div = document.createElement('div');
        div.className = 'page-break';
        div.style.pageBreakAfter = 'always';
        return div;
    }
}
