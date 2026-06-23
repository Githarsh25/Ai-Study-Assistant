import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Chat } from './components/chat/chat';
import { Quiz } from './components/quiz/quiz';
import { Flashcards } from './components/flashcards/flashcards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'chat', component: Chat },
  { path: 'quiz', component: Quiz },
  { path: 'flashcards', component: Flashcards },
];