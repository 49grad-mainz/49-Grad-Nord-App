import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GemeinschaftsHaushaltOverviewComponent } from './gemeinschafts-haushalt-overview.component';

describe('GemeinschaftsHaushaltOverviewComponent', () => {
  let component: GemeinschaftsHaushaltOverviewComponent;
  let fixture: ComponentFixture<GemeinschaftsHaushaltOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GemeinschaftsHaushaltOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GemeinschaftsHaushaltOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
