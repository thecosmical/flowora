import { TestBed } from '@angular/core/testing';

import { InventoryStoreService } from './inventory-store';

describe('InventoryStore', () => {
  let service: InventoryStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
