import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkingTableConfirmDialogComponent } from './coworking-table-confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: CoworkingTableConfirmDialogComponent;
  let fixture: ComponentFixture<CoworkingTableConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoworkingTableConfirmDialogComponent]
    });
    fixture = TestBed.createComponent(CoworkingTableConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
