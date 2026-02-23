import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DryerEditDialogComponent } from './dryer-edit-dialog.component';

describe('DryerEditDialogComponent', () => {
  let component: DryerEditDialogComponent;
  let fixture: ComponentFixture<DryerEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DryerEditDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DryerEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
