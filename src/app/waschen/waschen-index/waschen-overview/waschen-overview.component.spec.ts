import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaschenOverviewComponent } from './waschen-overview.component';

describe('WaschenOverviewComponent', () => {
  let component: WaschenOverviewComponent;
  let fixture: ComponentFixture<WaschenOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaschenOverviewComponent]
    });
    fixture = TestBed.createComponent(WaschenOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
