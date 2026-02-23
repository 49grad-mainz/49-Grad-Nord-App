import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReservationsTabComponent } from './my-reservations-tab.component';

describe('MyReservationsTabComponent', () => {
  let component: MyReservationsTabComponent;
  let fixture: ComponentFixture<MyReservationsTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyReservationsTabComponent]
    });
    fixture = TestBed.createComponent(MyReservationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
