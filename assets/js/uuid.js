document.addEventListener('DOMContentLoaded', () => {
    const uuidResult = document.getElementById('uuidResult');
    const uuidOutput = document.getElementById('uuidOutput');
    const uuidFormats = document.querySelector('.uuid-formats');
    const regenerateBtn = document.getElementById('regenerateUUID');
    const uuidVersion = document.getElementById('uuidVersion');
    const uuidNameField = document.querySelector('.uuid-name-field');
    const uuidNameInput = document.getElementById('uuidName');
    
    // Get URL parameters for prefilling options
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            version: params.get('version') || '4',
            name: params.get('name') || 'default'
        };
    }
    
    // Initialize form with URL params
    function initForm() {
        const params = getUrlParams();
        
        uuidVersion.value = params.version;
        uuidNameInput.value = params.name;
        
        // Show/hide name field based on version
        if (['3', '5'].includes(params.version)) {
            uuidNameField.classList.add('show', 'd-block');
            uuidNameField.classList.remove('d-none');
        }
    }
    
    // Generate UUID v4 (RFC 4122)
    function generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Generate UUID v1 (time-based)
    function generateUUIDv1() {
        const now = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (now + Math.random() * 16) % 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid;
    }
    
    // Generate UUID v3/v5 (namespace-based)
    function generateUUIDv3v5(version, namespace, name) {
        // Simplified implementation for demo purposes
        // In production, use a proper hashing library like crypto.subtle.digest
        const namespaceBytes = new TextEncoder().encode(namespace);
        const nameBytes = new TextEncoder().encode(name);
        
        // Create a simple hash (not cryptographically secure for real v3/v5)
        let hash = 0;
        const combined = new Uint8Array(namespaceBytes.length + nameBytes.length);
        combined.set(namespaceBytes);
        combined.set(nameBytes, namespaceBytes.length);
        
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined[i];
            hash = hash & hash;
        }
        
        // Format as UUID
        const hashStr = Math.abs(hash).toString(16).padStart(32, '0');
        return `${hashStr.substring(0,8)}-${hashStr.substring(8,12)}-${version}${hashStr.substring(13,16)}-${hashStr.substring(16,20)}-${hashStr.substring(20,32)}`;
    }
    
    // Generate UUID based on selected version
    function generateUUID() {
        const version = parseInt(uuidVersion.value);
        const name = uuidNameInput.value || 'default';
        
        // Show loading state
        uuidOutput.textContent = 'Generating...';
        uuidFormats.textContent = 'Calculating formats...';
        
        let uuid;
        try {
            if (version === 1) {
                uuid = generateUUIDv1();
            } else if (version === 3 || version === 5) {
                // In production, use proper namespace constants
                const namespace = version === 3 ? '6ba7b810-9dad-11d1-80b4-00c04fd430c8' : '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
                uuid = generateUUIDv3v5(version, namespace, name);
            } else {
                uuid = generateUUIDv4();
            }
            
            // Update UI
            uuidOutput.textContent = uuid;
            uuidFormats.innerHTML = `
                <span title="Hyphenated" class="me-2">${uuid}</span> |
                <span title="No hyphens" class="me-2">${uuid.replace(/-/g, '')}</span> |
                <span title="Uppercase">${uuid.toUpperCase()}</span>
            `;
            
            // Visual feedback
            uuidResult.classList.add('result-updated');
            setTimeout(() => uuidResult.classList.remove('result-updated'), 300);
        } catch (error) {
            uuidOutput.textContent = `ERROR: ${error.message || 'Generation failed'}`;
            uuidFormats.textContent = '';
            console.error('UUID generation error:', error);
        }
    }
    
    // Toggle name field for v3/v5
    function updateUuidNameField() {
        if (['3', '5'].includes(uuidVersion.value)) {
            uuidNameField.classList.add('show', 'd-block');
            uuidNameField.classList.remove('d-none');
        } else {
            uuidNameField.classList.remove('show', 'd-block');
            uuidNameField.classList.add('d-none');
        }
    }
    
    // Initialize
    initForm();
    updateUuidNameField();
    setTimeout(generateUUID, 300);
    
    // Event handlers
    uuidVersion.addEventListener('change', () => {
        updateUuidNameField();
        generateUUID();
    });
    
    regenerateBtn.addEventListener('click', generateUUID);
});