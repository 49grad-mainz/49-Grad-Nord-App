import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkingIndexComponent } from './coworking-index.component';

describe('RaumbelegungIndexComponent', () => {
  let component: CoworkingIndexComponent;
  let fixture: ComponentFixture<CoworkingIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoworkingIndexComponent]
    });
    fixture = TestBed.createComponent(CoworkingIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
