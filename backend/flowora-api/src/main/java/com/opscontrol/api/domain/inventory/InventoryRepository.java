package com.opscontrol.api.domain.inventory;

import java.util.List;
import java.util.Optional;

/**
 * Domain SPI for inventory persistence.
 */
public interface InventoryRepository {
    Optional<InventoryItem> findById(String id);
    List<InventoryItem> findAll();
    InventoryItem save(InventoryItem item);
    void deleteById(String id);
}
