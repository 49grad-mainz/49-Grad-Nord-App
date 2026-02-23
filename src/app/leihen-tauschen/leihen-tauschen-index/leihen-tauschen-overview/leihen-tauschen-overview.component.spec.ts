import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeihenTauschenOverviewComponent } from './leihen-tauschen-overview.component';

describe('LeihenTauschenOverviewComponent', () => {
  let component: LeihenTauschenOverviewComponent;
  let fixture: ComponentFixture<LeihenTauschenOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeihenTauschenOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeihenTauschenOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
