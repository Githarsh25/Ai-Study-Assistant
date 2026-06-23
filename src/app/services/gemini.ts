import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Gemini {

  private backendUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  askQuestion(question: string, notes: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/api/chat`, { question, notes });
  }

  generateQuiz(notes: string, count: number): Observable<any> {
    return this.http.post(`${this.backendUrl}/api/quiz`, { notes, count });
  }

  generateFlashcards(notes: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/api/flashcards`, { notes });
  }
}