import { TestBed } from '@angular/core/testing';

import { ModelsStatesService } from './models-states.service';

describe('ModelsStatesService', () => {
  let service: ModelsStatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelsStatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
