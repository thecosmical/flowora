package com.opscontrol.api.infrastructure.inventory;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.opscontrol.api.domain.inventory.InventoryItem;
import com.opscontrol.api.domain.inventory.InventoryRepository;
import com.opscontrol.api.inventory.ItemEntity;
import com.opscontrol.api.inventory.ItemRepository;

@Component
public class InventoryJpaAdapter implements InventoryRepository {

    private final ItemRepository itemRepository;

    public InventoryJpaAdapter(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public Optional<InventoryItem> findById(String id) {
        return itemRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<InventoryItem> findAll() {
        return itemRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public InventoryItem save(InventoryItem item) {
        ItemEntity saved = itemRepository.save(toEntity(item));
        return toDomain(saved);
    }

    @Override
    public void deleteById(String id) {
        itemRepository.deleteById(id);
    }

    private InventoryItem toDomain(ItemEntity entity) {
        return InventoryItem.builder()
                .id(entity.getId())
                .sku(entity.getSku())
                .name(entity.getName())
                .category(entity.getCategory())
                .uom(entity.getUom())
                .status(entity.getStatus())
                .build();
    }

    private ItemEntity toEntity(InventoryItem item) {
        return ItemEntity.builder()
                .id(item.getId())
                .sku(item.getSku())
                .name(item.getName())
                .category(item.getCategory())
                .uom(item.getUom())
                .status(item.getStatus())
                .build();
    }
}
