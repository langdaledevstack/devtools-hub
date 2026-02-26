// Copy to clipboard functionality
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.getAttribute('data-target');
            const textElement = document.getElementById(targetId);
            const text = textElement.textContent;
            
            if (text && !text.includes('ERROR') && text !== 'Generating...') {
                try {
                    await navigator.clipboard.writeText(text);
                    const originalText = button.innerHTML;
                    button.innerHTML = '✓ Copied!';
                    button.classList.add('btn-success');
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('btn-success');
                    }, 1500);
                } catch (err) {
                    alert('Copy failed. Select text manually.');
                    console.error('Copy failed:', err);
                }
            }
        });
    });
    
    // Syntax highlighting for JSON
    window.syntaxHighlight = function(json) {
        if (typeof json !== 'string') return json;
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
            let cls = 'text-info'; // strings
            
            if (/^\d/.test(match)) cls = 'text-warning'; // numbers
            else if (/true|false/.test(match)) cls = 'text-success'; // booleans
            else if (/null/.test(match)) cls = 'text-danger'; // null
            else if (/:\s*$/.test(match)) cls = 'text-primary'; // keys
            
            return `<span class="${cls}">${match}</span>`;
        });
    };
    
    // Error display helper
    window.showError = function(element, message) {
        element.textContent = message;
        element.classList.remove('d-none');
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    
    // Success notification
    window.showSuccess = function(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        document.body.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
        bsToast.show();
        
        setTimeout(() => {
            toast.remove();
        }, 3500);
    };
    
    // Initialize Bootstrap collapse if available
    if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(el => {
            new bootstrap.Collapse(el, {
                toggle: false
            });
        });
    }
});