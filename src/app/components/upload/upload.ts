import { Component, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef  // ← forces Angular to re-check the UI
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Reset the input so the same file can be re-selected later
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Please select a PDF file only.';
      this.selectedFile = null;
      this.cdr.detectChanges();
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a PDF file first.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.pdfService.uploadPdf(this.selectedFile).subscribe({
      next: (response) => {
        this.pdfService.setExtractedText(response.text, response.filename);
        this.successMessage = `✅ "${response.filename}" uploaded! ${response.characterCount.toLocaleString()} characters extracted.`;
        this.isLoading = false;
        this.selectedFile = null;
        // Reset the file input element so a new file can be picked
        this.resetFileInput();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Upload failed. Make sure the backend is running.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onClear(): void {
    this.pdfService.clearText();
    this.selectedFile = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.resetFileInput();
    this.cdr.detectChanges();
  }

  private resetFileInput(): void {
    // Grab the file input and clear it so the same file can be re-uploaded
    const input = document.getElementById('pdfInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  get pdfAlreadyLoaded(): boolean {
    return this.pdfService.hasText();
  }

  get loadedFileName(): string {
    return this.pdfService.getFileName();
  }
}