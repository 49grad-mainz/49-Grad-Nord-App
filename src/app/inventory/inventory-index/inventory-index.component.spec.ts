import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryIndexComponent } from './inventory-index.component';

describe('InventoryIndexComponent', () => {
  let component: InventoryIndexComponent;
  let fixture: ComponentFixture<InventoryIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryIndexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
