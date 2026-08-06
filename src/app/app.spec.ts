import { TestBed, waitForAsync } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(waitForAsync(() => {
    return TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet shell', waitForAsync(() => {
    const fixture = TestBed.createComponent(App);
    return fixture.whenStable().then(() => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('router-outlet')).not.toBeNull();
    });
  }));
});
