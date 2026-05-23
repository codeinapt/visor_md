export class FileTree {
    constructor() {
        this.container = document.getElementById('fileTreeContainer');
        this.onFileSelect = null;
    }

    render(files) {
        this.container.innerHTML = '';
        if (files.length === 0) {
            this.container.innerHTML = '<div class="empty-state">No hay archivos Markdown</div>';
            return;
        }

        const tree = this.buildTreeStructure(files);
        this.renderTree(tree, this.container);
    }

    buildTreeStructure(files) {
        const root = {};
        files.forEach(file => {
            const parts = file.path.split('/');
            let current = root;
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = index === parts.length - 1 ? file : {};
                }
                current = current[part];
            });
        });
        return root;
    }

    renderTree(tree, container, depth = 0) {
        const sortedKeys = Object.keys(tree).sort((a, b) => {
            const isAFolder = typeof tree[a] === 'object' && !tree[a].path;
            const isBFolder = typeof tree[b] === 'object' && !tree[b].path;
            if (isAFolder && !isBFolder) return -1;
            if (!isAFolder && isBFolder) return 1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach(key => {
            const node = tree[key];
            const isFolder = typeof node === 'object' && !node.path;

            const item = document.createElement('div');
            item.className = 'tree-item-wrapper';

            const content = document.createElement('div');
            content.className = 'tree-item';
            content.style.paddingLeft = `${depth * 1}rem`;

            const icon = document.createElement('i');
            icon.className = isFolder ? 'fas fa-folder' : 'far fa-file-alt';
            content.appendChild(icon);

            const text = document.createElement('span');
            text.textContent = key;
            content.appendChild(text);

            item.appendChild(content);

            if (isFolder) {
                const subContainer = document.createElement('div');
                subContainer.className = 'tree-content';
                item.classList.add('tree-folder');

                content.addEventListener('click', () => {
                    item.classList.toggle('open');
                    icon.className = item.classList.contains('open') ? 'fas fa-folder-open' : 'fas fa-folder';
                });

                this.renderTree(node, subContainer, depth + 1);
                item.appendChild(subContainer);
            } else {
                content.addEventListener('click', () => {
                    // Deselect others
                    document.querySelectorAll('.tree-item.active').forEach(el => el.classList.remove('active'));
                    content.classList.add('active');
                    if (this.onFileSelect) this.onFileSelect(node);
                });
            }

            container.appendChild(item);
        });
    }
}
