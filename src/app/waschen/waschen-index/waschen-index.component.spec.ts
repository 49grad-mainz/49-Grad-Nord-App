import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaschenIndexComponent } from './waschen-index.component';

describe('WaschenIndexComponent', () => {
  let component: WaschenIndexComponent;
  let fixture: ComponentFixture<WaschenIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaschenIndexComponent]
    });
    fixture = TestBed.createComponent(WaschenIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
