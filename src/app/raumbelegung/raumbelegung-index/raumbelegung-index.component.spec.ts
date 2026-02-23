import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaumbelegungIndexComponent } from './raumbelegung-index.component';

describe('RaumbelegungIndexComponent', () => {
  let component: RaumbelegungIndexComponent;
  let fixture: ComponentFixture<RaumbelegungIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RaumbelegungIndexComponent]
    });
    fixture = TestBed.createComponent(RaumbelegungIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
