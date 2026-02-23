import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkingCalendarTabContentComponent } from './coworking-calendar-tab-content.component';

describe('CoworkingCalendarTabContentComponent', () => {
  let component: CoworkingCalendarTabContentComponent;
  let fixture: ComponentFixture<CoworkingCalendarTabContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoworkingCalendarTabContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoworkingCalendarTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
