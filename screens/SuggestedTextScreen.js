import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { initLocalDatabase, getCompletedTexts } from '../database/localDatabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import frenchTexts from '../data/french-texts.json';
import eweTexts from '../data/ewe-texts.json';

export default function SuggestedTextScreen({ navigation }) {
  const { t } = useLanguage();
  const { user, anonymousUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('french');
  const [speakingId, setSpeakingId] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allTexts, setAllTexts] = useState([]);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [completedTextIds, setCompletedTextIds] = useState([]);
  const [databaseInitialized, setDatabaseInitialized] = useState(false);
  const [isUpdatingList, setIsUpdatingList] = useState(false);

  const languages = ['french', 'ewe'];
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const initializeLocalDb = async () => {
      try {
        await initLocalDatabase();
        setDatabaseInitialized(true);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error initializing local database:', error);
      }
    };

    initializeLocalDb();
  }, []);

  useEffect(() => {
    const loadCompletedTexts = async () => {
      if (!databaseInitialized) return;
      
      try {
        // Show loading state when updating completed texts
        setIsUpdatingList(true);
        
        const completed = await getCompletedTexts(
          selectedLanguage,
          user?.id,
          anonymousUser?.id
        );
        
        // Small delay to prevent flicker
        setTimeout(() => {
          setCompletedTextIds(completed);
          setIsUpdatingList(false);
        }, 100);
        
      } catch (error) {
        console.error('Error loading completed texts:', error);
        setCompletedTextIds([]);
        setIsUpdatingList(false);
      }
    };

    loadCompletedTexts();
  }, [databaseInitialized, selectedLanguage, user, anonymousUser]);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        console.log('Initializing audio permissions...');
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Audio permission not granted');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        setAudioInitialized(true);
        console.log('Audio initialized successfully');
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initializeAudio();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadTexts = async () => {
      try {
        setLoading(true);
        let data;
        
        if (selectedLanguage === 'french') {
          data = frenchTexts;
        } else {
          data = eweTexts;
        }
        
        setAllTexts(data);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error loading texts:', error);
        Alert.alert('Error', 'Failed to load texts. Please try again.');
        setAllTexts([]);
      } finally {
        setLoading(false);
      }
    };

    loadTexts();
  }, [selectedLanguage]);

  useEffect(() => {
    const getVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        setAvailableVoices(voices);
        console.log('Available voices loaded:', voices.length);
      } catch (error) {
        console.log('Error getting voices:', error);
      }
    };
    
    if (audioInitialized) {
      getVoices();
    }

    return () => {
      Speech.stop();
    };
  }, [audioInitialized]);

  // Pre-filter texts to avoid glitch - moved up in the component
  const preFilteredTexts = useMemo(() => {
    return allTexts.filter(item => !completedTextIds.includes(item.id));
  }, [allTexts, completedTextIds]);

  const filteredTexts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return preFilteredTexts;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    return preFilteredTexts.filter(item => 
      item.text.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [preFilteredTexts, debouncedSearchQuery]);

  const { paginatedTexts, totalPages, hasMore } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = filteredTexts.slice(0, endIndex);
    
    return {
      paginatedTexts: paginated,
      totalPages: Math.ceil(filteredTexts.length / ITEMS_PER_PAGE),
      hasMore: endIndex < filteredTexts.length
    };
  }, [filteredTexts, currentPage]);

  const handleTextSelect = useCallback((textItem) => {
    Speech.stop();
    setSpeakingId(null);
    
    navigation.navigate('Recording', {
      text: textItem.text,
      textId: textItem.id,
      isCustom: false,
      language: selectedLanguage,
    });
  }, [navigation, selectedLanguage]);

  const handleSpeakText = useCallback(async (item) => {
    try {
      if (!audioInitialized) {
        Alert.alert('Error', 'Audio not initialized. Please try again.');
        return;
      }

      if (speakingId === item.id) {
        Speech.stop();
        setSpeakingId(null);
        return;
      }

      Speech.stop();
      setSpeakingId(item.id);

      console.log('Starting speech for item:', item.id);

      const options = {
        language: item.language === 'french' ? 'fr-FR' : 'en-US',
        pitch: 0.9,
        rate: 0.7,
        onStart: () => {
          console.log('Speech started');
        },
        onDone: () => {
          console.log('Speech finished');
          setSpeakingId(null);
        },
        onStopped: () => {
          console.log('Speech stopped');
          setSpeakingId(null);
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setSpeakingId(null);
          Alert.alert('Error', 'Unable to speak text. Please try again.');
        },
      };

      if (item.language === 'french' && availableVoices.length > 0) {
        const frenchVoiceOptions = availableVoices.filter(voice => 
          voice.language?.startsWith('fr') || 
          voice.language?.includes('French') ||
          voice.identifier?.includes('fr') ||
          voice.name?.toLowerCase().includes('french') ||
          voice.name?.toLowerCase().includes('marie') ||
          voice.name?.toLowerCase().includes('celine') ||
          voice.name?.toLowerCase().includes('thomas')
        );

        if (frenchVoiceOptions.length > 0) {
          const preferredVoice = frenchVoiceOptions.find(voice => 
            voice.name?.toLowerCase().includes('marie') || 
            voice.name?.toLowerCase().includes('celine')
          ) || frenchVoiceOptions[0];
          
          options.voice = preferredVoice.identifier;
          console.log('Using French voice:', preferredVoice.name);
        }
      }

      await Speech.speak(item.text, options);
    } catch (error) {
      console.error('Error speaking text:', error);
      setSpeakingId(null);
      Alert.alert('Error', 'Unable to speak text. Please try again.');
    }
  }, [speakingId, availableVoices, audioInitialized]);

  const loadMoreTexts = useCallback(() => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const handleLanguageChange = useCallback((language) => {
    if (language !== selectedLanguage) {
      Speech.stop();
      setSpeakingId(null);
      setSelectedLanguage(language);
      setSearchQuery('');
      setDebouncedSearchQuery('');
    }
  }, [selectedLanguage]);

  const renderTextItem = useCallback(({ item }) => (
    <View style={styles.textItem}>
      <View style={styles.textContent}>
        <Text style={styles.frenchText}>{item.text}</Text>
        <View style={styles.actionRow}>
          {selectedLanguage === 'french' && (
            <>
              <TouchableOpacity
                style={[
                  styles.miniButton,
                  styles.listenButton,
                  speakingId === item.id && styles.listenButtonActive,
                  !audioInitialized && styles.disabledButton
                ]}
                onPress={() => handleSpeakText(item)}
                disabled={!audioInitialized}
              >
                <Ionicons 
                  name={speakingId === item.id ? "stop" : "play"} 
                  size={16} 
                  color={
                    !audioInitialized ? "#9ca3af" :
                    speakingId === item.id ? "#D21034" : "#006A4E"
                  } 
                />
                <Text style={[
                  styles.miniButtonText,
                  { 
                    color: !audioInitialized ? "#9ca3af" :
                    speakingId === item.id ? "#D21034" : "#006A4E" 
                  }
                ]}>
                  {speakingId === item.id ? t('sgstop') : t('sglisten')}
                </Text>
              </TouchableOpacity>
              <View style={styles.buttonDivider} />
            </>
          )}
          <TouchableOpacity
            style={[
              styles.miniButton, 
              styles.recordButton,
              selectedLanguage !== 'french' && styles.recordButtonFullWidth
            ]}
            onPress={() => handleTextSelect(item)}
          >
            <Ionicons name="mic" size={16} color="#D21034" />
            <Text style={[styles.miniButtonText, { color: "#D21034" }]}>
              {t('sgRecord')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [speakingId, handleSpeakText, handleTextSelect, selectedLanguage, audioInitialized, t]);

  const renderLanguageTab = useCallback((language) => (
    <TouchableOpacity
      key={language}
      style={[
        styles.languageTab,
        selectedLanguage === language && styles.selectedLanguageTab
      ]}
      onPress={() => handleLanguageChange(language)}
    >
      <Text style={[
        styles.languageTabText,
        selectedLanguage === language && styles.selectedLanguageTabText
      ]}>
        {language === 'french' ? t('sgSelectedLanguage') : 'Ewe'}
      </Text>
    </TouchableOpacity>
  ), [selectedLanguage, handleLanguageChange, t]);

  const renderFooter = useCallback(() => {
    if (!hasMore) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Showing {paginatedTexts.length} of {filteredTexts.length} texts
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreTexts}>
        <Text style={styles.loadMoreText}>{t('sgLoadMore')}</Text>
        <Ionicons name="chevron-down" size={16} color="#006A4E" />
      </TouchableOpacity>
    );
  }, [hasMore, paginatedTexts.length, filteredTexts.length, loadMoreTexts, t]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={50} color="#D21034" />
      <Text style={styles.emptyText}>{t('sgNoTextFound')}</Text>
      <Text style={styles.emptySubtext}>
        {debouncedSearchQuery 
          ? t('sgSearchAdjust')
          : t('sgNoTextFound')
        }
      </Text>
    </View>
  ), [debouncedSearchQuery, t]);

  // Show loading state while updating list to prevent glitch
  const shouldShowLoading = loading || isUpdatingList || !databaseInitialized;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#006A4E', '#006A4E']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="list" size={50} color="#FFCE00" />
            <Text style={styles.title}>{t('sgTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('sgAppSubtitleBefore')} {selectedLanguage === 'french' ? t('sgSelectedLanguage') : 'Ewe'} {t('sgAppSubtitleAfter')}
            </Text>
            <Text style={styles.statsText}>
              {filteredTexts.length} {t('sgBeforeCount')} ({allTexts.length - completedTextIds.length} {t('sgAfterCount')})
            </Text>
            {!audioInitialized && (
              <Text style={styles.audioStatusText}>
                Initializing audio...
              </Text>
            )}
            {!databaseInitialized && (
              <Text style={styles.audioStatusText}>
                Setting up database...
              </Text>
            )}
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`${t('sgSearchPlaceholder')} ${selectedLanguage === 'french' ? t('sgSelectedLanguage') : 'Ewe'} ${t('sgSearchPlaceholderAfter')}`}
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.languageTabsContainer}>
            <FlatList
              data={languages}
              renderItem={({ item }) => renderLanguageTab(item)}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.languageTabsList}
            />
          </View>

          <View style={styles.listContainer}>
            {shouldShowLoading && allTexts.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>{t('sgLoadingText')}</Text>
              </View>
            ) : (
              <View style={[styles.listWrapper, isUpdatingList && styles.listUpdating]}>
                <FlatList
                  data={paginatedTexts}
                  renderItem={renderTextItem}
                  keyExtractor={(item) => `${item.language}-${item.id}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.textsList}
                  ListEmptyComponent={renderEmptyComponent}
                  ListFooterComponent={renderFooter}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                  initialNumToRender={10}
                  getItemLayout={(data, index) => ({
                    length: 120,
                    offset: 120 * index,
                    index,
                  })}
                />
              </View>
            )}
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
  statsText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 4,
  },
  audioStatusText: {
    fontSize: 12,
    color: '#fbbf24',
    marginTop: 4,
    fontStyle: 'italic',
  },
  searchContainer: {
    marginVertical: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  languageTabsContainer: {
    marginBottom: 15,
  },
  languageTabsList: {
    paddingHorizontal: 5,
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
  listContainer: {
    flex: 1,
  },
  listWrapper: {
    flex: 1,
  },
  listUpdating: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  textsList: {
    paddingBottom: 20,
  },
  textItem: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textContent: {
    padding: 16,
  },
  frenchText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  miniButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
  },
  listenButton: {
    flex: 1,
    marginRight: 8,
  },
  listenButtonActive: {
    backgroundColor: '#fef2f2',
  },
  disabledButton: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  recordButton: {
    flex: 1,
    marginLeft: 8,
  },
  recordButtonFullWidth: {
    marginLeft: 0,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 5,
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginVertical: 15,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  loadMoreText: {
    color: '#006A4E',
    fontSize: 16,
    fontWeight: '600',
  },
});