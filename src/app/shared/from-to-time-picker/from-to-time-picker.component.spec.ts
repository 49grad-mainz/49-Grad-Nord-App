import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FromToTimePickerComponent } from './from-to-time-picker.component';

describe('FromToTimePickerComponent', () => {
  let component: FromToTimePickerComponent;
  let fixture: ComponentFixture<FromToTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FromToTimePickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FromToTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
