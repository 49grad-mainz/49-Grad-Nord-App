import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilityOverviewComponent } from './mobility-overview.component';

describe('MobilityOverviewComponent', () => {
  let component: MobilityOverviewComponent;
  let fixture: ComponentFixture<MobilityOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilityOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilityOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
