import { TestBed } from '@angular/core/testing';

import { SponsorsService } from './sponsors.service';

describe('Sponsors', () => {
  let service: SponsorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SponsorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
