import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginWithEmailAndPasswordComponent } from './login-with-email-and-password.component';

describe('LoginWithEmailAndPasswordComponent', () => {
  let component: LoginWithEmailAndPasswordComponent;
  let fixture: ComponentFixture<LoginWithEmailAndPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginWithEmailAndPasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginWithEmailAndPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
