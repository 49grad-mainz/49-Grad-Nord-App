import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDeletionConfirmationComponent } from './account-deletion-confirmation.component';

describe('AccountDelectionConfirmationComponent', () => {
  let component: AccountDeletionConfirmationComponent;
  let fixture: ComponentFixture<AccountDeletionConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountDeletionConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountDeletionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
