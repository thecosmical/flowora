package com.opscontrol.api.application.inventory;

import com.opscontrol.api.domain.inventory.InventoryItem;
import lombok.Builder;

/**
 * Application-layer command for creating an InventoryItem.
 */
@Builder
public record CreateItemCommand(
        String id,
        String sku,
        String name,
        String category,
        String uom,
        String status
) {
    public InventoryItem toDomain() {
        return InventoryItem.builder()
                .id(id)
                .sku(sku)
                .name(name)
                .category(category)
                .uom(uom)
                .status(status)
                .build();
    }
}
