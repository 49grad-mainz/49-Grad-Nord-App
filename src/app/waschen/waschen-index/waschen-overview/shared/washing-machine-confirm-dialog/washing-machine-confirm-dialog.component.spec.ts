import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WashingMachineConfirmDialogComponent } from './washing-machine-confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: WashingMachineConfirmDialogComponent;
  let fixture: ComponentFixture<WashingMachineConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WashingMachineConfirmDialogComponent]
    });
    fixture = TestBed.createComponent(WashingMachineConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
