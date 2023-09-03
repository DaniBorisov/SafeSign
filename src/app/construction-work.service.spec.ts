import { TestBed } from '@angular/core/testing';

import { ConstructionWorkService } from './construction-work.service';

describe('ConstructionWorkService', () => {
  let service: ConstructionWorkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConstructionWorkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
