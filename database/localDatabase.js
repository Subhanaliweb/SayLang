import * as SQLite from 'expo-sqlite';

let databaseInstance = null;

const getDatabase = async () => {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync('gbe-gne.db');
  }
  return databaseInstance;
};

export const initLocalDatabase = async () => {
  try {
    const db = await getDatabase();
    
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS completed_texts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_id INTEGER NOT NULL,
        language TEXT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      []
    );
    
    console.log('Local database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing local database:', error);
    throw error;
  }
};

export const markTextAsCompleted = async (textId, language) => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO completed_texts (text_id, language) VALUES (?, ?);',
      [textId, language]
    );
    console.log('Text marked as completed successfully');
    return result;
  } catch (error) {
    console.error('Error marking text as completed:', error);
    throw error;
  }
};

export const getCompletedTexts = async (language) => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      'SELECT text_id FROM completed_texts WHERE language = ?;',
      [language]
    );
    return result.map(row => row.text_id);
  } catch (error) {
    console.error('Error getting completed texts:', error);
    throw error;
  }
};