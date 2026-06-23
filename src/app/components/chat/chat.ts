import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Gemini } from '../../services/gemini';
import { PdfService } from '../../services/pdf';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, AfterViewChecked {

  @ViewChild('chatWindow') chatWindow!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  noPdfWarning: boolean = false;

  constructor(
    private geminiService: Gemini,
    public pdfService: PdfService
  ) {}

  ngOnInit(): void {
    if (!this.pdfService.hasText()) {
      this.noPdfWarning = true;
    } else {
      this.messages.push({
        role: 'ai',
        text: `Hi! I've read your notes from "${this.pdfService.getFileName()}". Ask me anything! 📚`,
        timestamp: new Date()
      });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const question = this.userInput.trim();
    if (!question || this.isLoading) return;

    this.messages.push({ role: 'user', text: question, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;

    this.geminiService.askQuestion(question, this.pdfService.getExtractedText()).subscribe({
      next: (response) => {
        this.messages.push({ role: 'ai', text: response.answer, timestamp: new Date() });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({
          role: 'ai',
          text: '⚠️ Something went wrong. Please try again.',
          timestamp: new Date()
        });
        this.isLoading = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages = [];
  }

  private scrollToBottom(): void {
    try {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    } catch (e) {}
  }
}