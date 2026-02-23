import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaumbelegungOverviewComponent } from './raumbelegung-overview.component';

describe('RaumbelegungOverviewComponent', () => {
  let component: RaumbelegungOverviewComponent;
  let fixture: ComponentFixture<RaumbelegungOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RaumbelegungOverviewComponent]
    });
    fixture = TestBed.createComponent(RaumbelegungOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
