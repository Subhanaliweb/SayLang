import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SUGGESTED_TEXTS = [
  { id: 1, text: "Bonjour, comment allez-vous?", category: "Greetings" },
  { id: 2, text: "Je m'appelle Marie et j'habite à Paris.", category: "Introduction" },
  { id: 3, text: "Quel temps fait-il aujourd'hui?", category: "Weather" },
  { id: 4, text: "J'aimerais commander un café, s'il vous plaît.", category: "Restaurant" },
  { id: 5, text: "Où se trouve la gare la plus proche?", category: "Directions" },
  { id: 6, text: "Je suis désolé, je ne comprends pas.", category: "Apology" },
  { id: 7, text: "Pouvez-vous m'aider, s'il vous plaît?", category: "Help" },
  { id: 8, text: "Combien ça coûte?", category: "Shopping" },
  { id: 9, text: "Je voudrais réserver une table pour deux personnes.", category: "Restaurant" },
  { id: 10, text: "À quelle heure ouvre le magasin?", category: "Shopping" },
  { id: 11, text: "J'ai perdu mon passeport.", category: "Emergency" },
  { id: 12, text: "Pouvez-vous répéter, s'il vous plaît?", category: "Communication" },
  { id: 13, text: "Je ne parle pas très bien français.", category: "Language" },
  { id: 14, text: "Où puis-je acheter des souvenirs?", category: "Shopping" },
  { id: 15, text: "Le repas était délicieux, merci!", category: "Restaurant" },
  { id: 16, text: "J'ai besoin d'un médecin.", category: "Emergency" },
  { id: 17, text: "Quelle est votre spécialité?", category: "Restaurant" },
  { id: 18, text: "Je cherche un hôtel pas cher.", category: "Accommodation" },
  { id: 19, text: "À bientôt, au revoir!", category: "Farewell" },
  { id: 20, text: "Excusez-moi, où sont les toilettes?", category: "Basic Needs" },
];

export default function SuggestedTextScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(SUGGESTED_TEXTS.map(item => item.category))];

  const filteredTexts = SUGGESTED_TEXTS.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTextSelect = (text) => {
    navigation.navigate('Recording', {
      frenchText: text,
      isCustom: false,
    });
  };

  const renderTextItem = ({ item }) => (
    <TouchableOpacity
      style={styles.textItem}
      onPress={() => handleTextSelect(item.text)}
    >
      <View style={styles.textContent}>
        <Text style={styles.categoryBadge}>{item.category}</Text>
        <Text style={styles.frenchText}>{item.text}</Text>
        <View style={styles.actionRow}>
          <Ionicons name="mic-outline" size={20} color="#6366f1" />
          <Text style={styles.actionText}>Tap to record</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.selectedCategoryButtonText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="list" size={50} color="#fff" />
            <Text style={styles.title}>Suggested Texts</Text>
            <Text style={styles.subtitle}>
              Choose a French sentence to record
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search French texts..."
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              renderItem={({ item }) => renderCategoryButton(item)}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          <View style={styles.listContainer}>
            <FlatList
              data={filteredTexts}
              renderItem={renderTextItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.textsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={50} color="#9ca3af" />
                  <Text style={styles.emptyText}>No texts found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search or category filter</Text>
                </View>
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
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesList: {
    paddingHorizontal: 5,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  selectedCategoryButton: {
    backgroundColor: '#fff',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#6366f1',
  },
  listContainer: {
    flex: 1,
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
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
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
});