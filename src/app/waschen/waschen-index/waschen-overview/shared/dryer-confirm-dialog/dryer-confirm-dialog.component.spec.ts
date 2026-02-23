import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DryerConfirmDialogComponent } from './dryer-confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: DryerConfirmDialogComponent;
  let fixture: ComponentFixture<DryerConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DryerConfirmDialogComponent]
    });
    fixture = TestBed.createComponent(DryerConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
