import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WashDrySummaryTabComponent } from './wash-dry-summary-tab.component';

describe('WashDrySummaryTabComponent', () => {
  let component: WashDrySummaryTabComponent;
  let fixture: ComponentFixture<WashDrySummaryTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WashDrySummaryTabComponent]
    });
    fixture = TestBed.createComponent(WashDrySummaryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
