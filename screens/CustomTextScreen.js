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

export default function CustomTextScreen({ navigation }) {
  const [frenchText, setFrenchText] = useState('');

  const handleContinue = () => {
    if (frenchText.trim().length < 3) {
      Alert.alert('Error', 'Please enter at least 3 characters of French text.');
      return;
    }

    navigation.navigate('Recording', {
      frenchText: frenchText.trim(),
      isCustom: true,
    });
  };

  const clearText = () => {
    setFrenchText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Ionicons name="create" size={50} color="#fff" />
                <Text style={styles.title}>Write French Text</Text>
                <Text style={styles.subtitle}>
                  Enter the French sentence you want to record
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>French Text</Text>
                  <TextInput
                    style={styles.textInput}
                    value={frenchText}
                    onChangeText={setFrenchText}
                    placeholder="Entrez votre texte français ici..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <View style={styles.inputFooter}>
                    <Text style={styles.characterCount}>
                      {frenchText.length}/500
                    </Text>
                    {frenchText.length > 0 && (
                      <TouchableOpacity onPress={clearText} style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleTitle}>Examples:</Text>
                  <TouchableOpacity
                    onPress={() => setFrenchText('Bonjour, comment allez-vous?')}
                    style={styles.exampleButton}
                  >
                    <Text style={styles.exampleText}>Bonjour, comment allez-vous?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFrenchText('Je suis très heureux de vous rencontrer.')}
                    style={styles.exampleButton}
                  >
                    <Text style={styles.exampleText}>Je suis très heureux de vous rencontrer.</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  frenchText.trim().length < 3 && styles.disabledButton
                ]}
                onPress={handleContinue}
                disabled={frenchText.trim().length < 3}
              >
                <LinearGradient
                  colors={
                    frenchText.trim().length >= 3
                      ? ['#10b981', '#059669']
                      : ['#94a3b8', '#64748b']
                  }
                  style={styles.buttonGradient}
                >
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Continue to Recording</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
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
    color: '#6366f1',
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