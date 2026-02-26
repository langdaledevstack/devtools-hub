document.addEventListener('DOMContentLoaded', () => {
    const passwordResult = document.getElementById('passwordResult');
    const passwordOutput = document.getElementById('passwordOutput');
    const entropyBadge = document.getElementById('entropyBadge');
    const poolInfo = document.getElementById('poolInfo');
    const setsUsed = document.getElementById('setsUsed');
    const regenerateBtn = document.getElementById('regeneratePassword');
    
    // Define safe special character set
    const SPECIAL_SET = "!@#$%&*";
    
    // Get URL parameters for prefilling options
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            length: params.get('length') ? parseInt(params.get('length')) : 16,
            use_upper: params.get('use_upper') !== 'false',
            use_lower: params.get('use_lower') !== 'false',
            use_digits: params.get('use_digits') !== 'false',
            use_special: params.get('use_special') === 'true',
            exclude_ambiguous: params.get('exclude_ambiguous') === 'true'
        };
    }
    
    // Initialize form with URL params or defaults
    function initForm() {
        const params = getUrlParams();
        
        document.getElementById('length').value = params.length;
        document.getElementById('use_upper').checked = params.use_upper;
        document.getElementById('use_lower').checked = params.use_lower;
        document.getElementById('use_digits').checked = params.use_digits;
        document.getElementById('use_special').checked = params.use_special;
        document.getElementById('exclude_ambiguous').checked = params.exclude_ambiguous;
    }
    
    // Generate secure password using Web Crypto API
    function generatePassword() {
        const length = parseInt(document.getElementById('length').value);
        const useUpper = document.getElementById('use_upper').checked;
        const useLower = document.getElementById('use_lower').checked;
        const useDigits = document.getElementById('use_digits').checked;
        const useSpecial = document.getElementById('use_special').checked;
        const excludeAmbiguous = document.getElementById('exclude_ambiguous').checked;
        
        // Show loading state
        passwordOutput.textContent = 'Generating...';
        entropyBadge.textContent = 'Calculating...';
        entropyBadge.className = 'badge bg-secondary';
        
        // Build character sets
        let charSets = {
            upper: useUpper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
            lower: useLower ? 'abcdefghijklmnopqrstuvwxyz' : '',
            digits: useDigits ? '0123456789' : '',
            special: useSpecial ? SPECIAL_SET : ''
        };
        
        // Apply ambiguous character filtering
        if (excludeAmbiguous) {
            charSets = {
                upper: charSets.upper ? charSets.upper.replace(/[IO]/g, '') : '',
                lower: charSets.lower ? charSets.lower.replace(/[lo]/g, '') : '',
                digits: charSets.digits ? charSets.digits.replace(/[01]/g, '') : '',
                special: charSets.special // No ambiguous chars in our special set
            };
        }
        
        // Build selected sets list (only non-empty sets)
        const selectedSets = [];
        if (charSets.upper) selectedSets.push({ name: 'upper', chars: charSets.upper });
        if (charSets.lower) selectedSets.push({ name: 'lower', chars: charSets.lower });
        if (charSets.digits) selectedSets.push({ name: 'digits', chars: charSets.digits });
        if (charSets.special) selectedSets.push({ name: 'special', chars: charSets.special });
        
        const numSets = selectedSets.length;
        if (numSets === 0) {
            passwordOutput.textContent = 'ERROR: Select at least one character type';
            entropyBadge.textContent = 'Invalid config';
            entropyBadge.className = 'badge bg-danger';
            return;
        }
        
        if (length < numSets) {
            passwordOutput.textContent = `ERROR: Length (${length}) must be ≥ ${numSets} (number of selected types)`;
            entropyBadge.textContent = 'Invalid config';
            entropyBadge.className = 'badge bg-danger';
            return;
        }
        
        // Build total pool
        const totalPool = selectedSets.map(set => set.chars).join('');
        if (!totalPool) {
            passwordOutput.textContent = 'ERROR: No valid characters available';
            entropyBadge.textContent = 'Invalid config';
            entropyBadge.className = 'badge bg-danger';
            return;
        }
        
        // Generate password with guaranteed character diversity
        const passwordChars = [];
        
        // 1. Guarantee one character from each selected set
        for (const set of selectedSets) {
            passwordChars.push(randomCharFromSet(set.chars));
        }
        
        // 2. Fill remaining length from full pool
        const remaining = length - numSets;
        if (remaining > 0) {
            for (let i = 0; i < remaining; i++) {
                passwordChars.push(randomCharFromSet(totalPool));
            }
        }
        
        // 3. Cryptographically secure shuffle
        shuffleArray(passwordChars);
        const password = passwordChars.join('');
        
        // Calculate entropy (NIST-inspired)
        const poolSize = totalPool.length;
        // Conservative estimate accounting for mandatory characters constraint
        const entropyBits = (length * Math.log2(poolSize) - (numSets * Math.log2(numSets || 1))).toFixed(1);
        const safeEntropy = Math.max(0, parseFloat(entropyBits));
        
        // Strength assessment
        let strength, strengthClass;
        if (safeEntropy >= 80) {
            strength = 'Strong';
            strengthClass = 'success';
        } else if (safeEntropy >= 60) {
            strength = 'Good';
            strengthClass = 'warning';
        } else {
            strength = 'Moderate';
            strengthClass = 'danger';
        }
        
        // Update UI
        passwordOutput.textContent = password;
        poolInfo.textContent = `Pool size: ${poolSize}`;
        
        // Build sets used string
        const sets = [];
        if (useUpper) sets.push('A-Z');
        if (useLower) sets.push('a-z');
        if (useDigits) sets.push('0-9');
        if (useSpecial) sets.push('!@#$%&*');
        setsUsed.textContent = `Using: ${sets.join(', ')}`;
        
        // Update strength badge
        entropyBadge.textContent = `${strength} (${safeEntropy} bits)`;
        entropyBadge.className = `badge bg-${strengthClass}`;
        
        // Visual feedback
        passwordResult.classList.add('result-updated');
        setTimeout(() => passwordResult.classList.remove('result-updated'), 300);
    }
    
    // Helper: Get random character from set using crypto API
    function randomCharFromSet(charSet) {
        const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
        return charSet[randomValue % charSet.length];
    }
    
    // Helper: Fisher-Yates shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Initialize and generate first password
    initForm();
    setTimeout(generatePassword, 300);
    
    // Event handlers
    regenerateBtn.addEventListener('click', generatePassword);
    
    // Character set change handlers
    ['use_upper', 'use_lower', 'use_digits', 'use_special', 'exclude_ambiguous'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            const setsSelected = [
                document.getElementById('use_upper').checked,
                document.getElementById('use_lower').checked,
                document.getElementById('use_digits').checked,
                document.getElementById('use_special').checked
            ].some(Boolean);
            if (setsSelected) generatePassword();
        });
    });
    
    // Length change (throttled)
    let lengthTimeout;
    document.getElementById('length').addEventListener('input', (e) => {
        clearTimeout(lengthTimeout);
        lengthTimeout = setTimeout(() => {
            const len = parseInt(e.target.value);
            if (len >= 8 && len <= 128) generatePassword();
        }, 500);
    });
    
    // Advanced options toggle
    document.querySelector('[data-bs-toggle="collapse"]').addEventListener('click', function() {
        const chevron = this.querySelector('.chevron');
        chevron.textContent = chevron.textContent === '▼' ? '▲' : '▼';
    });
});