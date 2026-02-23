import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterWithEmailAndPasswordComponent } from './register-with-email-and-password.component';

describe('LoginWithEmailAndPasswordComponent', () => {
  let component: RegisterWithEmailAndPasswordComponent;
  let fixture: ComponentFixture<RegisterWithEmailAndPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterWithEmailAndPasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterWithEmailAndPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
