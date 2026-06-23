import { TestBed } from '@angular/core/testing';
// Update import from App to AppComponent
import { AppComponent } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Update imports array
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    // Update createComponent
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    // Update createComponent
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, ai-study-assistant');
  });
});