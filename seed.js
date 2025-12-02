// seed.js - Simple database seeding script
// Run this to populate the database with sample data

import { databaseService } from './src/services/databaseService.js';

// Sample data
const sampleCategories = [
  { id: 'work', name: 'Work' },
  { id: 'personal', name: 'Personal' },
  { id: 'ideas', name: 'Ideas' }
];

const sampleNotes = [
  {
    id: 'sample-1',
    title: 'Welcome to Database Storage!',
    content: 'This note demonstrates permanent storage. Refresh the page - it will still be here!',
    category: 'personal',
    color: '#e8f5e8',
    shape: 'rectangle',
    top: 100,
    left: 100,
    width: 300,
    height: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    title: 'Database Features',
    content: `✅ Permanent storage across sessions
✅ 1GB+ capacity (vs localStorage 5MB)
✅ Unlimited version history
✅ Fast indexed queries
✅ Automatic migration`,
    category: 'ideas',
    color: '#e3f2fd',
    shape: 'rectangle',
    top: 300,
    left: 150,
    width: 280,
    height: 180,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize database
    await databaseService.init();

    // Clear existing data
    await databaseService.clearAllData();

    // Add categories
    for (const category of sampleCategories) {
      await databaseService.saveCategory(category);
    }
    console.log(`📂 Added ${sampleCategories.length} categories`);

    // Add notes
    for (const note of sampleNotes) {
      await databaseService.saveNote(note);
    }
    console.log(`📝 Added ${sampleNotes.length} notes`);

    // Mark migration complete
    await databaseService.saveSetting('migrationCompleted', true);

    console.log('🎉 Database seeded successfully!');
    console.log('🔄 Refresh the page to see the sample notes');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}

// Export for module usage
export { seedDatabase };

// Auto-run when loaded directly
if (typeof window !== 'undefined') {
  window.seedDatabase = seedDatabase;
  console.log('🌱 Seed script loaded!');
  console.log('💡 Run: seedDatabase() to populate the database');
}
