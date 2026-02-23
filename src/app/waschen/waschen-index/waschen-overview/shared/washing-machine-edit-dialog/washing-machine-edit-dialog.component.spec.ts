import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WashingMachineEditDialogComponent } from './washing-machine-edit-dialog.component';

describe('WashingMachineEditDialogComponent', () => {
  let component: WashingMachineEditDialogComponent;
  let fixture: ComponentFixture<WashingMachineEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WashingMachineEditDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WashingMachineEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
