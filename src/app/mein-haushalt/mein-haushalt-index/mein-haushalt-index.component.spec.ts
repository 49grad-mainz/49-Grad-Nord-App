import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeinHaushaltIndexComponent } from './mein-haushalt-index.component';

describe('MeinHaushaltIndexComponent', () => {
  let component: MeinHaushaltIndexComponent;
  let fixture: ComponentFixture<MeinHaushaltIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeinHaushaltIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeinHaushaltIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
