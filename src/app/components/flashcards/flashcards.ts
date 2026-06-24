import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Gemini } from '../../services/gemini';
import { PdfService } from '../../services/pdf';

interface Flashcard {
  term: string;
  definition: string;
}

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.css'
})
export class Flashcards {

  flashcards: Flashcard[] = [];
  currentIndex: number = 0;
  isFlipped: boolean = false;
  isLoading: boolean = false;
  isGenerated: boolean = false;
  errorMessage: string = '';

  constructor(
    private geminiService: Gemini,
    public pdfService: PdfService,
    private cdr: ChangeDetectorRef
  ) {}

  generateFlashcards(): void {
    if (!this.pdfService.hasText()) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.geminiService.generateFlashcards(
      this.pdfService.getExtractedText()
    ).subscribe({
      next: (response) => {
        this.flashcards = response.flashcards;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.isGenerated = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to generate flashcards. Try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
    this.cdr.detectChanges();
  }

  nextCard(): void {
    if (this.currentIndex < this.flashcards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
      this.cdr.detectChanges();
    }
  }

  prevCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
      this.cdr.detectChanges();
    }
  }

  goToCard(index: number): void {
    this.currentIndex = index;
    this.isFlipped = false;
    this.cdr.detectChanges();
  }

  reset(): void {
    this.isGenerated = false;
    this.flashcards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.cdr.detectChanges();
  }

  get currentCard(): Flashcard {
    return this.flashcards[this.currentIndex];
  }
}