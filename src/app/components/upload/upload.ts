import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../services/pdf';
@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.html',
  styleUrls: ['./upload.css']
})
export class Upload {

  selectedFile: File | null = null;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private pdfService: PdfService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Please select a PDF file only.';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a PDF file first.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pdfService.uploadPdf(this.selectedFile).subscribe({
      next: (response) => {
        this.pdfService.setExtractedText(response.text, response.filename);
        this.successMessage = `✅ "${response.filename}" uploaded successfully! ${response.characterCount.toLocaleString()} characters extracted.`;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Upload failed. Make sure the backend is running.';
        this.isLoading = false;
      }
    });
  }

  onClear(): void {
    this.pdfService.clearText();
    this.selectedFile = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  get pdfAlreadyLoaded(): boolean {
    return this.pdfService.hasText();
  }

  get loadedFileName(): string {
    return this.pdfService.getFileName();
  }
}