/**
 * Intelligent Document Classifier — Frontend Logic
 * Handles text classification, file upload, results display, and model stats.
 */

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initTabs();
    initDropzone();
    initTextArea();
    fetchModelStats();
    initNavLinks();
});

// ============================================
// Background Particles
// ============================================

function initParticles() {
    const container = document.getElementById('bgParticles');
    const count = 30;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 3 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(particle);
    }
}

// ============================================
// Navigation
// ============================================

function initNavLinks() {
    const links = document.querySelectorAll('.nav-link');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Scroll-based active state
    window.addEventListener('scroll', () => {
        const sections = ['classifier', 'stats', 'about'];
        const scrollPos = window.scrollY + 200;
        
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    links.forEach(l => l.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            }
        });
    });
}

// ============================================
// Tabs (Text / File)
// ============================================

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(targetTab + 'Content').classList.add('active');
        });
    });
}

// ============================================
// Text Area
// ============================================

function initTextArea() {
    const textarea = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    
    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCount.textContent = len.toLocaleString() + ' character' + (len !== 1 ? 's' : '');
    });
}

// ============================================
// Dropzone / File Upload
// ============================================

let selectedFile = null;

function initDropzone() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    
    // Click to browse
    dropzone.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    // File selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
        }
    });
    
    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    });
}

function handleFileSelected(file) {
    const validTypes = ['.txt', '.pdf', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(ext)) {
        showError('Unsupported file type. Please upload .txt, .pdf, or .docx files.');
        return;
    }
    
    selectedFile = file;
    
    // Show file info
    document.getElementById('dropzone').style.display = 'none';
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.style.display = 'flex';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('uploadBtn').disabled = false;
}

function removeFile() {
    selectedFile = null;
    document.getElementById('dropzone').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadBtn').disabled = true;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================
// Classification - Text
// ============================================

async function classifyText() {
    const text = document.getElementById('textInput').value.trim();
    
    if (!text) {
        showError('Please enter some text to classify.');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showResults(data);
        } else {
            showError(data.error || 'Classification failed.');
        }
    } catch (err) {
        showError('Network error. Please check if the server is running.');
    }
}

// ============================================
// Classification - File Upload
// ============================================

async function uploadFile() {
    // Try to get file from input element directly as fallback
    let fileToUpload = selectedFile;
    if (!fileToUpload) {
        const fileInput = document.getElementById('fileInput');
        if (fileInput && fileInput.files.length > 0) {
            fileToUpload = fileInput.files[0];
        }
    }
    
    if (!fileToUpload) {
        showError('Please select a file first.');
        return;
    }
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        
        console.log('Uploading file:', fileToUpload.name, 'Size:', fileToUpload.size);
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        console.log('Upload response status:', response.status);
        
        const data = await response.json();
        console.log('Upload response data:', data);
        
        if (response.ok) {
            showResults(data);
        } else {
            showError(data.error || 'Upload failed.');
        }
    } catch (err) {
        console.error('Upload error:', err);
        showError('Network error: ' + err.message + '. Please check if the server is running.');
    }
}

// ============================================
// Results Display
// ============================================

const CATEGORY_ICONS = {
    'Technology': '💻',
    'Science': '🔬',
    'Sports': '⚽',
    'Politics': '🏛️',
    'Religion': '🙏',
    'Automobiles': '🚗',
    'Unknown': '❓'
};

function showLoading() {
    document.getElementById('resultsEmpty').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('resultsError').style.display = 'none';
    document.getElementById('resultsLoading').style.display = 'block';
}

function showError(message) {
    document.getElementById('resultsEmpty').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('resultsLoading').style.display = 'none';
    document.getElementById('resultsError').style.display = 'block';
    document.getElementById('errorText').textContent = message;
}

function showResults(data) {
    document.getElementById('resultsEmpty').style.display = 'none';
    document.getElementById('resultsLoading').style.display = 'none';
    document.getElementById('resultsError').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';
    
    // Primary result
    const icon = CATEGORY_ICONS[data.category] || '📄';
    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('resultCategory').textContent = data.category;
    document.getElementById('resultConfidence').textContent = data.confidence.toFixed(1);
    
    // Color the badge based on confidence
    const badge = document.getElementById('resultBadge');
    if (data.confidence >= 70) {
        badge.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
    } else if (data.confidence >= 40) {
        badge.style.background = 'linear-gradient(135deg, #f59e0b, #fbbf24)';
    } else {
        badge.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
    }
    
    // Document info
    document.getElementById('wordCount').textContent = (data.word_count || 0).toLocaleString();
    document.getElementById('textLength').textContent = (data.text_length || 0).toLocaleString();
    
    // File name if uploaded
    if (data.filename) {
        document.getElementById('fileNameInfo').style.display = 'block';
        document.getElementById('docFileName').textContent = data.filename;
    } else {
        document.getElementById('fileNameInfo').style.display = 'none';
    }
    
    // Confidence bars
    renderConfidenceBars(data.all_scores);
    
    // Scroll to results on mobile
    if (window.innerWidth < 768) {
        document.getElementById('resultsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderConfidenceBars(scores) {
    const container = document.getElementById('confidenceBars');
    container.innerHTML = '';
    
    const entries = Object.entries(scores);
    
    entries.forEach(([category, score], index) => {
        const item = document.createElement('div');
        item.className = 'confidence-bar-item';
        
        const icon = CATEGORY_ICONS[category] || '📄';
        
        item.innerHTML = `
            <span class="confidence-bar-label">${icon} ${category}</span>
            <div class="confidence-bar-track">
                <div class="confidence-bar-fill bar-color-${index % 6}" 
                     style="width: 0%" 
                     data-target-width="${score}%"></div>
            </div>
            <span class="confidence-bar-value">${score.toFixed(1)}%</span>
        `;
        
        container.appendChild(item);
    });
    
    // Animate bars after render
    requestAnimationFrame(() => {
        setTimeout(() => {
            container.querySelectorAll('.confidence-bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.targetWidth;
            });
        }, 50);
    });
}

// ============================================
// Model Stats
// ============================================

async function fetchModelStats() {
    try {
        const response = await fetch('/stats');
        const data = await response.json();
        
        if (response.ok && data.is_trained) {
            document.getElementById('statTestAcc').textContent = data.test_accuracy + '%';
            document.getElementById('statTrainAcc').textContent = data.train_accuracy + '%';
            document.getElementById('statCVAcc').textContent = data.cv_accuracy + '%';
            document.getElementById('statTrainSamples').textContent = data.num_train_samples.toLocaleString();
            document.getElementById('statTestSamples').textContent = data.num_test_samples.toLocaleString();
            document.getElementById('statFeatures').textContent = data.num_features.toLocaleString();
            document.getElementById('statTime').textContent = data.training_time + 's';
            document.getElementById('statAlgorithm').textContent = 'NB + TF-IDF';
            
            // Update hero stats
            document.getElementById('heroAccuracy').textContent = data.test_accuracy + '%';
            document.getElementById('heroSamples').textContent = data.num_train_samples.toLocaleString();
        }
    } catch (err) {
        console.warn('Could not fetch model stats:', err);
    }
}
