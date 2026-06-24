import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Gemini } from '../../services/gemini';
import { PdfService } from '../../services/pdf';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

type QuizState = 'setup' | 'active' | 'result';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css'
})
export class Quiz {

  quizState: QuizState = 'setup';
  questions: QuizQuestion[] = [];
  selectedAnswers: string[] = [];
  questionCount: number = 5;
  isLoading: boolean = false;
  errorMessage: string = '';
  score: number = 0;

  constructor(
    private geminiService: Gemini,
    public pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) {}

  generateQuiz(): void {
    if (!this.pdfService.hasText()) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.geminiService.generateQuiz(
      this.pdfService.getExtractedText(),
      this.questionCount
    ).subscribe({
      next: (response) => {
        this.questions = response.questions;
        this.selectedAnswers = new Array(this.questions.length).fill('');
        this.quizState = 'active';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to generate quiz. Try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectAnswer(questionIndex: number, option: string): void {
    this.selectedAnswers[questionIndex] = option;
    this.cdr.detectChanges();
  }

  submitQuiz(): void {
    this.score = this.questions.reduce((total, q, i) =>
      total + (this.selectedAnswers[i] === q.correctAnswer ? 1 : 0), 0);
    this.quizState = 'result';
    this.cdr.detectChanges();
  }

  get allAnswered(): boolean {
    return this.selectedAnswers.every(a => a !== '');
  }

  get scorePercentage(): number {
    return Math.round((this.score / this.questions.length) * 100);
  }

  get scoreMessage(): string {
    const p = this.scorePercentage;
    if (p === 100) return '🏆 Perfect score! Outstanding!';
    if (p >= 80)  return '🎉 Great job! You know this well!';
    if (p >= 60)  return '👍 Good effort! Review the missed ones.';
    return '📖 Keep studying — you\'ll get there!';
  }

  retakeQuiz(): void {
    this.selectedAnswers = new Array(this.questions.length).fill('');
    this.quizState = 'active';
    this.cdr.detectChanges();
  }

  resetQuiz(): void {
    this.quizState = 'setup';
    this.questions = [];
    this.selectedAnswers = [];
    this.score = 0;
    this.cdr.detectChanges();
  }
}