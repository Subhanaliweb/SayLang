import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { getAllRecordings, deleteRecording } from '../database/database';

export default function HistoryScreen() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);

  const loadRecordings = async () => {
    try {
      const data = await getAllRecordings();
      setRecordings(data);
    } catch (error) {
      console.error('Error loading recordings:', error);
      Alert.alert('Error', 'Failed to load recordings.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecordings();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadRecordings();
      
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [])
  );

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playRecording = async (uri, id) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      if (playingId === id) {
        setPlayingId(null);
        return;
      }

      console.log('Loading Sound');
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingId(id);

      console.log('Playing Sound');
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Error', 'Failed to play recording.');
      setPlayingId(null);
    }
  };

  const handleDeleteRecording = (id, frenchText) => {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete this recording?\n\n"${frenchText}"`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(id);
              await loadRecordings();
              if (playingId === id) {
                setPlayingId(null);
                if (sound) {
                  await sound.unloadAsync();
                }
              }
            } catch (error) {
              console.error('Error deleting recording:', error);
              Alert.alert('Error', 'Failed to delete recording.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRecordingItem = ({ item }) => (
    <View style={styles.recordingItem}>
      <View style={styles.recordingHeader}>
        <View style={styles.recordingInfo}>
          <View style={styles.badgeContainer}>
            <Text style={[
              styles.typeBadge,
              item.is_custom ? styles.customBadge : styles.suggestedBadge
            ]}>
              {item.is_custom ? 'Custom' : 'Suggested'}
            </Text>
            <Text style={styles.dateBadge}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecording(item.id, item.french_text)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.frenchText}>{item.french_text}</Text>

      <View style={styles.recordingActions}>
        <TouchableOpacity
          style={[
            styles.playButton,
            playingId === item.id && styles.playingButton
          ]}
          onPress={() => playRecording(item.audio_uri, item.id)}
        >
          <Ionicons
            name={playingId === item.id ? 'pause' : 'play'}
            size={20}
            color={playingId === item.id ? '#fff' : '#6366f1'}
          />
          <Text style={[
            styles.playButtonText,
            playingId === item.id && styles.playingButtonText
          ]}>
            {playingId === item.id ? 'Playing...' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="mic-off-outline" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No Recordings Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start recording French sentences to see them here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{recordings.length}</Text>
        <Text style={styles.statLabel}>Total Recordings</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {recordings.filter(r => r.is_custom).length}
        </Text>
        <Text style={styles.statLabel}>Custom Texts</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {recordings.filter(r => !r.is_custom).length}
        </Text>
        <Text style={styles.statLabel}>Suggested Texts</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={50} color="#fff" />
            <Text style={styles.loadingText}>Loading recordings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="time" size={50} color="#fff" />
            <Text style={styles.title}>Recording History</Text>
            <Text style={styles.subtitle}>
              Your French audio collection
            </Text>
          </View>

          {recordings.length > 0 && renderHeader()}

          <View style={styles.listContainer}>
            <FlatList
              data={recordings}
              renderItem={renderRecordingItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.recordingsList,
                recordings.length === 0 && styles.emptyList
              ]}
              ListEmptyComponent={renderEmptyList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#6366f1']}
                  tintColor="#fff"
                />
              }
            />
          </View>
        </View>
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
    flex: 1,
    paddingHorizontal: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 15,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#e2e8f0',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  listContainer: {
    flex: 1,
  },
  recordingsList: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  recordingItem: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  customBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  suggestedBadge: {
    backgroundColor: '#e0e7ff',
    color: '#6366f1',
  },
  dateBadge: {
    fontSize: 11,
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deleteButton: {
    padding: 8,
  },
  frenchText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 12,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  playingButton: {
    backgroundColor: '#6366f1',
  },
  playButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  playingButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
});