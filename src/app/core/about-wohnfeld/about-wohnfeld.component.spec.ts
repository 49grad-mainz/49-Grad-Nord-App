import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutWohnfeldComponent } from './about-wohnfeld.component';

describe('AboutWohnfeldComponent', () => {
  let component: AboutWohnfeldComponent;
  let fixture: ComponentFixture<AboutWohnfeldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutWohnfeldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutWohnfeldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
