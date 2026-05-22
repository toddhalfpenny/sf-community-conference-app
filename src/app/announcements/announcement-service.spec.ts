import { TestBed } from '@angular/core/testing';

import { AnnouncementService } from './annoucement-service';

describe('AnnoucementService', () => {
  let service: AnnouncementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnouncementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
