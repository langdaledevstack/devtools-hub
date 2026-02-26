document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const formatJsonBtn = document.getElementById('formatJsonBtn');
    const minifyJsonBtn = document.getElementById('minifyJsonBtn');
    const jsonOutput = document.getElementById('jsonOutput');
    const jsonResult = document.getElementById('jsonResult');
    const jsonError = document.getElementById('jsonError');

    // Format JSON handler
    formatJsonBtn.addEventListener('click', () => {
        const raw = jsonInput.value.trim();
        jsonError.classList.add('d-none');
        jsonResult.classList.add('d-none');
        
        if (!raw) {
            showError(jsonError, '⚠️ Input cannot be empty');
            return;
        }
        
        try {
            // Parse to validate
            const obj = JSON.parse(raw);
            // Format with syntax highlighting
            const formatted = JSON.stringify(obj, null, 2);
            jsonOutput.innerHTML = syntaxHighlight(formatted);
            jsonResult.classList.remove('d-none');
            jsonResult.classList.add('result-updated');
            setTimeout(() => jsonResult.classList.remove('result-updated'), 300);
        } catch (e) {
            showError(jsonError, `❌ Invalid JSON: ${e.message}`);
            jsonOutput.textContent = '';
        }
    });

    // Minify JSON handler
    minifyJsonBtn.addEventListener('click', () => {
        const raw = jsonInput.value.trim();
        jsonError.classList.add('d-none');
        
        if (!raw) {
            showError(jsonError, '⚠️ Input cannot be empty');
            return;
        }
        
        try {
            const obj = JSON.parse(raw);
            jsonInput.value = JSON.stringify(obj);
            showSuccess('JSON minified successfully!');
        } catch (e) {
            showError(jsonError, `❌ Invalid JSON: ${e.message}`);
        }
    });

    // Initialize with sample data
    window.addEventListener('load', () => {
        setTimeout(() => {
            try {
                const obj = JSON.parse(jsonInput.value);
                jsonOutput.innerHTML = syntaxHighlight(JSON.stringify(obj, null, 2));
                jsonResult.classList.remove('d-none');
            } catch (e) {
                console.warn('Sample JSON parse failed (expected during init)');
            }
        }, 400);
    });
});