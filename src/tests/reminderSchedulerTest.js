// __tests__/reminderScheduler.test.js
import { reminderScheduler } from "../services/notificationService.js";
jest.useFakeTimers();

test("schedules a reminder and fires at correct time", () => {
  global.Notification = jest.fn((title, options) => { global._lastNotification = { title, options }; });
  Notification.permission = "granted";

  const now = Date.now();
  const inOneHour = new Date(now + 3600000).toISOString();

  reminderScheduler.schedule({ id: "r1", content: "test", reminderDate: inOneHour });

  jest.advanceTimersByTime(3600000 + 10);

  expect(global._lastNotification).toBeDefined();
  expect(global._lastNotification.options.body).toContain("test");
});
