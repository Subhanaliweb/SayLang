import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { saveRecording } from '../database/database';
import { markTextAsCompleted } from '../database/localDatabase';

export default function RecordingScreen({ route, navigation }) {
  // Updated to use 'text' instead of 'frenchText' and added language parameter
  const { text, isCustom, language = 'french' } = route.params;
  
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));

  // Cleanup function for recording
useEffect(() => {
  let recordingRef = recording;
  
  return () => {
    if (recordingRef) {
      console.log('Cleaning up recording on component unmount...');
      recordingRef.getStatusAsync()
        .then((status) => {
          // Only attempt to stop and unload if the recording is still active
          if (status.canRecord || status.isRecording) {
            return recordingRef.stopAndUnloadAsync();
          } else {
            console.log('Recording already stopped, skipping cleanup');
          }
        })
        .catch(error => {
          // Ignore errors for already unloaded recordings
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

      // Wave animation
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

  // Add navigation listener to handle back button/navigation changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isRecording && recording) {
        // Prevent default behavior of leaving the screen
        e.preventDefault();

        Alert.alert(
          'Recording in Progress',
          'You have an active recording. Do you want to stop it and leave?',
          [
            { text: "Don't leave", style: 'cancel', onPress: () => {} },
            {
              text: 'Stop & Leave',
              style: 'destructive',
              onPress: async () => {
                try {
                  await stopRecording();
                } catch (error) {
                  console.error('Error stopping recording:', error);
                } finally {
                  // Navigate away after stopping
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
      Alert.alert('Error', 'Failed to start recording. Please try again.');
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
      
      // Clear the recording reference
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecording(null);
      Alert.alert('Error', 'Error stopping recording. Please try again.');
    }
  };

  const playSound = async () => {
    if (!recordingUri) return;

    try {
      console.log('Loading Sound');
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(sound);
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
      Alert.alert('Error', 'Failed to play recording.');
      setIsPlaying(false);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const saveRecordingToDatabase = async () => {
    if (!recordingUri) {
      Alert.alert('Error', 'No recording found. Please record audio first.');
      return;
    }

    try {
      // Updated to use the new saveRecording function signature
      // which handles cloud storage upload internally
      await saveRecording(text, recordingUri, isCustom, language);
      const { textId } = route.params; // You'll need to pass this
      await markTextAsCompleted(textId, language);
      Alert.alert(
        'Success',
        'Recording saved successfully to cloud storage!',
        [
          {
            text: 'Record Another',
            onPress: () => {
              setRecordingUri(null);
              setSound(null);
              setDuration(0);
              setPosition(0);
            },
          },
          {
            text: 'Go Home',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving recording:', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  // Dynamic content based on language
  const getLanguageDisplayName = () => {
    return language === 'french' ? 'French' : 'Ewe';
  };

  const getInstructionText = () => {
    if (language === 'french') {
      return 'Read the French text aloud and translate it to Ewe language';
    } else {
      return 'Read the Ewe text aloud in Ewe language';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#006A4E', '#FFCE00']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons name="mic" size={50} color="#FFCE00" />
            <Text style={styles.title}>Record Audio</Text>
            <Text style={styles.subtitle}>
              {getInstructionText()}
            </Text>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textLabel}>{getLanguageDisplayName()} Text:</Text>
              <Text style={styles.contentText}>{text}</Text>
            </View>
          </View>

          {/* Important Notice */}
          <View style={styles.noticeContainer}>
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle" size={20} color="#f59e0b" />
              <Text style={styles.noticeText}>
                <Text style={styles.noticeTextBold}>Important:</Text> Your audio recording must be spoken in Ewe language only.
              </Text>
            </View>
          </View>

          <View style={styles.recordingContainer}>
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
              {isRecording ? 'Recording in Ewe...' : 'Tap to start recording'}
              <Text style={styles.eweTextBold}> {isRecording ? '' : 'in Ewe'}</Text>
            </Text>
          </View>

          {recordingUri && (
            <View style={styles.playbackContainer}>
              <View style={styles.playbackHeader}>
                <Text style={styles.playbackTitle}>Your Ewe Recording</Text>
                <Text style={styles.playbackTime}>
                  {formatTime(position)} / {formatTime(duration)}
                </Text>
              </View>

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
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#6366f1"
                  />
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
                    <Text style={styles.saveButtonText}>Save Recording</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    paddingVertical: 40,
    position: 'relative',
  },
  waveContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  wave2: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recordButtonContainer: {
    zIndex: 10,
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
  playbackContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  playbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  playbackTime: {
    fontSize: 14,
    color: '#6b7280',
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
});