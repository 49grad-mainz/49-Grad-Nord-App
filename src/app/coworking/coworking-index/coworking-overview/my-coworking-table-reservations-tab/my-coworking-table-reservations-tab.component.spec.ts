import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCoworkingTableReservationsTabComponent } from './my-coworking-table-reservations-tab.component';

describe('MyReservationsTabComponent', () => {
  let component: MyCoworkingTableReservationsTabComponent;
  let fixture: ComponentFixture<MyCoworkingTableReservationsTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyCoworkingTableReservationsTabComponent]
    });
    fixture = TestBed.createComponent(MyCoworkingTableReservationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
