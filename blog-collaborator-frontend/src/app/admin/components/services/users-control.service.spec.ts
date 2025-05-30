import { TestBed } from '@angular/core/testing';

import { UsersControlService } from './users-control.service';

describe('UsersControlService', () => {
  let service: UsersControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
