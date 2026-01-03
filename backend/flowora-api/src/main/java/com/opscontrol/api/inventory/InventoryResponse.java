package com.opscontrol.api.inventory;

import java.util.List;

public record InventoryResponse(
        List<ItemDto> items,
        List<Object> batches,
        List<Object> stock,
        List<Object> locations,
        List<Object> movements
) {
    public static InventoryResponse empty(List<ItemDto> items) {
        return new InventoryResponse(items, List.of(), List.of(), List.of(), List.of());
    }
}
