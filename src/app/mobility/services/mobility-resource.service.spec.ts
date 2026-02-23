import { TestBed } from '@angular/core/testing';

import { MobilityResourceService } from './mobility-resource.service';

describe('MobilityResourceService', () => {
  let service: MobilityResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobilityResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
