package com.opscontrol.api.domain.inventory;

import lombok.Builder;
import lombok.Value;

/**
 * Aggregate root for an inventory SKU in the domain layer.
 */
@Value
@Builder(toBuilder = true)
public class InventoryItem {
    String id;
    String sku;
    String name;
    String category;
    String uom;
    String status;
}
