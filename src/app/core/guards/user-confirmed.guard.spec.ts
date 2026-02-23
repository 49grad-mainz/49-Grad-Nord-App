import { TestBed } from '@angular/core/testing';

import { UserConfirmedGuard } from './user-confirmed.guard';

describe('UserConfirmedGuard', () => {
  let guard: UserConfirmedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UserConfirmedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
