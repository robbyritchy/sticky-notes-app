// components/AnalyticsView.js
// #105 Create Analytics page layout
// #106 Implement total and category breakdown metrics
// #107 Add dynamic data updates on edit and archive

import { analyticsService } from "../services/analyticsService.js";

export function createAnalyticsView(onBackToNotes) {
  const container = document.createElement("div");
  container.className = "analytics-view";
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--base-color, #fdfdfd);
    color: var(--text-color, #000);
    overflow-y: auto;
    z-index: 1000;
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    position: sticky;
    top: 0;
    z-index: 100;
  `;

  const title = document.createElement("h1");
  title.textContent = "📊 Note Analytics";
  title.style.cssText = `
    margin: 0;
    font-size: 28px;
    color: #333;
  `;

  const headerActions = document.createElement("div");
  headerActions.style.cssText = "display: flex; gap: 12px; align-items: center;";

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "📥 Export Data";
  exportBtn.style.cssText = `
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  `;
  exportBtn.addEventListener("click", () => {
    analyticsService.exportAnalytics();
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Notes";
  backBtn.style.cssText = `
    padding: 8px 16px;
    background: #666;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  `;
  backBtn.addEventListener("click", () => {
    if (onBackToNotes) onBackToNotes();
  });

  headerActions.appendChild(exportBtn);
  headerActions.appendChild(backBtn);
  header.appendChild(title);
  header.appendChild(headerActions);

  // Content
  const content = document.createElement("div");
  content.style.cssText = "padding: 20px;";

  // Summary cards
  const summarySection = document.createElement("div");
  summarySection.className = "analytics-summary";
  summarySection.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  `;

  // Category breakdown
  const categorySection = document.createElement("div");
  categorySection.className = "analytics-categories";
  categorySection.style.cssText = "margin-bottom: 32px;";

  // Activity chart
  const activitySection = document.createElement("div");
  activitySection.className = "analytics-activity";
  activitySection.style.cssText = "margin-bottom: 32px;";

  // Checklist stats
  const checklistSection = document.createElement("div");
  checklistSection.className = "analytics-checklists";
  checklistSection.style.cssText = "margin-bottom: 32px;";

  content.appendChild(summarySection);
  content.appendChild(categorySection);
  content.appendChild(activitySection);
  content.appendChild(checklistSection);

  container.appendChild(header);
  container.appendChild(content);

  // Update function
  function updateAnalytics() {
    const analytics = analyticsService.getAnalytics();

    // Update summary cards
    updateSummaryCards(analytics);

    // Update category breakdown
    updateCategoryBreakdown(analytics);

    // Update activity chart
    updateActivityChart(analytics);

    // Update checklist stats
    updateChecklistStats(analytics);
  }

  function updateSummaryCards(analytics) {
    summarySection.innerHTML = "";

    const cards = [
      {
        title: "Total Notes",
        value: analytics.summary.totalNotes,
        icon: "📝",
        color: "#1976d2"
      },
      {
        title: "Active Notes",
        value: analytics.summary.activeNotes,
        icon: "📌",
        color: "#4caf50"
      },
      {
        title: "Categories",
        value: analytics.summary.categories,
        icon: "🏷️",
        color: "#ff9800"
      },
      {
        title: "This Week",
        value: analytics.summary.recentNotes,
        icon: "📈",
        color: "#9c27b0"
      },
      {
        title: "With Reminders",
        value: analytics.reminders.withReminders,
        subtitle: `${analytics.reminders.percentage}% of active notes`,
        icon: "🔔",
        color: "#f44336"
      },
      {
        title: "Checklists",
        value: analytics.checklists.total,
        subtitle: `${analytics.checklists.avgCompletionRate}% avg completion`,
        icon: "☑",
        color: "#00bcd4"
      }
    ];

    cards.forEach(cardData => {
      const card = createSummaryCard(cardData);
      summarySection.appendChild(card);
    });
  }

  function createSummaryCard({ title, value, subtitle, icon, color }) {
    const card = document.createElement("div");
    card.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid ${color};
    `;

    const header = document.createElement("div");
    header.style.cssText = "display: flex; align-items: center; margin-bottom: 8px;";

    const iconSpan = document.createElement("span");
    iconSpan.textContent = icon;
    iconSpan.style.cssText = "font-size: 24px; margin-right: 12px;";

    const titleSpan = document.createElement("h3");
    titleSpan.textContent = title;
    titleSpan.style.cssText = "margin: 0; font-size: 14px; color: #666;";

    header.appendChild(iconSpan);
    header.appendChild(titleSpan);

    const valueSpan = document.createElement("div");
    valueSpan.textContent = value.toLocaleString();
    valueSpan.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      color: ${color};
      margin-bottom: 4px;
    `;

    card.appendChild(header);
    card.appendChild(valueSpan);

    if (subtitle) {
      const subtitleSpan = document.createElement("div");
      subtitleSpan.textContent = subtitle;
      subtitleSpan.style.cssText = "font-size: 12px; color: #888;";
      card.appendChild(subtitleSpan);
    }

    return card;
  }

  function updateCategoryBreakdown(analytics) {
    categorySection.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "📂 Category Breakdown";
    title.style.cssText = "margin-bottom: 16px; color: #333;";
    categorySection.appendChild(title);

    if (Object.keys(analytics.categories).length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No categories yet.";
      empty.style.cssText = "color: #666; font-style: italic;";
      categorySection.appendChild(empty);
      return;
    }

    const chartContainer = document.createElement("div");
    chartContainer.style.cssText = "display: flex; flex-wrap: wrap; gap: 16px;";

    Object.entries(analytics.categories).forEach(([category, stats]) => {
      const item = document.createElement("div");
      item.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        min-width: 150px;
      `;

      const name = document.createElement("div");
      name.textContent = category;
      name.style.cssText = "font-weight: bold; margin-bottom: 8px; color: #333;";

      const count = document.createElement("div");
      count.textContent = `${stats.count} notes`;
      count.style.cssText = "font-size: 24px; color: #1976d2; margin-bottom: 4px;";

      const percentage = document.createElement("div");
      percentage.textContent = `${stats.percentage}% of total`;
      percentage.style.cssText = "font-size: 12px; color: #666;";

      item.appendChild(name);
      item.appendChild(count);
      item.appendChild(percentage);
      chartContainer.appendChild(item);
    });

    categorySection.appendChild(chartContainer);
  }

  function updateActivityChart(analytics) {
    activitySection.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "📊 Activity Over Time (Last 30 Days)";
    title.style.cssText = "margin-bottom: 16px; color: #333;";
    activitySection.appendChild(title);

    if (analytics.activity.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No activity data yet.";
      empty.style.cssText = "color: #666; font-style: italic;";
      activitySection.appendChild(empty);
      return;
    }

    const chartContainer = document.createElement("div");
    chartContainer.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    const maxCount = Math.max(...analytics.activity.map(d => d.count));

    const barsContainer = document.createElement("div");
    barsContainer.style.cssText = `
      display: flex;
      align-items: end;
      gap: 2px;
      height: 200px;
      margin-top: 16px;
    `;

    analytics.activity.forEach(day => {
      const bar = document.createElement("div");
      bar.style.cssText = `
        flex: 1;
        background: ${day.count > 0 ? '#1976d2' : '#e0e0e0'};
        border-radius: 2px 2px 0 0;
        position: relative;
        min-height: 2px;
      `;

      if (maxCount > 0) {
        const heightPercent = (day.count / maxCount) * 100;
        bar.style.height = `${Math.max(2, heightPercent)}%`;
      }

      const tooltip = document.createElement("div");
      tooltip.textContent = `${day.label}: ${day.count} notes`;
      tooltip.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        margin-bottom: 4px;
      `;

      bar.appendChild(tooltip);
      bar.addEventListener("mouseenter", () => {
        tooltip.style.opacity = "1";
      });
      bar.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
      });

      barsContainer.appendChild(bar);
    });

    chartContainer.appendChild(barsContainer);
    activitySection.appendChild(chartContainer);
  }

  function updateChecklistStats(analytics) {
    checklistSection.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "☑ Checklist Performance";
    title.style.cssText = "margin-bottom: 16px; color: #333;";
    checklistSection.appendChild(title);

    if (analytics.checklists.total === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No checklists yet.";
      empty.style.cssText = "color: #666; font-style: italic;";
      checklistSection.appendChild(empty);
      return;
    }

    const statsContainer = document.createElement("div");
    statsContainer.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;";

    const stats = [
      {
        label: "Total Checklists",
        value: analytics.checklists.total,
        color: "#1976d2"
      },
      {
        label: "Completed",
        value: analytics.checklists.completed,
        color: "#4caf50"
      },
      {
        label: "In Progress",
        value: analytics.checklists.inProgress,
        color: "#ff9800"
      },
      {
        label: "Avg Completion Rate",
        value: `${analytics.checklists.avgCompletionRate}%`,
        color: "#9c27b0"
      }
    ];

    stats.forEach(stat => {
      const card = document.createElement("div");
      card.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        text-align: center;
      `;

      const value = document.createElement("div");
      value.textContent = stat.value;
      value.style.cssText = `font-size: 24px; font-weight: bold; color: ${stat.color}; margin-bottom: 4px;`;

      const label = document.createElement("div");
      label.textContent = stat.label;
      label.style.cssText = "font-size: 14px; color: #666;";

      card.appendChild(value);
      card.appendChild(label);
      statsContainer.appendChild(card);
    });

    checklistSection.appendChild(statsContainer);
  }

  // Initial load
  updateAnalytics();

  // Listen for storage changes to update analytics
  window.addEventListener("storage", (e) => {
    if (e.key === "stickynotes-notes" || e.key === "stickynotes-categories") {
      updateAnalytics();
    }
  });

  return container;
}

