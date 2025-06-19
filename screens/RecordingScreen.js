import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { saveRecording } from '../database/database';
import { markTextAsCompleted } from '../database/localDatabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function RecordingScreen({ route, navigation }) {
  const { text, isCustom, language = 'french', textId } = route.params;
  const { t } = useLanguage();
  
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));
  const [playbackSlideAnim] = useState(new Animated.Value(0));

  const scrollViewRef = useRef(null);

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

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for recording button
      Animated.loop(
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
      ).start();

      // Wave animation - fixed positioning
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
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

  // Navigation listener for back button
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isRecording && recording) {
        e.preventDefault();

        Alert.alert(
          t('recRecordingInProgress'),
          t('recRecordingInProgressDesc'),
          [
            { text: t('cancel'), style: 'cancel', onPress: () => {} },
            {
              text: t('recStopAndLeave'),
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

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert(t('error'), t('recStartError'));
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    
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
      Alert.alert(t('error'), t('recStopError'));
    }
  };

  const playSound = async () => {
    if (!recordingUri) return;

    try {
      setIsLoadingAudio(true);
      console.log('Loading Sound');
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: false } // Don't auto-play to avoid issues
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
      Alert.alert(t('error'), t('recPlayError'));
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

  // Function to clear current recording
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
      Alert.alert(t('error'), t('recNoRecordingFound'));
      return;
    }

    try {
      await saveRecording(text, recordingUri, isCustom, language);
      if (textId) {
        await markTextAsCompleted(textId, language);
      }
      
      Alert.alert(
        t('success'),
        t('recSaveSuccess'),
        [
          {
            text: t('recRecordAnother'),
            onPress: () => {
              clearRecording();
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            },
          },
          {
            text: t('recGoHome'),
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert(t('error'), t('recSaveError'));
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  const getLanguageDisplayName = () => {
    return language === 'french' ? t('french') : 'Ewe';
  };

  const getInstructionText = () => {
    if (language === 'french') {
      return t('recInstructionsFrench');
    } else {
      return t('recInstructionsEwe');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#006A4E', '#FFCE00']}
        style={styles.gradient}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons name="mic" size={50} color="#FFCE00" />
            <Text style={styles.title}>{t('recTitle')}</Text>
            <Text style={styles.subtitle}>
              {getInstructionText()}
            </Text>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textLabel}>{getLanguageDisplayName()} {t('recTextLabel')}:</Text>
              <Text style={styles.contentText}>{text}</Text>
            </View>
          </View>

          {/* Important Notice */}
          <View style={styles.noticeContainer}>
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle" size={20} color="#f59e0b" />
              <Text style={styles.noticeText}>
                <Text style={styles.noticeTextBold}>{t('recImportant')}:</Text> {t('recEweOnlyNotice')}
              </Text>
            </View>
          </View>

          <View style={styles.recordingContainer}>
            {/* Fixed wave animation positioning */}
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
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.recordingStatus}>
              {isRecording ? t('recStatusRecording') : t('recTapToStart')}
              <Text style={styles.eweTextBold}> {isRecording ? '' : t('recInEwe')}</Text>
            </Text>

          </View>          

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
                <Text style={styles.playbackTitle}>{t('recYourEweRecording')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    Alert.alert(
                      t('recDiscardTitle'),
                      t('recDiscardMessage'),
                      [
                        { text: t('cancel'), style: 'cancel' },
                        {
                          text: t('recYesDiscard'),
                          style: 'destructive',
                          onPress: clearRecording,
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.playbackTime}>
                {t('recDuration')}: {formatTime(duration)} • {t('recPosition')}: {formatTime(position)}
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
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.saveButtonGradient}
                  >
                    <Ionicons name="save" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>{t('recSaveRecording')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
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
  textContainer: {
    marginVertical: 20,
  },
  textBox: {
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
  textLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 18,
    color: '#1f2937',
    lineHeight: 28,
    marginBottom: 15,
  },
  noticeContainer: {
    marginBottom: 30,
  },
  noticeBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noticeText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  noticeTextBold: {
    fontWeight: '600',
  },
  eweTextBold: {
    fontWeight: '800',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 5,
    position: 'relative',
  },
  waveContainer: {
    position: 'absolute',
    top: 5, // Adjusted to align with recording button
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
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
    marginTop: 50, // Added margin to center properly with waves
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
    marginTop: 20,
    fontWeight: '500',
  },
  reRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  reRecordButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  bottomPadding: {
    height: 50,
  },
});