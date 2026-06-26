import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Gemini } from '../../services/gemini';
import { PdfService } from '../../services/pdf';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  html: string;
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
  private shouldScroll = false;

  constructor(
    private geminiService: Gemini,
    public pdfService: PdfService,
    private cdr: ChangeDetectorRef  // ← added
  ) {}

  ngOnInit(): void {
    if (!this.pdfService.hasText()) {
      this.noPdfWarning = true;
      return;
    }

    const saved = sessionStorage.getItem('chatHistory');
    if (saved) {
      this.messages = JSON.parse(saved).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    } else {
      const welcome: ChatMessage = {
        role: 'ai',
        text: `Hi! I've read your notes from "${this.pdfService.getFileName()}". Ask me anything! 📚`,
        html: `Hi! I've read your notes from "<strong>${this.pdfService.getFileName()}</strong>". Ask me anything! 📚`,
        timestamp: new Date()
      };
      this.messages.push(welcome);
      this.saveHistory();
    }

    this.shouldScroll = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(): void {
    const question = this.userInput.trim();
    if (!question || this.isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: question,
      html: question,
      timestamp: new Date()
    };
    this.messages.push(userMsg);
    this.userInput = '';
    this.isLoading = true;
    this.shouldScroll = true;
    this.saveHistory();
    this.cdr.detectChanges(); // ← show user message immediately

    this.geminiService.askQuestion(question, this.pdfService.getExtractedText()).subscribe({
      next: (response) => {
        const aiMsg: ChatMessage = {
          role: 'ai',
          text: response.answer,
          html: this.renderMarkdown(response.answer),
          timestamp: new Date()
        };
        this.messages.push(aiMsg);
        this.isLoading = false;
        this.shouldScroll = true;
        this.saveHistory();
        this.cdr.detectChanges(); // ← show AI response immediately
      },
      error: (err) => {
        const errMsg: ChatMessage = {
          role: 'ai',
          text: '⚠️ Something went wrong. Please try again.',
          html: '⚠️ Something went wrong. Please try again.',
          timestamp: new Date()
        };
        this.messages.push(errMsg);
        this.isLoading = false;
        this.shouldScroll = true;
        this.saveHistory();
        this.cdr.detectChanges(); // ← show error immediately
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
    sessionStorage.removeItem('chatHistory');

    const welcome: ChatMessage = {
      role: 'ai',
      text: `Hi! I've read your notes from "${this.pdfService.getFileName()}". Ask me anything! 📚`,
      html: `Hi! I've read your notes from "<strong>${this.pdfService.getFileName()}</strong>". Ask me anything! 📚`,
      timestamp: new Date()
    };
    this.messages.push(welcome);
    this.saveHistory();
    this.cdr.detectChanges();
  }

  private saveHistory(): void {
    sessionStorage.setItem('chatHistory', JSON.stringify(this.messages));
  }

  private renderMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    try {
      this.chatWindow.nativeElement.scrollTop =
        this.chatWindow.nativeElement.scrollHeight;
    } catch (e) {}
  }
}