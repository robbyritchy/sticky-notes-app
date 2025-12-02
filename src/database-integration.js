// src/database-integration.js
// Optional database integration that can be loaded separately
// This allows the app to work without database dependencies

import { databaseService } from "./services/databaseService.js";
import { databaseAdapter } from "./services/databaseAdapter.js";

// Flag to track if database is enabled
window.databaseEnabled = false;

export async function enableDatabasePersistence() {
  try {
    console.log('Enabling database persistence...');

    // Initialize database
    await databaseService.init();
    console.log('Database initialized');

    // Migrate existing data if needed
    const migrationCompleted = await databaseService.getSetting('migrationCompleted').catch(() => null);
    if (!migrationCompleted) {
      console.log('Migrating localStorage data to database...');
      await databaseService.migrateFromLocalStorage();
      console.log('Migration completed');
    }

    // Mark database as enabled
    window.databaseEnabled = true;
    console.log('Database persistence enabled successfully!');

    // Show a notification to the user
    showDatabaseNotification();

    return true;
  } catch (error) {
    console.error('Failed to enable database persistence:', error);
    console.log('App will continue using localStorage');
    return false;
  }
}

function showDatabaseNotification() {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 300px;
  `;
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">🗄️ Database Enabled!</div>
    <div>Your notes are now permanently stored and will persist across browser sessions.</div>
    <button onclick="this.parentElement.remove()" style="background: none; border: 1px solid white; color: white; padding: 5px 10px; margin-top: 10px; cursor: pointer; border-radius: 3px;">OK</button>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

// Auto-enable database persistence when this script loads
// This is non-blocking and won't break the app if database fails
setTimeout(() => {
  enableDatabasePersistence();
}, 1000);

// Export for manual control
window.enableDatabasePersistence = enableDatabasePersistence;
