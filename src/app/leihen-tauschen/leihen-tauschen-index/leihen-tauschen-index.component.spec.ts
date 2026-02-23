import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeihenTauschenIndexComponent } from './leihen-tauschen-index.component';

describe('LeihenTauschenIndexComponent', () => {
  let component: LeihenTauschenIndexComponent;
  let fixture: ComponentFixture<LeihenTauschenIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeihenTauschenIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeihenTauschenIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
