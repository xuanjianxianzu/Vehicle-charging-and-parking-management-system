import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { superAuthGuard } from './super-auth.guard';

describe('superAuthGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => superAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
