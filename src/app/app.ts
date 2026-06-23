import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. Import your navbar component (adjust path as needed)
import { Navbar } from './components/navbar/navbar'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Add Navbar to this array
  imports: [RouterOutlet, Navbar], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'ai-study-assistant';
}