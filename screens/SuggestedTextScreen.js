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

// Import your JSON files
import frenchTexts from '../data/french-texts.json';
import eweTexts from '../data/ewe-texts.json';

export default function SuggestedTextScreen({ navigation }) {
  const { t } = useLanguage();
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

  const languages = ['french', 'ewe'];
  const ITEMS_PER_PAGE = 20;

  // Initialize database first
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

  // Load completed texts only after database is initialized
  useEffect(() => {
    const loadCompletedTexts = async () => {
      if (!databaseInitialized) return;
      
      try {
        const completed = await getCompletedTexts(selectedLanguage);
        setCompletedTextIds(completed);
      } catch (error) {
        console.error('Error loading completed texts:', error);
        // If there's still an error, set empty array to prevent crashes
        setCompletedTextIds([]);
      }
    };

    loadCompletedTexts();
  }, [databaseInitialized, selectedLanguage]);

  // Initialize audio permissions and setup
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        console.log('Initializing audio permissions...');
        
        // Request audio permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Audio permission not granted');
          return;
        }

        // Set audio mode for playback
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load texts based on selected language
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
        setCurrentPage(1); // Reset to first page when changing language
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

  // Get available voices
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
    
    // Only get voices after audio is initialized
    if (audioInitialized) {
      getVoices();
    }

    // Cleanup: stop any ongoing speech when component unmounts
    return () => {
      Speech.stop();
    };
  }, [audioInitialized]);

  // Filter texts based on search query
  const filteredTexts = useMemo(() => {
    let texts = allTexts.filter(item => !completedTextIds.includes(item.id));
    
    if (!debouncedSearchQuery.trim()) {
      return texts;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    return texts.filter(item => 
      item.text.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [allTexts, debouncedSearchQuery, completedTextIds]);

  // Paginate filtered texts
  const { paginatedTexts, totalPages, hasMore } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = filteredTexts.slice(0, endIndex); // Show cumulative results
    
    return {
      paginatedTexts: paginated,
      totalPages: Math.ceil(filteredTexts.length / ITEMS_PER_PAGE),
      hasMore: endIndex < filteredTexts.length
    };
  }, [filteredTexts, currentPage, ITEMS_PER_PAGE]);

  const handleTextSelect = useCallback((textItem) => {  // Change parameter to full item
    Speech.stop();
    setSpeakingId(null);
    
    navigation.navigate('Recording', {
      text: textItem.text,
      textId: textItem.id,  // Add this line
      isCustom: false,
      language: selectedLanguage,
    });
  }, [navigation, selectedLanguage]);

  const handleSpeakText = useCallback(async (item) => {
    try {
      // Check if audio is initialized
      if (!audioInitialized) {
        Alert.alert('Error', 'Audio not initialized. Please try again.');
        return;
      }

      // If already speaking this text, stop it
      if (speakingId === item.id) {
        Speech.stop();
        setSpeakingId(null);
        return;
      }

      // Stop any ongoing speech
      Speech.stop();
      setSpeakingId(item.id);

      console.log('Starting speech for item:', item.id);

      // Configure speech options based on language
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

      // Try to use appropriate voice for French
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
      // Stop any ongoing speech when changing language
      Speech.stop();
      setSpeakingId(null);
      setSelectedLanguage(language);
      setSearchQuery('');
      setDebouncedSearchQuery('');
    }
  }, [selectedLanguage]);

  // FIXED: Added 't' to dependency array
  const renderTextItem = useCallback(({ item }) => (
    <View style={styles.textItem}>
      <View style={styles.textContent}>
        {/* {item.category && (
          <Text style={styles.categoryBadge}>{item.category}</Text>
        )} */}
        <Text style={styles.frenchText}>{item.text}</Text>
        
        <View style={styles.actionRow}>
          {/* Only show Listen button for French language */}
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
              // When Listen button is not shown, make Record button take full width
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
  ), [speakingId, handleSpeakText, handleTextSelect, selectedLanguage, audioInitialized, t]); // FIXED: Added 't'

  // FIXED: Added 't' to dependency array
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
  ), [selectedLanguage, handleLanguageChange, t]); // FIXED: Added 't'

  // FIXED: Added 't' to dependency array
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
  }, [hasMore, paginatedTexts.length, filteredTexts.length, loadMoreTexts, t]); // FIXED: Added 't'

  // FIXED: Added 't' to dependency array
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
  ), [debouncedSearchQuery, t]); // FIXED: Added 't'

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#006A4E', '#FFCE00']}
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
            {/* Audio status indicator */}
            {!audioInitialized && (
              <Text style={styles.audioStatusText}>
                Initializing audio...
              </Text>
            )}
            {/* Database status indicator */}
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
            {loading && allTexts.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>{t('sgLoadingText')}</Text>
              </View>
            ) : (
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
                  length: 120, // Approximate item height
                  offset: 120 * index,
                  index,
                })}
              />
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
  categoryBadge: {
    fontSize: 12,
    color: '#6366f1',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
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