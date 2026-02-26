document.addEventListener('DOMContentLoaded', () => {
    const jwtInput = document.getElementById('jwtInput');
    const decodeJwtBtn = document.getElementById('decodeJwtBtn');
    const jwtHeader = document.getElementById('jwtHeader');
    const jwtPayload = document.getElementById('jwtPayload');
    const jwtHeaderSection = document.getElementById('jwtHeaderSection');
    const jwtPayloadSection = document.getElementById('jwtPayloadSection');
    const jwtError = document.getElementById('jwtError');
    const expStatus = document.getElementById('expStatus');
    const nbfStatus = document.getElementById('nbfStatus');
    const iatStatus = document.getElementById('iatStatus');

    // Base64Url decode helper (handles UTF-8 properly)
    function decodeBase64Url(base64Url) {
        try {
            // Replace URL-safe chars and add padding
            const base64 = base64Url
                .replace(/-/g, '+')
                .replace(/_/g, '/')
                .padEnd(base64Url.length + (4 - base64Url.length % 4) % 4, '=');
            
            // Decode base64
            const decoded = atob(base64);
            
            // Convert to UTF-8 string
            try {
                return decodeURIComponent(escape(decoded));
            } catch (e) {
                // Fallback for non-UTF8 content
                return decoded;
            }
        } catch (e) {
            throw new Error('Invalid base64 encoding');
        }
    }

    // Decode JWT handler
    decodeJwtBtn.addEventListener('click', () => {
        const token = jwtInput.value.trim();
        jwtError.classList.add('d-none');
        jwtHeaderSection.classList.add('d-none');
        jwtPayloadSection.classList.add('d-none');
        
        if (!token) {
            showError(jwtError, '⚠️ Please enter a JWT token');
            return;
        }
        
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token must have exactly 3 parts (header.payload.signature)');
            }
            
            // Decode header and payload
            const headerStr = decodeBase64Url(parts[0]);
            const payloadStr = decodeBase64Url(parts[1]);
            
            // Parse and display
            const header = JSON.parse(headerStr);
            const payload = JSON.parse(payloadStr);
            
            jwtHeader.innerHTML = syntaxHighlight(JSON.stringify(header, null, 2));
            jwtPayload.innerHTML = syntaxHighlight(JSON.stringify(payload, null, 2));
            
            // Show sections
            jwtHeaderSection.classList.remove('d-none');
            jwtPayloadSection.classList.remove('d-none');
            jwtHeaderSection.classList.add('result-updated');
            jwtPayloadSection.classList.add('result-updated');
            setTimeout(() => {
                jwtHeaderSection.classList.remove('result-updated');
                jwtPayloadSection.classList.remove('result-updated');
            }, 300);
            
            // Validate timestamps
            validateJwtClaims(payload);
            
        } catch (e) {
            showError(jwtError, `❌ ${e.message || 'Invalid JWT token'}`);
            console.error('JWT decode error:', e);
        }
    });

    // Validate JWT claims and display status
    function validateJwtClaims(payload) {
        const now = Math.floor(Date.now() / 1000);
        const statuses = {
            exp: { el: expStatus, prefix: 'Expires', critical: true },
            nbf: { el: nbfStatus, prefix: 'Not Before', critical: false },
            iat: { el: iatStatus, prefix: 'Issued At', critical: false }
        };
        
        // Reset all statuses
        Object.values(statuses).forEach(s => {
            s.el.textContent = '';
            s.el.className = 'd-block text-muted';
        });
        
        // Check each claim
        for (const [claim, config] of Object.entries(statuses)) {
            if (payload[claim] !== undefined) {
                const claimTime = payload[claim];
                const date = new Date(claimTime * 1000);
                const timeStr = date.toLocaleString();
                
                if (claim === 'exp' && claimTime < now) {
                    config.el.innerHTML = `🔴 <strong>${config.prefix}:</strong> ${timeStr} (EXPIRED)`;
                    config.el.className = 'd-block text-danger fw-bold';
                } else if (claim === 'nbf' && claimTime > now) {
                    config.el.innerHTML = `🟡 <strong>${config.prefix}:</strong> ${timeStr} (NOT ACTIVE YET)`;
                    config.el.className = 'd-block text-warning fw-bold';
                } else {
                    const icon = claim === 'exp' ? '🟢' : '🔵';
                    config.el.innerHTML = `${icon} <strong>${config.prefix}:</strong> ${timeStr}`;
                    config.el.className = `d-block text-${claim === 'exp' ? 'success' : 'info'} fw-bold`;
                }
            }
        }
    }
});