import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HausarbeitenOverviewComponent } from './hausarbeiten-overview.component';

describe('HausarbeitenOverviewComponent', () => {
  let component: HausarbeitenOverviewComponent;
  let fixture: ComponentFixture<HausarbeitenOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HausarbeitenOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HausarbeitenOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
