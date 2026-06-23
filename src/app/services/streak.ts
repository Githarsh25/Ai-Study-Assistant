import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Streak {

  private readonly STREAK_KEY = 'study_streak';
  private readonly DATE_KEY = 'last_visit_date';
  private readonly LONGEST_KEY = 'longest_streak';

  constructor() {
    this.updateStreak();
  }

  updateStreak(): void {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem(this.DATE_KEY);
    const currentStreak = parseInt(localStorage.getItem(this.STREAK_KEY) || '0');
    const longestStreak = parseInt(localStorage.getItem(this.LONGEST_KEY) || '0');

    if (!lastVisit) {
      localStorage.setItem(this.STREAK_KEY, '1');
      localStorage.setItem(this.DATE_KEY, today);
      localStorage.setItem(this.LONGEST_KEY, '1');
      return;
    }

    if (lastVisit === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const newStreak = lastVisit === yesterday.toDateString() ? currentStreak + 1 : 1;

    localStorage.setItem(this.STREAK_KEY, newStreak.toString());
    localStorage.setItem(this.DATE_KEY, today);

    if (newStreak > longestStreak) {
      localStorage.setItem(this.LONGEST_KEY, newStreak.toString());
    }
  }

  getStreak(): number {
    return parseInt(localStorage.getItem(this.STREAK_KEY) || '1');
  }

  getLongestStreak(): number {
    return parseInt(localStorage.getItem(this.LONGEST_KEY) || '1');
  }

  getMilestoneMessage(): string {
    const streak = this.getStreak();
    if (streak === 3)  return '🔥 3-day streak! You\'re building a habit!';
    if (streak === 7)  return '⚡ One full week! Amazing consistency!';
    if (streak === 14) return '🏆 Two weeks strong! You\'re unstoppable!';
    if (streak === 30) return '🌟 30 days! You\'re a study legend!';
    return '';
  }
}