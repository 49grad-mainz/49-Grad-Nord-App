import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeinHaushaltOverviewComponent } from './mein-haushalt-overview.component';

describe('MeinHaushaltOverviewComponent', () => {
  let component: MeinHaushaltOverviewComponent;
  let fixture: ComponentFixture<MeinHaushaltOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeinHaushaltOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeinHaushaltOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
