import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HausarbeitenIndexComponent } from './hausarbeiten-index.component';

describe('HausarbeitenIndexComponent', () => {
  let component: HausarbeitenIndexComponent;
  let fixture: ComponentFixture<HausarbeitenIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HausarbeitenIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HausarbeitenIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
