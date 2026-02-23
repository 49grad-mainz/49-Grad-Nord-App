import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilityBookingDialogComponent } from './mobility-booking-dialog.component';

describe('MobilityBookingDialogComponent', () => {
  let component: MobilityBookingDialogComponent;
  let fixture: ComponentFixture<MobilityBookingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilityBookingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilityBookingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
