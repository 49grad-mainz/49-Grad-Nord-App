import { TestBed } from '@angular/core/testing';

import { HausarbeitenService } from './cleaning-schedule.service';

describe('HausarbeitenService', () => {
  let service: HausarbeitenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HausarbeitenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
