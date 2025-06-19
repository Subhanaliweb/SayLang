import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language translations
const translations = {
  fr: {
    // Home Screen
    appTitle: 'Collecteur Audio Ewe',
    appSubtitle: 'Enregistrez votre voix en Ewe pour des phrases françaises',
    writeCustomText: 'Écrire un Texte Personnalisé',
    writeCustomTextDesc: 'Écrivez votre propre phrase française et enregistrez l\'audio',
    suggestedTexts: 'Textes Suggérés',
    suggestedTextsDesc: 'Choisissez parmi des phrases françaises pré-écrites',
    footerText: 'Vos enregistrements aident à améliorer les modèles de langage IA',

    // Write Custom Text Screen
    wrTitle: 'Écrire un texte personnalisé',
    wrAppSubtitle: 'Entrez la phrase française que vous souhaitez enregistrer',
    wrBoxTitle: 'Texte français',
    wrContinueButton: "Continuer vers l'enregistrement",

    // Suggested Text Screen
    sgTitle: 'Textes suggérés',
    sgAppSubtitleBefore: 'Écouter ou enregistrer',
    sgSelectedLanguage: 'Français',
    sgAppSubtitleAfter: 'phrases',
    sgBeforeCount: 'textes disponibles',
    sgAfterCount: 'restant',
    sgSearchPlaceholder: 'Recherche',
    sgSearchPlaceholderAfter: 'textes...',
    sgLoading_texts: 'Chargement de textes...',
    sgLoadingText: 'Rechercher des phrases',
    sgSearchAdjust: "Essayez d'ajuster votre recherche",
    sgNoTextFound: 'Aucun texte trouvé',
    sgLoadMore: 'Charger plus',
    sglisten: 'Écouter',
    sgstop: 'Arrêt',
    sgRecord: 'Enregistrer',

    // Recording Screen
    recTitle: 'Enregistrement Audio',
    recInstructionsFrench: 'Lisez le texte français à haute voix et traduisez-le en langue Ewe',
    recInstructionsEwe: 'Lisez le texte Ewe à haute voix en langue Ewe',
    recTextLabel: 'Texte',
    recImportant: 'Important',
    recEweOnlyNotice: 'Votre enregistrement audio doit être parlé uniquement en langue Ewe.',
    recStatusRecording: 'Enregistrement en Ewe...',
    recTapToStart: 'Commencer l\'enregistrement',
    recInEwe: 'en Ewe',
    recYourEweRecording: 'Votre Enregistrement Ewe',
    recDuration: 'Durée',
    recPosition: 'Position',
    recSaveRecording: 'Sauvegarder l\'Enregistrement',
    recDiscardTitle: 'Supprimer l\'Enregistrement?',
    recDiscardMessage: 'Cela supprimera définitivement votre enregistrement actuel.',
    recYesDiscard: 'Oui, Supprimer',
    recRecordAnother: 'Enregistrer un Autre',
    recGoHome: 'Aller à l\'Accueil',
    recNoRecordingFound: 'Aucun enregistrement trouvé. Veuillez d\'abord enregistrer l\'audio.',
    recSaveSuccess: 'Enregistrement sauvegardé avec succès dans le stockage cloud!',
    recSaveError: 'Échec de la sauvegarde de l\'enregistrement. Veuillez réessayer.',
    recStartError: 'Échec du démarrage de l\'enregistrement. Veuillez réessayer.',
    recStopError: 'Erreur lors de l\'arrêt de l\'enregistrement. Veuillez réessayer.',
    recPlayError: 'Échec de la lecture de l\'enregistrement.',
    recRecordingInProgress: 'Enregistrement en Cours',
    recRecordingInProgressDesc: 'Vous avez un enregistrement actif. Voulez-vous l\'arrêter et partir?',
    recStopAndLeave: 'Arrêter et Partir',

    // Navigation
    home: 'Accueil',
    customText: 'Texte Personnalisé',
    suggestedText: 'Textes Suggérés',
    recordAudio: 'Enregistrer Audio',
    history: 'Historique',
    
    // Language Switch
    language: 'Langue',
    french: 'Français',
    english: 'English',
    
    // Common
    cancel: 'Annuler',
    ok: 'OK',
    close: 'Fermer'
  },
  en: {
    // Home Screen
    appTitle: 'Ewe Audio Collector',
    appSubtitle: 'Record your voice in Ewe for French sentences',
    writeCustomText: 'Write Custom Text',
    writeCustomTextDesc: 'Write your own French sentence and record audio',
    suggestedTexts: 'Suggested Texts',
    suggestedTextsDesc: 'Choose from pre-written French sentences',
    footerText: 'Your recordings help improve AI language models',
    
    // Write Custom Text Screen
    wrTitle: 'Write Custom Text',
    wrAppSubtitle: 'Enter the French sentence you want to record',
    wrBoxTitle: 'French Text',
    wrContinueButton: "Continue to Recording",

    // Suggested Text Screen
    sgTitle: 'Suggested Texts',
    sgAppSubtitleBefore: 'Listen to or record',
    sgSelectedLanguage: 'French',
    sgAppSubtitleAfter: 'sentences',
    sgBeforeCount: 'texts available',
    sgAfterCount: 'remaining',
    sgSearchPlaceholder: 'Search',
    sgSearchPlaceholderAfter: 'texts...',
    sgLoadingText: 'Loading texts...',
    sgSearchAdjust: 'Try adjusting your search',
    sgNoTextFound: 'No texts found',
    sgLoadMore: 'Load More',
    sglisten: 'Listen',
    sgstop: 'Stop',
    sgRecord: 'Record',

    // Recording Screen
    recTitle: 'Audio Recording',
    recInstructionsFrench: 'Read the French text aloud and translate it to Ewe language',
    recInstructionsEwe: 'Read the Ewe text aloud in Ewe language',
    recTextLabel: 'Text',
    recImportant: 'Important',
    recEweOnlyNotice: 'Your audio recording must be spoken in Ewe language only.',
    recStatusRecording: 'Recording in Ewe...',
    recTapToStart: 'Start recording',
    recInEwe: 'in Ewe',
    recYourEweRecording: 'Your Ewe Recording',
    recDuration: 'Duration',
    recPosition: 'Position',
    recSaveRecording: 'Save Recording',
    recDiscardTitle: 'Discard Recording?',
    recDiscardMessage: 'This will permanently delete your current recording.',
    recYesDiscard: 'Yes, Discard',
    recRecordAnother: 'Record Another',
    recGoHome: 'Go Home',
    recNoRecordingFound: 'No recording found. Please record audio first.',
    recSaveSuccess: 'Recording saved successfully to cloud storage!',
    recSaveError: 'Failed to save recording. Please try again.',
    recStartError: 'Failed to start recording. Please try again.',
    recStopError: 'Error stopping recording. Please try again.',
    recPlayError: 'Failed to play recording.',
    recRecordingInProgress: 'Recording in Progress',
    recRecordingInProgressDesc: 'You have an active recording. Do you want to stop it and leave?',
    recStopAndLeave: 'Stop & Leave',

    // Navigation
    home: 'Home',
    customText: 'Custom Text',
    suggestedText: 'Suggested Texts',
    recordAudio: 'Record Audio',
    history: 'History',
    
    // Language Switch
    language: 'Language',
    french: 'Français',
    english: 'English',
    
    // Common
    cancel: 'Cancel',
    ok: 'OK',
    close: 'Close'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr'); // Default to French
  const [loading, setLoading] = useState(true);

  // Load saved language preference on app start
  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      await AsyncStorage.setItem('app_language', languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    loading,
    availableLanguages: [
      { code: 'fr', name: translations.fr.french },
      { code: 'en', name: translations.en.english }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};