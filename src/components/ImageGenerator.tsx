import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function ImageGenerator() {
  const { t, language } = useLanguage();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt(t('defaultPrompt'));
  }, [language, t]);

  // ...existing code...
}