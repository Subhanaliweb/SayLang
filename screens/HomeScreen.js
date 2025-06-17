import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#006A4E', '#FFCE00']} // Green to Yellow gradient
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons name="mic" size={60} color="#FFCE00" />
            <Text style={styles.title}>Ewe Audio Collector</Text>
            <Text style={styles.subtitle}>
              Record your voice in Ewe for French sentences
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate('CustomText')}
            >
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.cardGradient}
              >
                <View style={styles.cardContent}>
                  <Ionicons name="create-outline" size={40} color="#FFCE00" />
                  <Text style={styles.cardTitle}>Write Custom Text</Text>
                  <Text style={styles.cardDescription}>
                    Write your own French sentence and record audio
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate('SuggestedText')}
            >
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.cardGradient}
              >
                <View style={styles.cardContent}>
                  <Ionicons name="list-outline" size={40} color="#FFCE00" />
                  <Text style={styles.cardTitle}>Suggested Texts</Text>
                  <Text style={styles.cardDescription}>
                    Choose from pre-written French sentences
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your recordings help improve AI language models
            </Text>
          </View>
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 20,
    marginVertical: 5,
  },
  optionCard: {
    marginHorizontal: 10,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006A4E',
    marginTop: 15,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#006A4E',
    textAlign: 'center',
    opacity: 0.8,
  },
});