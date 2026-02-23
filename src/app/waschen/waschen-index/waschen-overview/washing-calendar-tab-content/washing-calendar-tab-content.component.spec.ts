import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WashingCalendarTabContentComponent } from './washing-calendar-tab-content.component';

describe('WashingCalendarTabContentComponent', () => {
  let component: WashingCalendarTabContentComponent;
  let fixture: ComponentFixture<WashingCalendarTabContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WashingCalendarTabContentComponent]
    });
    fixture = TestBed.createComponent(WashingCalendarTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
