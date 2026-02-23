import { TestBed } from '@angular/core/testing';

import { WerkzeugService } from './werkzeug.service';

describe('WerkzeugService', () => {
  let service: WerkzeugService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WerkzeugService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
