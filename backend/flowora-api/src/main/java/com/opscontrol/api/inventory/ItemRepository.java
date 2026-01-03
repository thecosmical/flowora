package com.opscontrol.api.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<ItemEntity, String> {
    boolean existsBySku(String sku);
}
