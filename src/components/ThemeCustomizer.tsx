"use client";

import React, { useState, useEffect } from 'react';
import { useTheme, ThemeSettings } from '@/contexts/ThemeContext';
import { Palette, Save, Undo, Trophy } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="brutalist-modal__label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border-2 border-black"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="brutalist-modal__input"
        />
      </div>
    </div>
  );
};

interface ThemeCustomizerProps {
  familyId: string;
  onClose?: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ familyId, onClose }) => {
  const { theme, updateTheme, saveTheme, loadTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState<ThemeSettings>(theme);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load theme when component mounts
    loadTheme(familyId);
  }, [familyId, loadTheme]);

  useEffect(() => {
    // Update local theme when context theme changes
    setLocalTheme(theme);
  }, [theme]);

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    setLocalTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Update the context theme
    updateTheme(localTheme);
    
    try {
      // Save to database
      await saveTheme(familyId);
      setSaveMessage('Theme saved successfully!');
      
      // Close the customizer if onClose is provided
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      setSaveMessage('Error saving theme. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to the current theme from context
    setLocalTheme(theme);
  };

  return (
    <div className="brutalist-modal p-6 max-w-2xl mx-auto">
      <div className="brutalist-modal__title flex items-center gap-2">
        <Palette size={24} />
        <span>Customize Card Theme</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold mb-4">Card Appearance</h3>
          <ColorPicker
            label="Border Color"
            value={localTheme.borderColor}
            onChange={(value) => handleColorChange('borderColor', value)}
          />
          <ColorPicker
            label="Background Color"
            value={localTheme.backgroundColor}
            onChange={(value) => handleColorChange('backgroundColor', value)}
          />
          <ColorPicker
            label="Shadow Color"
            value={localTheme.shadowColor}
            onChange={(value) => handleColorChange('shadowColor', value)}
          />
          <ColorPicker
            label="Text Color"
            value={localTheme.textColor}
            onChange={(value) => handleColorChange('textColor', value)}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-4">Button Colors</h3>
          <ColorPicker
            label="Primary Button Background"
            value={localTheme.buttonPrimaryBg}
            onChange={(value) => handleColorChange('buttonPrimaryBg', value)}
          />
          <ColorPicker
            label="Primary Button Text"
            value={localTheme.buttonPrimaryText}
            onChange={(value) => handleColorChange('buttonPrimaryText', value)}
          />
          <ColorPicker
            label="Approve Button Hover"
            value={localTheme.buttonApproveBg}
            onChange={(value) => handleColorChange('buttonApproveBg', value)}
          />
          <ColorPicker
            label="Reject Button Hover"
            value={localTheme.buttonRejectBg}
            onChange={(value) => handleColorChange('buttonRejectBg', value)}
          />
        </div>
      </div>
      
      {/* Preview section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Preview</h3>
        <div 
          className="brutalist-card"
          style={{
            '--brutalist-card-border-color': localTheme.borderColor,
            '--brutalist-card-bg-color': localTheme.backgroundColor,
            '--brutalist-card-shadow-color': localTheme.shadowColor,
            '--brutalist-card-text-color': localTheme.textColor,
            '--brutalist-card-button-primary-bg': localTheme.buttonPrimaryBg,
            '--brutalist-card-button-primary-text': localTheme.buttonPrimaryText,
            '--brutalist-card-button-approve-bg': localTheme.buttonApproveBg,
            '--brutalist-card-button-approve-shadow': localTheme.buttonApproveShadow,
            '--brutalist-card-button-reject-bg': localTheme.buttonRejectBg,
            '--brutalist-card-button-reject-shadow': localTheme.buttonRejectShadow
          } as React.CSSProperties}
        >
          <div className="brutalist-card__header">
            <div className="brutalist-card__icon">
              <Trophy size={24} />
            </div>
            <h3 className="brutalist-card__title">SAMPLE CARD</h3>
            <div className="brutalist-card__points">50 pts</div>
          </div>
          <div className="brutalist-card__message">
            This is a preview of how your cards will look with the selected theme settings.
          </div>
          <div className="brutalist-card__actions">
            <button
              className="brutalist-card__button brutalist-card__button--primary"
            >
              PRIMARY BUTTON
            </button>
            <div className="flex gap-2">
              <button className="brutalist-card__button">SECONDARY</button>
              <button className="brutalist-card__button">BUTTON</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-4">
        {saveMessage && (
          <div className="text-green-600 font-bold self-center">{saveMessage}</div>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="brutalist-card__button flex items-center justify-center gap-2"
          style={{ maxWidth: '150px' }}
        >
          <Undo size={16} />
          <span>Reset</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="brutalist-card__button brutalist-card__button--primary flex items-center justify-center gap-2"
          style={{ maxWidth: '150px' }}
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Theme'}</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 