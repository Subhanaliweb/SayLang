import * as SQLite from 'expo-sqlite';

// Initialize the database asynchronously
export const initDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('french_audio.db');
    
    // Use runAsync for DDL commands instead of execAsync
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS recordings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        french_text TEXT NOT NULL,
        audio_uri TEXT NOT NULL,
        user_language TEXT DEFAULT 'ewe',
        is_custom BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      []
    );
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Helper function to get database instance
let databaseInstance = null;

const getDatabase = async () => {
  if (!databaseInstance) {
    databaseInstance = await initDatabase();
  }
  return databaseInstance;
};

export const saveRecording = async (frenchText, audioUri, isCustom = false) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO recordings (french_text, audio_uri, is_custom) VALUES (?, ?, ?)',
      [frenchText, audioUri, isCustom ? 1 : 0]
    );
    console.log('Recording saved successfully');
    return result;
  } catch (error) {
    console.log('Error saving recording:', error);
    throw error;
  }
};

export const getAllRecordings = async () => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      'SELECT * FROM recordings ORDER BY created_at DESC',
      []
    );
    return result;
  } catch (error) {
    console.log('Error fetching recordings:', error);
    throw error;
  }
};

export const deleteRecording = async (id) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'DELETE FROM recordings WHERE id = ?',
      [id]
    );
    console.log('Recording deleted successfully');
    return result;
  } catch (error) {
    console.log('Error deleting recording:', error);
    throw error;
  }
};