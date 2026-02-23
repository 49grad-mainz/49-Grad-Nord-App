import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkingOverviewComponent } from './coworking-overview.component';

describe('RaumbelegungOverviewComponent', () => {
  let component: CoworkingOverviewComponent;
  let fixture: ComponentFixture<CoworkingOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoworkingOverviewComponent]
    });
    fixture = TestBed.createComponent(CoworkingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
