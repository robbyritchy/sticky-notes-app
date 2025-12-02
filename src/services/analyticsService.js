// services/analyticsService.js
// #105 Create Analytics page layout
// #106 Implement total and category breakdown metrics
// #107 Add dynamic data updates on edit and archive
// #108 Integrate reminders and pinned note data
// #109 Sync analytics across devices

// import { databaseAdapter } from "./databaseAdapter.js";

export const analyticsService = {
  // Calculate comprehensive analytics data
  getAnalytics() {
    const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
    const categories = JSON.parse(localStorage.getItem("stickynotes-categories") || "[]");

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalNotes = notes.length;
    const activeNotes = notes.filter(n => !n.archived).length;
    const archivedNotes = notes.filter(n => n.archived).length;

    // Category breakdown
    const categoryStats = {};
    categories.forEach(cat => {
      const catNotes = notes.filter(n => (n.category || "Uncategorized") === cat && !n.archived);
      categoryStats[cat] = {
        count: catNotes.length,
        percentage: totalNotes > 0 ? Math.round((catNotes.length / activeNotes) * 100) : 0
      };
    });

    // Time-based stats
    const recentNotes = notes.filter(n => {
      const created = new Date(n.createdAt);
      return created >= oneWeekAgo;
    }).length;

    const monthlyNotes = notes.filter(n => {
      const created = new Date(n.createdAt);
      return created >= oneMonthAgo;
    }).length;

    // Reminder stats
    const notesWithReminders = notes.filter(n => n.reminderDate).length;
    const overdueReminders = notes.filter(n => {
      if (!n.reminderDate) return false;
      return new Date(n.reminderDate) < now;
    }).length;

    // Checklist stats
    const checklists = notes.filter(n => n.type === "checklist");
    const checklistStats = {
      total: checklists.length,
      completed: checklists.filter(list => {
        if (!list.items || list.items.length === 0) return false;
        const completed = list.items.filter(item => item.checked).length;
        return completed === list.items.length;
      }).length,
      inProgress: checklists.filter(list => {
        if (!list.items || list.items.length === 0) return false;
        const completed = list.items.filter(item => item.checked).length;
        return completed > 0 && completed < list.items.length;
      }).length
    };

    // Average completion rate for checklists
    let totalCompletionRate = 0;
    let completedLists = 0;
    checklists.forEach(list => {
      if (list.items && list.items.length > 0) {
        const completed = list.items.filter(item => item.checked).length;
        const rate = completed / list.items.length;
        totalCompletionRate += rate;
        completedLists++;
      }
    });
    const avgCompletionRate = completedLists > 0 ? Math.round((totalCompletionRate / completedLists) * 100) : 0;

    // Activity over time (last 30 days)
    const activityData = this.getActivityOverTime(notes, 30);

    // Most active category
    const mostActiveCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.count - a.count)[0];

    return {
      summary: {
        totalNotes,
        activeNotes,
        archivedNotes,
        categories: categories.length,
        recentNotes,
        monthlyNotes
      },
      categories: categoryStats,
      reminders: {
        withReminders: notesWithReminders,
        overdue: overdueReminders,
        percentage: activeNotes > 0 ? Math.round((notesWithReminders / activeNotes) * 100) : 0
      },
      checklists: {
        ...checklistStats,
        avgCompletionRate
      },
      activity: activityData,
      mostActiveCategory: mostActiveCategory ? {
        name: mostActiveCategory[0],
        count: mostActiveCategory[1].count
      } : null,
      lastUpdated: now.toISOString()
    };
  },

  // Get activity data over the last N days
  getActivityOverTime(notes, days) {
    const activity = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

      const dayNotes = notes.filter(note => {
        const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
        return noteDate === dateStr;
      });

      activity.push({
        date: dateStr,
        count: dayNotes.length,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    return activity;
  },

  // Get note creation trends
  getCreationTrends(notes) {
    const trends = {
      byHour: Array(24).fill(0),
      byDay: Array(7).fill(0),
      byMonth: Array(12).fill(0)
    };

    notes.forEach(note => {
      const date = new Date(note.createdAt);
      trends.byHour[date.getHours()]++;
      trends.byDay[date.getDay()]++;
      trends.byMonth[date.getMonth()]++;
    });

    return trends;
  },

  // Export analytics data
  exportAnalytics() {
    const analytics = this.getAnalytics();
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sticky-notes-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

