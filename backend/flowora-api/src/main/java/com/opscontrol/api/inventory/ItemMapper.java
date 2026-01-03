package com.opscontrol.api.inventory;

import java.util.Optional;

public final class ItemMapper {
    private ItemMapper() {}

    public static ItemDto toDto(ItemEntity e) {
        return ItemDto.builder()
                .id(e.getId())
                .sku(e.getSku())
                .name(e.getName())
                .category(e.getCategory())
                .industry(e.getIndustry())
                .subCategory(e.getSubCategory())
                .uom(e.getUom())
                .status(e.getStatus())
                .trackingType(e.getTrackingType())
                .hsnSac(e.getHsnSac())
                .reorderMinQty(e.getReorderMinQty())
                .reorderQty(e.getReorderQty())
                .shelfLifeDays(e.getShelfLifeDays())
                .batchType(e.getBatchType())
                .importance(e.getImportance())
                .types(e.getTypes())
                .internalManufacturing(e.getInternalManufacturing())
                .purchase(e.getPurchase())
                .stdCost(e.getStdCost())
                .purchaseCost(e.getPurchaseCost())
                .salePrice(e.getSalePrice())
                .gst(e.getGst())
                .mrp(e.getMrp())
                .description(e.getDescription())
                .internalNotes(e.getInternalNotes())
                .leadTimeDays(e.getLeadTimeDays())
                .tags(e.getTags())
                .safetyStockByLocation(e.getSafetyStockByLocation())
                .defaultStoreId(e.getDefaultStoreId())
                .build();
    }

    public static ItemEntity toEntity(ItemDto dto) {
        return ItemEntity.builder()
                .id(dto.id())
                .sku(dto.sku())
                .name(dto.name())
                .category(dto.category())
                .industry(dto.industry())
                .subCategory(dto.subCategory())
                .uom(dto.uom())
                .status(dto.status())
                .trackingType(dto.trackingType())
                .hsnSac(dto.hsnSac())
                .reorderMinQty(dto.reorderMinQty())
                .reorderQty(dto.reorderQty())
                .shelfLifeDays(dto.shelfLifeDays())
                .batchType(dto.batchType())
                .importance(dto.importance())
                .types(dto.types())
                .internalManufacturing(dto.internalManufacturing())
                .purchase(dto.purchase())
                .stdCost(dto.stdCost())
                .purchaseCost(dto.purchaseCost())
                .salePrice(dto.salePrice())
                .gst(dto.gst())
                .mrp(dto.mrp())
                .description(dto.description())
                .internalNotes(dto.internalNotes())
                .leadTimeDays(dto.leadTimeDays())
                .tags(dto.tags())
                .safetyStockByLocation(dto.safetyStockByLocation())
                .defaultStoreId(dto.defaultStoreId())
                .build();
    }

    public static void merge(ItemDto dto, ItemEntity e) {
        Optional.ofNullable(dto.sku()).ifPresent(e::setSku);
        Optional.ofNullable(dto.name()).ifPresent(e::setName);
        Optional.ofNullable(dto.category()).ifPresent(e::setCategory);
        Optional.ofNullable(dto.industry()).ifPresent(e::setIndustry);
        Optional.ofNullable(dto.subCategory()).ifPresent(e::setSubCategory);
        Optional.ofNullable(dto.uom()).ifPresent(e::setUom);
        Optional.ofNullable(dto.status()).ifPresent(e::setStatus);
        Optional.ofNullable(dto.trackingType()).ifPresent(e::setTrackingType);
        Optional.ofNullable(dto.hsnSac()).ifPresent(e::setHsnSac);
        Optional.ofNullable(dto.reorderMinQty()).ifPresent(e::setReorderMinQty);
        Optional.ofNullable(dto.reorderQty()).ifPresent(e::setReorderQty);
        Optional.ofNullable(dto.shelfLifeDays()).ifPresent(e::setShelfLifeDays);
        Optional.ofNullable(dto.batchType()).ifPresent(e::setBatchType);
        Optional.ofNullable(dto.importance()).ifPresent(e::setImportance);
        Optional.ofNullable(dto.types()).ifPresent(e::setTypes);
        Optional.ofNullable(dto.internalManufacturing()).ifPresent(e::setInternalManufacturing);
        Optional.ofNullable(dto.purchase()).ifPresent(e::setPurchase);
        Optional.ofNullable(dto.stdCost()).ifPresent(e::setStdCost);
        Optional.ofNullable(dto.purchaseCost()).ifPresent(e::setPurchaseCost);
        Optional.ofNullable(dto.salePrice()).ifPresent(e::setSalePrice);
        Optional.ofNullable(dto.gst()).ifPresent(e::setGst);
        Optional.ofNullable(dto.mrp()).ifPresent(e::setMrp);
        Optional.ofNullable(dto.description()).ifPresent(e::setDescription);
        Optional.ofNullable(dto.internalNotes()).ifPresent(e::setInternalNotes);
        Optional.ofNullable(dto.leadTimeDays()).ifPresent(e::setLeadTimeDays);
        Optional.ofNullable(dto.tags()).ifPresent(e::setTags);
        Optional.ofNullable(dto.safetyStockByLocation()).ifPresent(e::setSafetyStockByLocation);
        Optional.ofNullable(dto.defaultStoreId()).ifPresent(e::setDefaultStoreId);
    }
}
