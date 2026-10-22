import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import scanService from '../services/scanService';
import foodLogService from '../services/foodLogService';
import { useToast } from '../context/ToastContext';
import NutritionCard from '../components/NutritionCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './Scanner.css';

const Scanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    setSelectedFile(file);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleTriggerScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    try {
      const response = await scanService.scanFood(selectedFile);
      setScanResult(response);
      addToast('Meal scanned successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to analyze image. Please try again.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddToLog = async (food) => {
    try {
      await foodLogService.addEntry({
        name: food.name,
        meal: food.meal || 'Lunch',
        quantity: 1,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      });
      addToast(`Added ${food.name} to your ${food.meal || 'Lunch'} log!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to add entry to log', 'error');
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setScanResult(null);
  };

  const detectedFoods = scanResult?.foods || scanResult?.scan?.foods || [];
  const lowestConfidence = detectedFoods.length
    ? Math.min(...detectedFoods.map((f) => f.confidence || 100))
    : 100;

  return (
    <div className="scanner-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Food Scanner</h1>
          <p className="page-subtitle">
            Snap or upload an image to identify ingredients, calories, and macros
          </p>
        </div>
        <Link to="/history" className="btn btn-ghost btn-sm">
          📑 View Scan History
        </Link>
      </div>

      {!scanResult ? (
        /* ================= UPLOAD & PREVIEW STATE ================= */
        <div className="scanner-card glass-card">
          {!previewUrl ? (
            <div
              className={`dropzone-container ${isDragging ? 'dropzone-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="dropzone-icon">📸</div>
              <h3 className="dropzone-title">Drag & drop your meal photo here</h3>
              <p className="dropzone-subtitle">Supports JPEG, PNG, WEBP up to 10MB</p>

              <div className="dropzone-button-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Upload Image
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  📷 Take Photo
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>
          ) : (
            /* Selected Image Preview */
            <div className="preview-container">
              <div className="preview-image-wrapper">
                <img src={previewUrl} alt="Meal Preview" className="preview-image" />
                {isScanning && (
                  <div className="scanner-laser-overlay">
                    <div className="scanner-laser-line" />
                    <div className="scanner-pulse-ring" />
                    <span className="scanner-analyzing-text">
                      <LoadingSpinner size="small" color="#F5A524" />
                      Analyzing meal with AI...
                    </span>
                  </div>
                )}
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetScanner}
                  disabled={isScanning}
                >
                  ✕ Choose Another
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <LoadingSpinner size="small" color="#0D1117" />
                      <span>Scanning Food...</span>
                    </>
                  ) : (
                    <span>🔍 Analyze & Calculate Macros</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= RESULTS STATE ================= */
        <div className="scan-results-container">
          <div className="results-header-card glass-card">
            <div className="results-summary-row">
              <div className="results-thumbnail-box">
                <img src={previewUrl} alt="Detected Meal" className="results-thumbnail" />
              </div>

              <div className="results-summary-text">
                <span className="results-badge">Scan Complete</span>
                <h2 className="results-title">
                  {detectedFoods.length > 0
                    ? `Identified ${detectedFoods.length} items in meal`
                    : 'No food clearly recognized'}
                </h2>
                <p className="results-timestamp">
                  Scanned on {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="results-top-actions">
                <button type="button" className="btn btn-primary" onClick={resetScanner}>
                  📷 Scan Another Meal
                </button>
              </div>
            </div>

            {/* Low confidence warning banner */}
            {lowestConfidence < 50 && detectedFoods.length > 0 && (
              <div className="low-confidence-warning">
                <span>⚠️</span>
                <div>
                  <strong>Low Confidence Detection:</strong> Some items had lower match
                  accuracy. Please verify the portions and nutritional estimates.
                </div>
              </div>
            )}
          </div>

          {/* Detected Food Cards List */}
          {detectedFoods.length > 0 ? (
            <div className="detected-cards-list">
              {detectedFoods.map((food, idx) => (
                <NutritionCard
                  key={food.id || idx}
                  food={food}
                  onAddToLog={handleAddToLog}
                />
              ))}
            </div>
          ) : (
            <div className="no-food-box glass-card">
              <span style={{ fontSize: '3rem' }}>🥗</span>
              <h3>Could Not Detect Food</h3>
              <p>
                Try taking the photo with brighter lighting, a top-down angle, and avoiding
                heavy motion blur.
              </p>
              <button type="button" className="btn btn-primary" onClick={resetScanner}>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scanner;
