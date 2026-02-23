import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilityDashboardCardComponent } from './mobility-dashboard-card.component';

describe('MobilityDashboardCardComponent', () => {
  let component: MobilityDashboardCardComponent;
  let fixture: ComponentFixture<MobilityDashboardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilityDashboardCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilityDashboardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
