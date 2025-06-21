import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');

export default function LanguageSwitch() {
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setModalVisible(false);
  };

  const getCurrentLanguageName = () => {
    const current = availableLanguages.find(lang => lang.code === currentLanguage);
    return current ? current.name : 'Français';
  };

  return (
    <>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="language" size={18} color="#FFCE00" />
        <Text style={styles.languageButtonText}>
          {currentLanguage.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('language')}</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#006A4E" />
                </TouchableOpacity>
              </View>

              <View style={styles.languageOptions}>
                {availableLanguages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      currentLanguage === language.code && styles.selectedLanguage
                    ]}
                    onPress={() => handleLanguageChange(language.code)}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      currentLanguage === language.code && styles.selectedLanguageText
                    ]}>
                      {language.name}
                    </Text>
                    {currentLanguage === language.code && (
                      <Ionicons name="checkmark" size={20} color="#FFCE00" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 206, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFCE00',
    marginRight: 15,
  },
  languageButtonText: {
    color: '#FFCE00',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  modalGradient: {
    borderRadius: 20,
    padding: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006A4E',
  },
  closeButton: {
    padding: 4,
  },
  languageOptions: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  selectedLanguage: {
    backgroundColor: '#006A4E',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#006A4E',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#FFCE00',
    fontWeight: 'bold',
  },
});