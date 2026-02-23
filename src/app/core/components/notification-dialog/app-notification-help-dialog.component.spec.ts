import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNotificationHelpDialogComponent } from './app-notification-help-dialog.component';

describe('AppNotificationHelpDialogComponent', () => {
  let component: AppNotificationHelpDialogComponent;
  let fixture: ComponentFixture<AppNotificationHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppNotificationHelpDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppNotificationHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
