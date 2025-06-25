import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { saveRecording } from '../database/database';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function CustomTextScreen({ navigation }) {
  const { t } = useLanguage();
  const { user, anonymousUser } = useAuth();
  const [customText, setCustomText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('french');

  // Recording states
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  // Success message states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successFadeAnim] = useState(new Animated.Value(0));
  
  // Animations
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));
  const [playbackSlideAnim] = useState(new Animated.Value(0));

  // References for animations to allow stopping
  const pulseAnimationRef = useRef(null);
  const waveAnimationRef = useRef(null);

  const scrollViewRef = useRef(null);

  const languages = [
    { key: 'french', label: 'French', placeholder: 'Entrez votre texte français ici...' },
    { key: 'ewe', label: 'Ewe', placeholder: 'Ŋlɔ wò Ewe nyawo ɖe afi sia...' }
  ];

  // Cleanup function for recording
  useEffect(() => {
    let recordingRef = recording;
    
    return () => {
      if (recordingRef) {
        console.log('Cleaning up recording on component unmount...');
        recordingRef.getStatusAsync()
          .then((status) => {
            if (status.canRecord || status.isRecording) {
              return recordingRef.stopAndUnloadAsync();
            } else {
              console.log('Recording already stopped, skipping cleanup');
            }
          })
          .catch(error => {
            if (!error.message.includes('already been unloaded')) {
              console.error('Error cleaning up recording:', error);
            }
          });
      }
    };
  }, [recording]);

  // Cleanup function for sound
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Prevent navigation if recording is in progress
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isRecording && recording) {
        e.preventDefault();

        Alert.alert(
          t('recRecordingInProgress') || 'Recording in Progress',
          t('recRecordingInProgressDesc') || 'You are currently recording. Would you like to stop the recording and leave?',
          [
            { text: t('cancel') || 'Cancel', style: 'cancel', onPress: () => {} },
            {
              text: t('recStopAndLeave') || 'Stop and Leave',
              style: 'destructive',
              onPress: async () => {
                try {
                  await stopRecording();
                } catch (error) {
                  console.error('Error stopping recording:', error);
                } finally {
                  navigation.dispatch(e.data.action);
                }
              },
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation, isRecording, recording]);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for recording button
      pulseAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimationRef.current.start();

      // Wave animation
      waveAnimationRef.current = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      waveAnimationRef.current.start();
    } else {
      // Stop animations and reset values
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
        pulseAnimationRef.current = null;
      }
      if (waveAnimationRef.current) {
        waveAnimationRef.current.stop();
        waveAnimationRef.current = null;
      }
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }

    // Cleanup on unmount
    return () => {
      if (pulseAnimationRef.current) pulseAnimationRef.current.stop();
      if (waveAnimationRef.current) waveAnimationRef.current.stop();
    };
  }, [isRecording]);

  // Auto-scroll and animate when playback container appears
  useEffect(() => {
    if (recordingUri) {
      setTimeout(() => {
        Animated.spring(playbackSlideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      playbackSlideAnim.setValue(0);
    }
  }, [recordingUri]);

  const startRecording = async () => {
    if (customText.trim().length < 3) {
      Alert.alert(
        t('error') || 'Error',
        t('wrMinLengthError') || `Please enter at least 3 characters of ${selectedLanguage === 'french' ? 'French' : 'Ewe'} text before recording.`
      );
      return;
    }

    try {
      console.log('Requesting permissions...');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert(t('error') || 'Error', t('recStartError') || 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    
    if (!recording) {
      console.log('No recording to stop');
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(false);
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      setRecordingUri(uri);
      console.log('Recording stopped and stored at', uri);
      
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecording(null);
      Alert.alert(t('error') || 'Error', t('recStopError') || 'Failed to stop recording');
    }
  };

  const playSound = async () => {
    if (!recordingUri) return;

    try {
      setIsLoadingAudio(true);
      console.log('Loading Sound');
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: false }
      );
      
      setSound(sound);
      setIsLoadingAudio(false);
      setIsPlaying(true);

      console.log('Playing Sound');
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis || 0);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert(t('error') || 'Error', t('recPlayError') || 'Failed to play recording');
      setIsPlaying(false);
      setIsLoadingAudio(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const clearRecording = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setRecordingUri(null);
    setDuration(0);
    setPosition(0);
    setIsPlaying(false);
  };

  const saveRecordingToDatabase = async () => {
    if (!recordingUri) {
      Alert.alert(t('error') || 'Error', t('recNoRecordingFound') || 'No recording found');
      return;
    }

    try {
      await saveRecording(customText.trim(), recordingUri, true, selectedLanguage, user, anonymousUser);
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Animate success message in
      Animated.timing(successFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-refresh after 2 seconds
      setTimeout(() => {
        // Animate success message out
        Animated.timing(successFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Reset everything
          setShowSuccessMessage(false);
          clearRecording();
          setCustomText('');
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          // Optional: Comment out or change navigation to stay on CustomText
          // navigation.navigate('SuggestedText');
        });
      }, 2000);

    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert(t('error') || 'Error', t('recSaveError') || 'Failed to save recording');
    }
  };

  const clearText = () => {
    setCustomText('');
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  const getLanguageDisplayName = () => {
    return selectedLanguage === 'french' ? t('french') || 'French' : 'Ewe';
  };

  const getInstructionText = () => {
    if (selectedLanguage === 'french') {
      return t('recInstructionsFrench') || 'Read the French text clearly into the microphone';
    } else {
      return t('recInstructionsEwe') || 'Read the Ewe text clearly into the microphone';
    }
  };

  const currentLanguage = languages.find(lang => lang.key === selectedLanguage);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#006A4E', '#006A4E']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Ionicons name="create" size={50} color="#FFCE00" />
                <Text style={styles.title}>{t('wrTitle') || 'Write & Record'}</Text>
                <Text style={styles.subtitle}>
                  {t('wrAppSubtitle') || 'Enter your text and record your pronunciation'}
                </Text>
              </View>

              {/* <View style={styles.languageTabsContainer}>
                {languages.map(lang => (
                  <TouchableOpacity
                    key={lang.key}
                    style={[
                      styles.languageTab,
                      selectedLanguage === lang.key && styles.selectedLanguageTab
                    ]}
                    onPress={() => setSelectedLanguage(lang.key)}
                    accessibilityLabel={t(lang.key) || lang.label}
                    accessibilityHint={t(`select${lang.label}Language`) || `Select ${lang.label} language for text input`}
                  >
                    <Text style={[
                      styles.languageTabText,
                      selectedLanguage === lang.key && styles.selectedLanguageTabText
                    ]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View> */}

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    {t('wrBoxTitle') || `${getLanguageDisplayName()} Text`}
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
                    accessibilityLabel={t('textInput') || 'Text input for recording'}
                    accessibilityHint={t('textInputHint') || 'Enter your text to record'}
                  />
                  <View style={styles.inputFooter}>
                    <Text style={styles.characterCount}>
                      {customText.length}/500
                    </Text>
                    {customText.length > 0 && (
                      <TouchableOpacity 
                        onPress={clearText} 
                        style={styles.clearBtn}
                        accessibilityLabel={t('clearText') || 'Clear text'}
                        accessibilityHint={t('clearTextHint') || 'Remove all text from the input field'}
                      >
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Recording Section - Only show if text is entered */}
              {customText.trim().length >= 3 && (
                <View style={styles.recordingSection}>
                  <View style={styles.recordingContainer}>
                    {/* Wave animation */}
                    {isRecording && (
                      <View style={styles.waveContainer}>
                        <Animated.View
                          style={[
                            styles.wave,
                            {
                              opacity: waveAnim,
                              transform: [
                                {
                                  scale: waveAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 2],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                        <Animated.View
                          style={[
                            styles.wave,
                            styles.wave2,
                            {
                              opacity: waveAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.7, 0],
                              }),
                              transform: [
                                {
                                  scale: waveAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.5],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                      </View>
                    )}

                    <Animated.View
                      style={[
                        styles.recordButtonContainer,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.recordButton,
                          isRecording && styles.recordingButton,
                        ]}
                        onPress={isRecording ? stopRecording : startRecording}
                        accessibilityLabel={isRecording ? (t('stopRecording') || 'Stop recording') : (t('startRecording') || 'Start recording')}
                        accessibilityHint={isRecording ? (t('stopRecordingHint') || 'Stop the current recording') : (t('startRecordingHint') || 'Begin recording your text')}
                      >
                        <Ionicons
                          name={isRecording ? 'stop' : 'mic'}
                          size={40}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </Animated.View>

                    <Text style={styles.recordingStatus}>
                      {isRecording 
                        ? (t('recStatusRecording') || 'Recording...')
                        : (t('recTapToStart') || 'Tap to start recording')}
                      {!isRecording && (
                        <Text style={styles.eweTextBold}>
                          {' '}{t('recInEwe') || `in ${getLanguageDisplayName()}`}
                        </Text>
                      )}
                    </Text>
                  </View>

                  {/* Playback Section */}
                  {recordingUri && (
                    <Animated.View 
                      style={[
                        styles.playbackContainer,
                        {
                          transform: [
                            {
                              translateY: playbackSlideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                              }),
                            },
                          ],
                          opacity: playbackSlideAnim,
                        }
                      ]}
                    >
                      <View style={styles.playbackHeader}>
                        <Text style={styles.playbackTitle}>
                          {t('recYourRecording') || `Your ${getLanguageDisplayName()} Recording`}
                        </Text>
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={() => {
                            Alert.alert(
                              t('recDiscardTitle') || 'Discard Recording',
                              t('recDiscardMessage') || 'Are you sure you want to discard this recording?',
                              [
                                { text: t('cancel') || 'Cancel', style: 'cancel' },
                                {
                                  text: t('recYesDiscard') || 'Yes, Discard',
                                  style: 'destructive',
                                  onPress: clearRecording,
                                },
                              ]
                            );
                          }}
                          accessibilityLabel={t('discardRecording') || 'Discard recording'}
                          accessibilityHint={t('discardRecordingHint') || 'Remove the current recording'}
                        >
                          <Ionicons name="close" size={20} color="#6b7280" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.playbackTime}>
                        {t('recDuration') || 'Duration'}: {formatTime(duration)} • {t('recPosition') || 'Position'}: {formatTime(position)}
                      </Text>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progressPercentage}%` },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={styles.playbackControls}>
                        <TouchableOpacity
                          style={styles.playButton}
                          onPress={isPlaying ? stopSound : playSound}
                          disabled={isLoadingAudio}
                          accessibilityLabel={isPlaying ? (t('pausePlayback') || 'Pause playback') : (t('playRecording') || 'Play recording')}
                          accessibilityHint={isPlaying ? (t('pausePlaybackHint') || 'Pause the current recording playback') : (t('playRecordingHint') || 'Play the recorded audio')}
                        >
                          {isLoadingAudio ? (
                            <ActivityIndicator size="small" color="#6366f1" />
                          ) : (
                            <Ionicons
                              name={isPlaying ? 'pause' : 'play'}
                              size={24}
                              color="#6366f1"
                            />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={saveRecordingToDatabase}
                          accessibilityLabel={t('saveRecording') || 'Save recording'}
                          accessibilityHint={t('saveRecordingHint') || 'Save the current recording to your collection'}
                        >
                          <LinearGradient
                            colors={['#10b981', '#059669']}
                            style={styles.saveButtonGradient}
                          >
                            <Ionicons name="save" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>
                              {t('recSaveRecording') || 'Save Recording'}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  )}

                  {/* Success Message */}
                  {showSuccessMessage && (
                    <Animated.View 
                      style={[
                        styles.successMessage,
                        {
                          opacity: successFadeAnim,
                          transform: [
                            {
                              translateY: successFadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                              }),
                            },
                          ],
                        }
                      ]}
                    >
                      <View style={styles.successContent}>
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                        <Text style={styles.successText}>
                          {t('recSaveSuccess') || 'Recording saved successfully!'}
                        </Text>
                      </View>
                    </Animated.View>
                  )}
                </View>
              )}

              <View style={styles.bottomPadding} />
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  languageTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
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
    marginVertical: 20,
    marginTop: 15,
  },
  inputWrapper: {
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
  eweTextBold: {
    fontWeight: '800',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    position: 'relative',
  },
  waveContainer: {
    position: 'absolute',
    top: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
  },
  wave: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: 0,
    left: 0,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  wave2: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recordButtonContainer: {
    zIndex: 10,
    marginTop: 30,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordingButton: {
    backgroundColor: '#dc2626',
  },
  recordingStatus: {
    fontSize: 16,
    color: '#fff',
    marginTop: 15,
    fontWeight: '500',
  },
  playbackContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  playbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  playbackTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  successMessage: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  bottomPadding: {
    height: 60,
  },
});