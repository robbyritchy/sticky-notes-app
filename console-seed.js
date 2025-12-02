// console-seed.js - Quick database seeding for browser console
// Copy and paste this into the browser console to seed the database

// Sample data
const sampleCategories = [
  { id: 'work', name: 'Work' },
  { id: 'personal', name: 'Personal' },
  { id: 'ideas', name: 'Ideas' },
  { id: 'shopping', name: 'Shopping' }
];

const sampleNotes = [
  {
    id: 'quick-note-1',
    title: 'Welcome to Database Storage!',
    content: `This note demonstrates the new IndexedDB persistence feature.


Try refreshing the page - this note will still be here!`,
    category: 'personal',
    color: '#e8f5e8',
    shape: 'rectangle',
    top: 100,
    left: 100,
    width: 300,
    height: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'quick-note-2',
    title: 'Quick Start Guide',
    content: `Getting started with database persistence:

1. Click the 🗄️ database button to enable permanent storage
2. Your notes will automatically migrate and persist
3. Enjoy unlimited storage and version history!

Database features:
• Permanent storage across sessions
• Fast IndexedDB queries
• Unlimited note versions
• Automatic data migration`,
    category: 'ideas',
    color: '#e3f2fd',
    shape: 'rectangle',
    top: 350,
    left: 150,
    width: 320,
    height: 220,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Console seeding function
async function quickSeed() {
  console.log('🌱 Starting quick database seeding...');

  try {
    // Import database service dynamically
    const { databaseService } = await import('./src/services/databaseService.js');

    // Initialize
    await databaseService.init();
    console.log('✅ Database initialized');

    // Clear existing data
    await databaseService.clearAllData();
    console.log('🧹 Cleared existing data');

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

    console.log('🎉 Quick seeding completed!');
    console.log('🔄 Refresh the page to see the seeded notes');

    return {
      success: true,
      notes: sampleNotes.length,
      categories: sampleCategories.length
    };

  } catch (error) {
    console.error('❌ Quick seeding failed:', error);
    return { success: false, error: error.message };
  }
}

// Make function available globally
window.quickSeed = quickSeed;

// Auto-run instructions
console.log('🚀 Quick Database Seeder loaded!');
console.log('💡 Run: quickSeed() to populate database with sample data');
console.log('🔍 Run: await quickSeed() to see results');

// Uncomment to auto-run:
// quickSeed();
