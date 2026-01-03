package com.opscontrol.api.application.inventory;

import java.util.List;

import com.opscontrol.api.domain.inventory.InventoryDomainService;
import com.opscontrol.api.domain.inventory.InventoryItem;
import com.opscontrol.api.domain.inventory.InventoryRepository;

/**
 * Application service coordinating inventory use cases.
 */
public class InventoryApplicationService {

    private final InventoryRepository repository;
    private final InventoryDomainService domainService;

    public InventoryApplicationService(InventoryRepository repository, InventoryDomainService domainService) {
        this.repository = repository;
        this.domainService = domainService;
    }

    public InventoryItem create(CreateItemCommand cmd) {
        InventoryItem prepared = domainService.ensureDefaults(cmd.toDomain());
        return repository.save(prepared);
    }

    public List<InventoryItem> list() {
        return repository.findAll();
    }
}
