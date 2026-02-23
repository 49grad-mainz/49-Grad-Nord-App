import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GemeinschaftsHaushaltIndexComponent } from './gemeinschafts-haushalt-index.component';

describe('GemeinschaftsHaushaltIndexComponent', () => {
  let component: GemeinschaftsHaushaltIndexComponent;
  let fixture: ComponentFixture<GemeinschaftsHaushaltIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GemeinschaftsHaushaltIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GemeinschaftsHaushaltIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
