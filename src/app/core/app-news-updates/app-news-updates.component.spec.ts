import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNewsUpdatesComponent } from './app-news-updates.component';

describe('AppNewsUpdatesComponent', () => {
  let component: AppNewsUpdatesComponent;
  let fixture: ComponentFixture<AppNewsUpdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppNewsUpdatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppNewsUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
