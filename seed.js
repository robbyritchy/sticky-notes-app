// seed.js - Database seeding script for Sticky Notes app
// Run this in the browser console or import as a module to populate the database with sample data

import { databaseService } from './src/services/databaseService.js';

class DatabaseSeeder {
  constructor() {
    this.sampleData = {
      categories: [
        { id: 'work', name: 'Work' },
        { id: 'personal', name: 'Personal' },
        { id: 'ideas', name: 'Ideas' },
        { id: 'shopping', name: 'Shopping' },
        { id: 'reminders', name: 'Reminders' }
      ],
      notes: [
        {
          id: 'note-001',
          title: 'Project Meeting Notes',
          content: `Meeting with design team about the new dashboard UI.

Key points discussed:
• User feedback on current navigation
• Proposed changes to color scheme
• Timeline for implementation
• Resources needed

Action items:
- [ ] Create wireframes by Friday
- [ ] Schedule follow-up meeting
- [ ] Send updated requirements to developers

Next meeting: Tuesday 2 PM`,
          category: 'work',
          color: '#e3f2fd',
          shape: 'rectangle',
          top: 50,
          left: 100,
          width: 300,
          height: 250,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 'note-002',
          title: 'Grocery List',
          content: `Weekly groceries:

Produce:
• Apples (6)
• Bananas (1 bunch)
• Lettuce (2 heads)
• Tomatoes (4)
• Onions (3)
• Garlic (1 bulb)

Dairy:
• Milk (1 gallon)
• Cheese (cheddar block)
• Yogurt (Greek, 6 pack)
• Eggs (2 dozen)

Pantry:
• Bread (whole wheat)
• Rice (brown, 5 lbs)
• Pasta (spaghetti)
• Olive oil
• Coffee beans`,
          category: 'shopping',
          color: '#fff3e0',
          shape: 'rectangle',
          top: 150,
          left: 450,
          width: 280,
          height: 300,
          createdAt: '2024-01-12T08:15:00Z',
          updatedAt: '2024-01-14T19:45:00Z'
        },
        {
          id: 'note-003',
          title: 'App Ideas',
          content: `Cool app ideas to build:

1. Recipe sharing platform with AI ingredient suggestions
2. Habit tracker with social accountability
3. Local event discovery with AR directions
4. Language learning through news articles
5. Carbon footprint calculator for daily activities

Tech stack ideas:
• React + TypeScript + Node.js
• Flutter for mobile-first approach
• Python + FastAPI for ML features
• Firebase for real-time features

Remember to validate ideas with potential users first!`,
          category: 'ideas',
          color: '#f3e5f5',
          shape: 'rectangle',
          top: 300,
          left: 200,
          width: 320,
          height: 280,
          createdAt: '2024-01-08T16:20:00Z',
          updatedAt: '2024-01-13T11:10:00Z'
        },
        {
          id: 'note-004',
          title: 'Doctor Appointment',
          content: `Annual check-up with Dr. Smith

📅 Date: January 25, 2024
🕐 Time: 10:30 AM
🏥 Location: Medical Center Downtown
📍 Address: 123 Main St, Suite 400

Bring:
• Insurance card
• ID
• List of current medications
• Recent lab results

Questions to ask:
• Results from last blood work
• Vitamin D levels
• Any concerns about cholesterol

Don't forget to fast for 12 hours before blood tests!`,
          category: 'reminders',
          color: '#e8f5e8',
          shape: 'rectangle',
          top: 100,
          left: 600,
          width: 290,
          height: 220,
          createdAt: '2024-01-11T12:00:00Z',
          updatedAt: '2024-01-11T12:00:00Z',
          reminderDate: '2024-01-25T10:30:00Z'
        },
        {
          id: 'note-005',
          title: 'Weekend Plans',
          content: `Family weekend activities:

Saturday:
• Morning: Farmer's market at Union Square
• Afternoon: Visit to the aquarium
• Evening: Dinner at that new Italian restaurant

Sunday:
• Brunch with friends at 11 AM
• Movie night - check what's playing
• Grocery shopping for the week

Remember to:
• Charge camera battery
• Pack reusable shopping bags
• Check weather forecast
• Confirm restaurant reservations

Budget: $200 for weekend activities`,
          category: 'personal',
          color: '#fce4ec',
          shape: 'rectangle',
          top: 400,
          left: 50,
          width: 310,
          height: 240,
          createdAt: '2024-01-13T20:15:00Z',
          updatedAt: '2024-01-15T09:30:00Z'
        },
        {
          id: 'note-006',
          title: 'Code Review Checklist',
          content: `Before submitting code for review:

Functionality:
• [ ] All requirements implemented
• [ ] Edge cases handled
• [ ] Error conditions tested
• [ ] Performance considerations addressed

Code Quality:
• [ ] Consistent naming conventions
• [ ] Proper error handling
• [ ] Comments for complex logic
• [ ] No console.log statements

Testing:
• [ ] Unit tests written
• [ ] Integration tests pass
• [ ] Manual testing completed
• [ ] Cross-browser testing done

Documentation:
• [ ] README updated if needed
• [ ] API documentation current
• [ ] Breaking changes documented`,
          category: 'work',
          color: '#f3e5f5',
          shape: 'rectangle',
          top: 250,
          left: 550,
          width: 330,
          height: 260,
          createdAt: '2024-01-09T14:45:00Z',
          updatedAt: '2024-01-12T16:20:00Z'
        },
        {
          id: 'note-007',
          title: 'Book Recommendations',
          content: `Books to read this quarter:

Fiction:
• "The Midnight Library" by Matt Haig
• "Klara and the Sun" by Kazuo Ishiguro
• "The Vanishing Half" by Brit Bennett

Non-Fiction:
• "Atomic Habits" by James Clear
• "Thinking, Fast and Slow" by Daniel Kahneman
• "The Body Keeps the Score" by Bessel van der Kolk

Tech:
• "Clean Code" by Robert C. Martin
• "The Pragmatic Programmer" by Andy Hunt
• "Designing Data-Intensive Applications" by Martin Kleppmann

Currently reading: "Atomic Habits" - Chapter 4`,
          category: 'personal',
          color: '#e3f2fd',
          shape: 'rectangle',
          top: 500,
          left: 300,
          width: 340,
          height: 280,
          createdAt: '2024-01-07T18:30:00Z',
          updatedAt: '2024-01-14T22:00:00Z'
        },
        {
          id: 'note-008',
          title: 'Meeting Action Items',
          content: `From Monday's team standup:

🎯 Action Items:
• [ ] Update project timeline in Jira
• [ ] Review pull request #234
• [ ] Schedule architecture discussion
• [ ] Send client update email
• [ ] Order new laptops for interns

🔄 In Progress:
• Database migration script
• User authentication flow
• Mobile responsive fixes

✅ Completed:
• API documentation updates
• Security audit preparations
• Team lunch coordination

Next standup: Tomorrow 9:30 AM`,
          category: 'work',
          color: '#fff3e0',
          shape: 'rectangle',
          top: 350,
          left: 700,
          width: 290,
          height: 200,
          createdAt: '2024-01-14T09:45:00Z',
          updatedAt: '2024-01-15T10:15:00Z'
        }
      ],
      versionHistory: [
        {
          id: 'note-001-v1',
          noteId: 'note-001',
          timestamp: '2024-01-10T09:00:00Z',
          data: {
            title: 'Initial Meeting Notes',
            content: 'Meeting with design team about dashboard UI.',
            category: 'work'
          }
        },
        {
          id: 'note-001-v2',
          noteId: 'note-001',
          timestamp: '2024-01-12T11:30:00Z',
          data: {
            title: 'Project Meeting Notes',
            content: 'Meeting with design team about the new dashboard UI.\n\nKey points discussed:\n• User feedback on current navigation\n• Proposed changes to color scheme',
            category: 'work'
          }
        },
        {
          id: 'note-002-v1',
          noteId: 'note-002',
          timestamp: '2024-01-12T08:15:00Z',
          data: {
            title: 'Groceries',
            content: 'Weekly grocery list',
            category: 'shopping'
          }
        },
        {
          id: 'note-003-v1',
          noteId: 'note-003',
          timestamp: '2024-01-08T16:20:00Z',
          data: {
            title: 'Startup Ideas',
            content: 'App ideas to build',
            category: 'ideas'
          }
        }
      ],
      shareLinks: [
        {
          token: 'share-demo-001',
          noteId: 'note-003',
          createdAt: '2024-01-14T15:30:00Z',
          isActive: true
        },
        {
          token: 'share-demo-002',
          noteId: 'note-007',
          createdAt: '2024-01-13T20:00:00Z',
          isActive: true
        }
      ],
      analytics: [
        {
          id: 'analytics-001',
          data: {
            totalNotes: 8,
            activeNotes: 8,
            categories: 5,
            recentNotes: 6,
            reminders: 1,
            checklists: 1,
            avgCompletionRate: 0,
            lastUpdated: '2024-01-15T12:00:00Z'
          }
        }
      ]
    };
  }

  async seed() {
    try {
      console.log('🌱 Starting database seeding...');

      // Initialize database
      await databaseService.init();
      console.log('✅ Database initialized');

      // Clear existing data
      await this.clearExistingData();
      console.log('🧹 Cleared existing data');

      // Seed categories
      await this.seedCategories();
      console.log('📂 Seeded categories');

      // Seed notes
      await this.seedNotes();
      console.log('📝 Seeded notes');

      // Seed version history
      await this.seedVersionHistory();
      console.log('📚 Seeded version history');

      // Seed share links
      await this.seedShareLinks();
      console.log('🔗 Seeded share links');

      // Seed analytics
      await this.seedAnalytics();
      console.log('📊 Seeded analytics');

      // Mark migration as complete (so it doesn't try to migrate from localStorage)
      await databaseService.saveSetting('migrationCompleted', true);

      console.log('🎉 Database seeding completed successfully!');
      console.log(`📊 Seeded ${this.sampleData.notes.length} notes, ${this.sampleData.categories.length} categories`);
      console.log('🔄 Refresh the app to see the seeded data');

      return true;
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      return false;
    }
  }

  async clearExistingData() {
    const stores = ['notes', 'categories', 'versionHistory', 'shareLinks', 'analytics', 'settings'];
    for (const storeName of stores) {
      try {
        await databaseService._performTransaction(storeName, 'readwrite', (store) => {
          return store.clear();
        });
      } catch (error) {
        // Ignore errors for stores that don't exist yet
      }
    }
  }

  async seedCategories() {
    for (const category of this.sampleData.categories) {
      await databaseService.saveCategory(category);
    }
  }

  async seedNotes() {
    for (const note of this.sampleData.notes) {
      await databaseService.saveNote(note);
    }
  }

  async seedVersionHistory() {
    for (const version of this.sampleData.versionHistory) {
      await databaseService.saveVersion(version);
    }
  }

  async seedShareLinks() {
    for (const shareLink of this.sampleData.shareLinks) {
      await databaseService.saveShareLink(shareLink);
    }
  }

  async seedAnalytics() {
    for (const analytics of this.sampleData.analytics) {
      await databaseService.saveAnalyticsData(analytics);
    }
  }

  async verifySeeding() {
    try {
      console.log('🔍 Verifying seeded data...');

      const notes = await databaseService.getNotes();
      const categories = await databaseService.getCategories();
      const versions = await databaseService.getVersionsForNote('note-001');
      const shareLinks = await databaseService.getShareLinksForNote('note-003');

      console.log(`📝 Notes: ${notes.length}`);
      console.log(`📂 Categories: ${categories.length}`);
      console.log(`📚 Versions for note-001: ${versions.length}`);
      console.log(`🔗 Share links for note-003: ${shareLinks.length}`);

      return {
        notes: notes.length,
        categories: categories.length,
        versions: versions.length,
        shareLinks: shareLinks.length
      };
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return null;
    }
  }
}

// Create and export seeder instance
export const seeder = new DatabaseSeeder();

// Auto-run if this script is executed directly (for console usage)
if (typeof window !== 'undefined' && window.location) {
  // Make seeder available globally for console usage
  window.DatabaseSeeder = DatabaseSeeder;
  window.seeder = seeder;

  console.log('🌱 Database seeder loaded!');
  console.log('💡 Run: seeder.seed() to populate the database with sample data');
  console.log('🔍 Run: seeder.verifySeeding() to check seeded data');
}
