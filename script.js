
(function () {
    // --- JSON Viewer Logic ---

    function renderJsonTree(data) {
        const container = document.createElement('div');
        container.className = 'json-container';

        if (typeof data === 'object' && data !== null) {
            container.appendChild(createNode(null, data));
        } else {
            const wrapper = document.createElement('div');
            wrapper.className = 'json-node';
            wrapper.appendChild(createValueElement(data));
            container.appendChild(wrapper);
        }

        return container;
    }

    function createNode(key, value) {
        const node = document.createElement('div');
        node.className = 'json-node';

        const isObject = typeof value === 'object' && value !== null;
        const isArray = Array.isArray(value);

        // Collapsible Toggle
        if (isObject) {
            node.classList.add('collapsible'); // Default expanded

            // Toggle click handler
            const header = document.createElement('div');
            header.className = 'node-header';

            header.addEventListener('click', (e) => {
                e.stopPropagation();
                node.classList.toggle('collapsed');
            });

            // Key
            if (key !== null) {
                const keySpan = document.createElement('span');
                keySpan.className = 'json-key';
                keySpan.textContent = `"${key}":`;
                header.appendChild(keySpan);
            }

            // Preview (size)
            const openChar = isArray ? '[' : '{';
            const closeChar = isArray ? ']' : '}';
            const size = isArray ? value.length : Object.keys(value).length;

            const preview = document.createElement('span');
            preview.className = 'json-preview';
            preview.textContent = ` ${openChar} ${size} items ${closeChar}`;
            header.appendChild(preview);

            node.appendChild(header);

            // Children
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children';

            for (const [k, v] of Object.entries(value)) {
                childrenContainer.appendChild(createNode(k, v));
            }

            node.appendChild(childrenContainer);
        } else {
            // Primitive Key-Value or Loop Item
            const row = document.createElement('div');
            row.className = 'node-row';

            if (key !== null) {
                const keySpan = document.createElement('span');
                keySpan.className = 'json-key';
                keySpan.textContent = `"${key}":`;
                row.appendChild(keySpan);
            }

            row.appendChild(createValueElement(value));
            node.appendChild(row);
        }

        return node;
    }

    function createValueElement(value) {
        const span = document.createElement('span');
        span.className = `json-value ${getValueType(value)}`;

        if (typeof value === 'string') {
            span.textContent = `"${value}"`;
        } else {
            span.textContent = String(value);
        }

        return span;
    }

    function getValueType(value) {
        if (value === null) return 'null';
        return typeof value;
    }

    function expandAll(container) {
        const nodes = container.querySelectorAll('.collapsible');
        nodes.forEach(node => node.classList.remove('collapsed'));
    }

    function collapseAll(container) {
        const nodes = container.querySelectorAll('.collapsible');
        nodes.forEach(node => node.classList.add('collapsed'));
    }


    // --- Main Application Logic ---

    // DOM Elements
    const jsonInput = document.getElementById('json-input');
    const jsonTree = document.getElementById('json-tree');
    const errorView = document.getElementById('error-view');
    const errorMessage = document.getElementById('error-message');
    const emptyView = document.getElementById('empty-view');
    const inputStatus = document.getElementById('input-status');

    // Toolbar Buttons
    const formatBtn = document.getElementById('format-btn');
    const clearBtn = document.getElementById('clear-btn');
    const expandAllBtn = document.getElementById('expand-all-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    const pasteBtn = document.getElementById('paste-btn');

    // State
    let currentJson = null;

    // Event Listeners
    jsonInput.addEventListener('input', handleInputChange);
    formatBtn.addEventListener('click', formatJson);
    clearBtn.addEventListener('click', clearInput);

    if (pasteBtn) {
        pasteBtn.addEventListener('click', pasteFromClipboard);
    }

    expandAllBtn.addEventListener('click', () => {
        if (jsonTree.firstChild) expandAll(jsonTree);
    });

    collapseAllBtn.addEventListener('click', () => {
        if (jsonTree.firstChild) collapseAll(jsonTree);
    });

    function handleInputChange(e) {
        const inputValue = e.target.value.trim();

        if (!inputValue) {
            showEmptyState();
            inputStatus.textContent = 'Ready';
            inputStatus.style.color = 'var(--text-secondary)';
            return;
        }

        try {
            const parsed = JSON.parse(inputValue);
            currentJson = parsed;
            showTree(parsed);
            inputStatus.textContent = 'Valid JSON';
            inputStatus.style.color = 'var(--success-color)';
        } catch (err) {
            showError(err.message);
            inputStatus.textContent = 'Invalid JSON';
            inputStatus.style.color = 'var(--error-color)';
        }
    }

    function showEmptyState() {
        jsonTree.innerHTML = '';
        emptyView.style.display = 'flex';
        errorView.classList.add('hidden');
        jsonTree.classList.remove('hidden');
    }

    function showTree(data) {
        emptyView.style.display = 'none';
        errorView.classList.add('hidden');
        jsonTree.innerHTML = '';
        jsonTree.appendChild(renderJsonTree(data));
    }

    function showError(msg) {
        emptyView.style.display = 'none';
        jsonTree.innerHTML = '';
        errorView.classList.remove('hidden');
        errorMessage.textContent = msg;
    }

    function formatJson() {
        if (!currentJson) return;
        const formatted = JSON.stringify(currentJson, null, 4);
        jsonInput.value = formatted;
    }

    function clearInput() {
        jsonInput.value = '';
        showEmptyState();
        inputStatus.textContent = 'Ready';
        inputStatus.style.color = 'var(--text-secondary)';
        currentJson = null;
    }

    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            jsonInput.value = text;
            // Trigger input event manually
            jsonInput.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            // Fallback for browsers that might block standard clipboard API
            const textArea = document.createElement("textarea");
            document.body.appendChild(textArea);
            textArea.focus();
            const successful = document.execCommand('paste'); // deprecated but fallback
            if (successful) {
                jsonInput.value = textArea.value;
                jsonInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            document.body.removeChild(textArea);
        }
    }

})();
