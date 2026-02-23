import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSearchInputComponent } from './common-search-input.component';

describe('CommonSearchInputComponent', () => {
  let component: CommonSearchInputComponent;
  let fixture: ComponentFixture<CommonSearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonSearchInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonSearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
