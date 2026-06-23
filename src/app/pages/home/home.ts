import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Upload } from '../../components/upload/upload';
import { PdfService } from '../../services/pdf';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, Upload],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(public pdfService: PdfService) {}
}