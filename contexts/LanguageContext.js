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
    logo: 'G²',
    appTitle: 'Ton Gbé-Gné',
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
    recSaveRecording: 'Sauvegarder',
    recDiscardTitle: 'Supprimer l\'Enregistrement?',
    recDiscardMessage: 'Cela supprimera définitivement votre enregistrement actuel.',
    recYesDiscard: 'Oui, Supprimer',
    recRecordAnother: 'Enregistrer un Autre',
    recGoHome: 'Aller à l\'Accueil',
    recNoRecordingFound: 'Aucun enregistrement trouvé. Veuillez d\'abord enregistrer l\'audio.',
    recSaveSuccess: 'Enregistrement enregistré avec succès !',
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
    close: 'Fermer',

    // Login
    authLogin: 'Connexion',
    authEmail: 'Email',
    authEmailPlaceholder: 'your-email@example.com',
    authPassword: 'Mot de passe',
    authPasswordPlaceholder: 'Entrez votre mot de passe',
    authLoading: 'Chargement...',
    authNoAccount: 'Vous n\'avez pas de compte?',
    authContinueAsGuest: 'Continuer en tant qu\'anonyme',
    authGuestUser: 'Utilisateur anonyme',

    // Register
    authRegister: 'S\'inscrire',
    authConfirmPassword: 'Confirmer le mot de passe',
    authConfirmPasswordPlaceholder: 'Confirmez votre mot de passe',
    authFillAllFields: 'Veuillez remplir tous les champs',
    error: 'Erreur',
    authPasswordsDontMatch: 'Les mots de passe ne correspondent pas',
    authHaveAccount: 'Vous avez déjà un compte?',
    authWeakPassword: 'Mot de passe faible.',
    authFairPassword: 'Mot de passe moyen.',
    authGoodPassword: 'Bon mot de passe.',
    authStrongPassword: 'Mot de passe fort.',
    authPasswordsDontMatch: 'Les mots de passe ne correspondent pas',
    authPasswordTooShort: 'Le mot de passe est trop court. Il doit comporter au moins 6 caractères.',
    authEmailVerification: 'Vérification de l\'email',
    success: 'Succès',

    // Guest Authentication
    authEnterUsername: 'Entrez votre nom d\'utilisateur',
    chooseUsername: 'Choisissez un nom d\'utilisateur',
    authUsername: 'Nom d\'utilisateur',
    authUsernamePlaceholder: 'Entrez votre nom d\'utilisateur',
    authLoginInstead: 'Se connecter à la place',
    authAnonymousDesc: 'Continuer en tant qu\'utilisateur anonyme sans compte.',
    authContinue: 'Continuer',

    // Profile Popup
    authGuestProfile: 'Profil Invité',
    authUserProfile: 'Profil Utilisateur',
    authNickname: 'Utilisateur',
    authLogout: 'Se Déconnecter',
    authProfile: 'Profil',
    authLogoutSuccess: 'Déconnexion réussie',
    authUserType: 'Type d\'utilisateur',

    // Email Verification Screen
    authCheckYourEmail: 'Vérifiez votre email',
    authVerificationSent: 'Nous avons envoyé un lien de vérification à :',
    authEmailVerificationInstructions: 'Cliquez sur le lien dans votre email pour vérifier votre compte et terminer votre inscription.',
    authBackToLogin: 'Retour à la connexion',
    authEmailNotFound: 'Adresse email non trouvée',
    authVerificationEmailSent: 'Email de vérification envoyé ! Veuillez vérifier votre boîte de réception et votre dossier spam.',
  },
  en: {
    // Home Screen
    logo: 'G²',
    appTitle: 'Your Gbé-Gné',
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
    recSaveSuccess: 'Recording saved successfully!',
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
    close: 'Close',
    
    // Login
    authLogin: 'Login',
    authEmail: 'Email',
    authEmailPlaceholder: 'your-email@example.com',
    authPassword: 'Password',
    authPasswordPlaceholder: 'Enter your password',
    authLoading: 'Loading...',
    authNoAccount: 'Don\'t have an account?',
    authContinueAsGuest: 'Continue as Anonymous',

    // Register
    authRegister: 'Register',
    authConfirmPassword: 'Confirm Password',
    authConfirmPasswordPlaceholder: 'Confirm your password',
    authFillAllFields: 'Please fill all fields',
    error: 'Error',
    authPasswordsDontMatch: 'Passwords do not match',
    authHaveAccount: 'Already have an account?',
    authRegisteredUser: 'Registered User',
    authWeakPassword: 'Weak password.',
    authFairPassword: 'Fair password.',
    authGoodPassword: 'Good password.',
    authStrongPassword: 'Strong password.',
    authPasswordsDontMatch: 'Passwords do not match',
    authPasswordTooShort: 'Password is too short. It must be at least 6 characters long.',
    authEmailVerification: 'Email Verification',
    success: 'Success',

    // Guest Authentication
    authEnterUsername: 'Enter your username',
    chooseUsername: 'Choose a username',
    authUsername: 'Username',
    authUsernamePlaceholder: 'Enter your username',
    authLoginInstead: 'Login instead',
    authAnonymousDesc: 'Continue as a anonymous user without an account.',
    authContinue: 'Continue',
    authGuestUser: 'Anonymous User',

    // Profile Popup
    authGuestProfile: 'Anonymous Profile',
    authUserProfile: 'User Profile',
    authNickname: 'User',
    authLogout: 'Logout',
    authProfile: 'Profile',
    authLogoutSuccess: 'Logged out successfully',
    authUserType: 'User Type',

    // Email Verification Screen
    authCheckYourEmail: 'Check Your Email',
    authVerificationSent: 'We\'ve sent a verification link to:',
    authEmailVerificationInstructions: 'Click the link in your email to verify your account and complete your registration.',
    authBackToLogin: 'Back to Login',
    authEmailNotFound: 'Email address not found',
    authVerificationEmailSent: 'Verification email sent! Please check your inbox and spam folder.',
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