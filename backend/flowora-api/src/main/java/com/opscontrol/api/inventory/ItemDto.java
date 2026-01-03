package com.opscontrol.api.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ItemDto(
        @NotBlank String id,
        @NotBlank String sku,
        @NotBlank String name,
        @NotBlank String category,
        String industry,
        String subCategory,
        @NotBlank String uom,
        @NotBlank String status,
        String trackingType,
        String hsnSac,
        Integer reorderMinQty,
        Integer reorderQty,
        Integer shelfLifeDays,
        String batchType,
        String importance,
        List<String> types,
        Boolean internalManufacturing,
        Boolean purchase,
        BigDecimal stdCost,
        BigDecimal purchaseCost,
        BigDecimal salePrice,
        BigDecimal gst,
        BigDecimal mrp,
        String description,
        String internalNotes,
        Integer leadTimeDays,
        List<String> tags,
        Map<String, Integer> safetyStockByLocation,
        String defaultStoreId
) {
}
