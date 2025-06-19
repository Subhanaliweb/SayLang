import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function CustomTextScreen({ navigation }) {
  const { t } = useLanguage();
  const [customText, setCustomText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('french');

  const languages = [
    { key: 'french', label: 'French', placeholder: 'Entrez votre texte français ici...' },
    { key: 'ewe', label: 'Ewe', placeholder: 'Ŋlɔ wò Ewe nyawo ɖe afi sia...' }
  ];

  const examples = {
    french: [
      'Bonjour, comment allez-vous?',
      'Je suis très heureux de vous rencontrer.'
    ],
    ewe: [
      'Ndi, aleke nèle?',
      'Dzidzɔ gã aɖe dom be medo go wò.'
    ]
  };

  const handleContinue = () => {
    if (customText.trim().length < 3) {
      Alert.alert('Error', `Please enter at least 3 characters of ${selectedLanguage === 'french' ? 'French' : 'Ewe'} text.`);
      return;
    }

    navigation.navigate('Recording', {
      text: customText.trim(),
      isCustom: true,
      language: selectedLanguage,
    });
  };

  const clearText = () => {
    setCustomText('');
  };

  const renderLanguageTab = (language) => (
    <TouchableOpacity
      key={language.key}
      style={[
        styles.languageTab,
        selectedLanguage === language.key && styles.selectedLanguageTab
      ]}
      onPress={() => {
        setSelectedLanguage(language.key);
        setCustomText(''); // Clear text when switching languages
      }}
    >
      <Text style={[
        styles.languageTabText,
        selectedLanguage === language.key && styles.selectedLanguageTabText
      ]}>
        {language.label}
      </Text>
    </TouchableOpacity>
  );

  const currentLanguage = languages.find(lang => lang.key === selectedLanguage);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#006A4E', '#FFCE00']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Ionicons name="create" size={50} color="#FFCE00" />
                <Text style={styles.title}>{t('wrTitle')}</Text>
                <Text style={styles.subtitle}>
                  {/* Enter the {selectedLanguage === 'français' ? 'French' : 'Ewe'} sentence you want to record */}
                  {t('wrAppSubtitle')}
                </Text>
              </View>

              {/* Language Tabs */}
              {/* <View style={styles.languageTabsContainer}>
                <View style={styles.languageTabsList}>
                  {languages.map(language => renderLanguageTab(language))}
                </View>
              </View> */}

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {/* {selectedLanguage === 'french' ? 'French' : 'Ewe'} Text */}
                    {t('wrBoxTitle')}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={customText}
                    onChangeText={setCustomText}
                    placeholder={currentLanguage.placeholder}
                    placeholderTextColor="#94a3b8"
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <View style={styles.inputFooter}>
                    <Text style={styles.characterCount}>
                      {customText.length}/500
                    </Text>
                    {customText.length > 0 && (
                      <TouchableOpacity onPress={clearText} style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* <View style={styles.exampleContainer}>
                  <Text style={styles.exampleTitle}>Examples:</Text>
                  {examples[selectedLanguage].map((example, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCustomText(example)}
                      style={styles.exampleButton}
                    >
                      <Text style={styles.exampleText}>{example}</Text>
                    </TouchableOpacity>
                  ))}
                </View> */}
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  customText.trim().length < 3 && styles.disabledButton
                ]}
                onPress={handleContinue}
                disabled={customText.trim().length < 3}
              >
                <LinearGradient
                  colors={
                    customText.trim().length >= 3
                      ? ['#10b981', '#059669']
                      : ['#006A4E', '#006A4E']
                  }
                  style={styles.buttonGradient}
                >
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                  <Text style={styles.buttonText}>{t('wrContinueButton')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 8,
    textAlign: 'center',
  },
  languageTabsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  languageTabsList: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  languageTab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedLanguageTab: {
    backgroundColor: '#fff',
  },
  languageTabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLanguageTabText: {
    color: '#006A4E',
  },
  inputContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#374151',
    minHeight: 120,
    maxHeight: 200,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  clearBtn: {
    padding: 5,
  },
  exampleContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  exampleButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#006A4E',
    fontStyle: 'italic',
  },
  continueButton: {
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});