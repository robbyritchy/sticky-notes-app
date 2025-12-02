// src/services/databaseAdapter.js
// Adapter to provide async database interface while maintaining backward compatibility

import { databaseService } from "./databaseService.js";

// Cache for synchronous access (populated on init)
let notesCache = [];
let categoriesCache = [];
let isInitialized = false;

// Initialize cache from database
async function initializeCache() {
  if (isInitialized) return;

  try {
    const [notes, categories] = await Promise.all([
      databaseService.getNotes(),
      databaseService.getCategories()
    ]);

    notesCache = notes || [];
    categoriesCache = categories || [];
    isInitialized = true;

    console.log('Database cache initialized');
  } catch (error) {
    console.error('Failed to initialize database cache:', error);
    // Fallback to localStorage
    notesCache = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
    categoriesCache = JSON.parse(localStorage.getItem("stickynotes-categories") || "[]");
  }
}

// Synchronous getters (for backward compatibility)
export function getNotesSync() {
  if (!isInitialized) {
    // Initialize synchronously if possible
    initializeCache();
  }
  return [...notesCache];
}

export function getCategoriesSync() {
  if (!isInitialized) {
    initializeCache();
  }
  return [...categoriesCache];
}

// Asynchronous getters
export async function getNotes() {
  await initializeCache();
  return [...notesCache];
}

export async function getCategories() {
  await initializeCache();
  return [...categoriesCache];
}

// Asynchronous setters
export async function saveNotes(notes) {
  try {
    // Update cache
    notesCache = [...notes];

    // Save to database
    const existingNotes = await databaseService.getNotes();
    for (const note of existingNotes) {
      await databaseService.deleteNote(note.id);
    }
    for (const note of notes) {
      await databaseService.saveNote(note);
    }

    // Also save to localStorage as backup
    localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
    // Fallback to localStorage
    localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
  }
}

export async function saveCategories(categories) {
  try {
    // Update cache
    categoriesCache = [...categories];

    // Save to database
    const existingCategories = await databaseService.getCategories();
    for (const category of existingCategories) {
      await databaseService.deleteCategory(category.id);
    }
    for (const category of categories) {
      await databaseService.saveCategory(category);
    }

    // Also save to localStorage as backup
    localStorage.setItem("stickynotes-categories", JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
    // Fallback to localStorage
    localStorage.setItem("stickynotes-categories", JSON.stringify(categories));
  }
}

// Version history operations
export async function saveVersion(version) {
  try {
    await databaseService.saveVersion(version);
  } catch (error) {
    console.error('Error saving version:', error);
  }
}

export async function getVersionsForNote(noteId) {
  try {
    return await databaseService.getVersionsForNote(noteId);
  } catch (error) {
    console.error('Error getting versions:', error);
    return [];
  }
}

// Share link operations
export async function saveShareLink(shareData) {
  try {
    await databaseService.saveShareLink(shareData);
  } catch (error) {
    console.error('Error saving share link:', error);
  }
}

export async function getShareLink(token) {
  try {
    return await databaseService.getShareLink(token);
  } catch (error) {
    console.error('Error getting share link:', error);
    return null;
  }
}

export async function getShareLinksForNote(noteId) {
  try {
    return await databaseService.getShareLinksForNote(noteId);
  } catch (error) {
    console.error('Error getting share links:', error);
    return [];
  }
}

export async function deleteShareLink(token) {
  try {
    await databaseService.deleteShareLink(token);
  } catch (error) {
    console.error('Error deleting share link:', error);
  }
}

// Analytics operations
export async function saveAnalyticsData(data) {
  try {
    await databaseService.saveAnalyticsData(data);
  } catch (error) {
    console.error('Error saving analytics:', error);
  }
}

export async function getAnalyticsData() {
  try {
    return await databaseService.getAnalyticsData();
  } catch (error) {
    console.error('Error getting analytics:', error);
    return [];
  }
}

// Utility functions
export async function clearAllData() {
  try {
    await databaseService.clearAllData();
    notesCache = [];
    categoriesCache = [];
    localStorage.clear();
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    localStorage.clear();
  }
}

export async function getDatabaseStats() {
  try {
    return await databaseService.getStats();
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {};
  }
}

// Initialize on module load (non-blocking)
setTimeout(() => {
  initializeCache().catch(error => {
    console.error('Failed to initialize database adapter, using localStorage:', error);
    // Ensure we have fallback data
    notesCache = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
    categoriesCache = JSON.parse(localStorage.getItem("stickynotes-categories") || "[]");
    isInitialized = true;
  });
}, 0);
