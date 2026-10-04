"""
Intelligent Document Classifier — NLP Classification Engine
Uses TF-IDF feature vectors + Multinomial Naive Bayes for text classification.
Trained on the 20 Newsgroups dataset with 6 curated categories.
"""

import os
import time
import joblib
import numpy as np
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
from sklearn.model_selection import cross_val_score

# Category mapping: 20 Newsgroups subset -> friendly names
CATEGORY_MAP = {
    'comp.graphics': 'Technology',
    'comp.sys.mac.hardware': 'Technology',
    'comp.windows.x': 'Technology',
    'sci.med': 'Science',
    'sci.space': 'Science',
    'sci.electronics': 'Science',
    'rec.sport.baseball': 'Sports',
    'rec.sport.hockey': 'Sports',
    'talk.politics.misc': 'Politics',
    'talk.politics.guns': 'Politics',
    'soc.religion.christian': 'Religion',
    'alt.atheism': 'Religion',
    'rec.autos': 'Automobiles',
    'rec.motorcycles': 'Automobiles',
}

NEWSGROUP_CATEGORIES = list(CATEGORY_MAP.keys())
FRIENDLY_CATEGORIES = ['Technology', 'Science', 'Sports', 'Politics', 'Religion', 'Automobiles']
MODEL_CACHE_PATH = os.path.join(os.path.dirname(__file__), 'model_cache.joblib')


class DocumentClassifier:
    """NLP-based document classifier using TF-IDF + Naive Bayes."""

    def __init__(self):
        self.pipeline = None
        self.train_accuracy = 0.0
        self.test_accuracy = 0.0
        self.cv_accuracy = 0.0
        self.num_train_samples = 0
        self.num_test_samples = 0
        self.num_features = 0
        self.training_time = 0.0
        self.category_names = FRIENDLY_CATEGORIES
        self.is_trained = False

    def train_model(self, force_retrain=False):
        """Train or load the classification model."""
        if not force_retrain and os.path.exists(MODEL_CACHE_PATH):
            try:
                print(f"[Classifier] Loading cached model from {MODEL_CACHE_PATH}...")
                cached = joblib.load(MODEL_CACHE_PATH)
                self.pipeline = cached['pipeline']
                self.train_accuracy = cached.get('train_accuracy', 0.0)
                self.test_accuracy = cached.get('test_accuracy', 0.0)
                self.cv_accuracy = cached.get('cv_accuracy', 0.0)
                self.num_train_samples = cached.get('num_train_samples', 0)
                self.num_test_samples = cached.get('num_test_samples', 0)
                self.num_features = cached.get('num_features', 15000)
                self.training_time = cached.get('training_time', 0.0)
                self.category_names = cached.get('category_names', FRIENDLY_CATEGORIES)
                self.is_trained = True
                print("[Classifier] Model loaded successfully from cache!")
                return
            except Exception as e:
                print(f"[Classifier] Failed to load cache ({e}), retraining model...")

        print("[Classifier] Fetching 20 Newsgroups training data...")
        train_data = fetch_20newsgroups(
            subset='train',
            categories=NEWSGROUP_CATEGORIES,
            remove=('headers', 'footers', 'quotes'),
            shuffle=True,
            random_state=42
        )

        print("[Classifier] Fetching 20 Newsgroups test data...")
        test_data = fetch_20newsgroups(
            subset='test',
            categories=NEWSGROUP_CATEGORIES,
            remove=('headers', 'footers', 'quotes'),
            shuffle=True,
            random_state=42
        )

        # Map original labels to friendly category labels
        train_friendly = [CATEGORY_MAP[train_data.target_names[label]] for label in train_data.target]
        test_friendly = [CATEGORY_MAP[test_data.target_names[label]] for label in test_data.target]

        # Build the TF-IDF + Naive Bayes pipeline
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=15000,
                ngram_range=(1, 2),
                stop_words='english',
                min_df=2,
                max_df=0.95,
                sublinear_tf=True
            )),
            ('classifier', MultinomialNB(alpha=0.1))
        ])

        print("[Classifier] Training TF-IDF + Naive Bayes pipeline...")
        start_time = time.time()
        self.pipeline.fit(train_data.data, train_friendly)
        self.training_time = round(time.time() - start_time, 2)

        # Evaluate
        train_predictions = self.pipeline.predict(train_data.data)
        test_predictions = self.pipeline.predict(test_data.data)

        self.train_accuracy = round(accuracy_score(train_friendly, train_predictions) * 100, 2)
        self.test_accuracy = round(accuracy_score(test_friendly, test_predictions) * 100, 2)

        # Cross-validation on training data
        cv_scores = cross_val_score(self.pipeline, train_data.data, train_friendly, cv=5, scoring='accuracy')
        self.cv_accuracy = round(float(np.mean(cv_scores)) * 100, 2)

        # Stats
        self.num_train_samples = len(train_data.data)
        self.num_test_samples = len(test_data.data)
        self.num_features = self.pipeline.named_steps['tfidf'].max_features

        self.is_trained = True

        # Save cache for instant restarts
        try:
            joblib.dump({
                'pipeline': self.pipeline,
                'train_accuracy': self.train_accuracy,
                'test_accuracy': self.test_accuracy,
                'cv_accuracy': self.cv_accuracy,
                'num_train_samples': self.num_train_samples,
                'num_test_samples': self.num_test_samples,
                'num_features': self.num_features,
                'training_time': self.training_time,
                'category_names': self.category_names
            }, MODEL_CACHE_PATH)
            print(f"[Classifier] Model cached to {MODEL_CACHE_PATH}")
        except Exception as e:
            print(f"[Classifier] Could not write cache file: {e}")

        print(f"[Classifier] Training complete!")
        print(f"  Train Accuracy: {self.train_accuracy}%")
        print(f"  Test Accuracy:  {self.test_accuracy}%")
        print(f"  CV Accuracy:    {self.cv_accuracy}%")
        print(f"  Training Time:  {self.training_time}s")

    def classify_text(self, text):
        """
        Classify a document text.
        Returns dict with predicted category and confidence scores.
        """
        if not self.is_trained:
            raise RuntimeError("Model is not trained yet. Call train_model() first.")

        if not text or not text.strip():
            return {
                'category': 'Unknown',
                'confidence': 0.0,
                'all_scores': {cat: 0.0 for cat in self.category_names},
                'text_length': 0,
                'word_count': 0
            }

        # Get prediction and probability scores
        prediction = self.pipeline.predict([text])[0]
        probabilities = self.pipeline.predict_proba([text])[0]
        classes = self.pipeline.classes_

        # Build scores dict for all friendly categories
        scores = {}
        for cat in self.category_names:
            if cat in classes:
                idx = list(classes).index(cat)
                scores[cat] = round(float(probabilities[idx]) * 100, 2)
            else:
                scores[cat] = 0.0

        # Sort scores descending
        sorted_scores = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))

        return {
            'category': prediction,
            'confidence': scores.get(prediction, 0.0),
            'all_scores': sorted_scores,
            'text_length': len(text),
            'word_count': len(text.split())
        }

    def get_model_stats(self):
        """Return model statistics and accuracy metrics."""
        return {
            'is_trained': self.is_trained,
            'train_accuracy': self.train_accuracy,
            'test_accuracy': self.test_accuracy,
            'cv_accuracy': self.cv_accuracy,
            'num_train_samples': self.num_train_samples,
            'num_test_samples': self.num_test_samples,
            'num_features': self.num_features,
            'training_time': self.training_time,
            'categories': self.category_names,
            'algorithm': 'TF-IDF + Multinomial Naive Bayes',
            'dataset': '20 Newsgroups (6 categories)'
        }
