import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Streak } from '../../services/streak';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  streakCount: number = 0;
  longestStreak: number = 0;
  milestoneMessage: string = '';
  showMilestone: boolean = false;

  constructor(private streakService: Streak) {}

  ngOnInit(): void {
    this.streakCount = this.streakService.getStreak();
    this.longestStreak = this.streakService.getLongestStreak();
    const msg = this.streakService.getMilestoneMessage();
    if (msg) {
      this.milestoneMessage = msg;
      this.showMilestone = true;
      setTimeout(() => this.showMilestone = false, 4000);
    }
  }
}