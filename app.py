"""
Intelligent Document Classifier — Flask Web Application
Serves the frontend and provides API endpoints for document classification.
"""

import os
import traceback
from flask import Flask, render_template, request, jsonify
from classifier import DocumentClassifier

# Try importing document parsers
try:
    from PyPDF2 import PdfReader
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    from docx import Document
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Initialize and train the classifier
classifier = DocumentClassifier()
print("=" * 60)
print("  Intelligent Document Classifier")
print("  Training NLP model... Please wait.")
print("=" * 60)
classifier.train_model()
print("=" * 60)
print("  Model ready! Starting web server...")
print("=" * 60)


def extract_text_from_file(file):
    """Extract text content from uploaded file."""
    filename = file.filename.lower()

    if filename.endswith('.txt'):
        return file.read().decode('utf-8', errors='ignore')

    elif filename.endswith('.pdf') and PDF_SUPPORT:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text

    elif filename.endswith('.docx') and DOCX_SUPPORT:
        doc = Document(file)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text

    else:
        supported = ['.txt']
        if PDF_SUPPORT:
            supported.append('.pdf')
        if DOCX_SUPPORT:
            supported.append('.docx')
        raise ValueError(f"Unsupported file type. Supported: {', '.join(supported)}")


@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html')


@app.route('/classify', methods=['POST'])
def classify():
    """Classify text input."""
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    text = data['text'].strip()
    if not text:
        return jsonify({'error': 'Empty text provided'}), 400

    result = classifier.classify_text(text)
    return jsonify(result)


@app.route('/upload', methods=['POST'])
def upload():
    """Handle file upload and classify."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        text = extract_text_from_file(file)
        if not text or not text.strip():
            return jsonify({'error': 'Could not extract text from file. The file may be empty or in an unsupported format.'}), 400

        result = classifier.classify_text(text)
        result['filename'] = file.filename
        result['extracted_text'] = text[:500] + ('...' if len(text) > 500 else '')
        return jsonify(result)

    except ValueError as e:
        print(f'[Upload Error - ValueError] {str(e)}')
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f'[Upload Error] {str(e)}')
        traceback.print_exc()
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500


@app.route('/stats', methods=['GET'])
def stats():
    """Return model statistics."""
    return jsonify(classifier.get_model_stats())


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    app.run(debug=False, host='0.0.0.0', port=port)
