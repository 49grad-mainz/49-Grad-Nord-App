import { TestBed } from '@angular/core/testing';

import { MobilityReservationService } from './mobility-reservation.service';

describe('MobilityReservationService', () => {
  let service: MobilityReservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobilityReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
