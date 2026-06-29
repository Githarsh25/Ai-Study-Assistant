import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private backendUrl = 'https://ai-study-assistant-backend-alpha.vercel.app/' ;
  private extractedText: string = '';
  private uploadedFileName: string = '';

  constructor(private http: HttpClient) {}

  uploadPdf(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', file);
    return this.http.post(`${this.backendUrl}/api/upload`, formData);
  }

  setExtractedText(text: string, filename: string): void {
    this.extractedText = text;
    this.uploadedFileName = filename;
  }

  getExtractedText(): string { return this.extractedText; }
  getFileName(): string { return this.uploadedFileName; }
  hasText(): boolean { return this.extractedText.trim().length > 0; }

  clearText(): void {
    this.extractedText = '';
    this.uploadedFileName = '';
  }
}