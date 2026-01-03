package com.opscontrol.api.inventory;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inventory")
@Validated
@RequiredArgsConstructor
public class InventoryController {

    private final ItemRepository items;

    @GetMapping
    public InventoryResponse list() {
        List<ItemDto> dto = items.findAll().stream()
                .map(ItemMapper::toDto)
                .toList();
        return InventoryResponse.empty(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDto> get(@PathVariable String id) {
        return items.findById(id)
                .map(ItemMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ItemDto> create(@Valid @RequestBody ItemDto payload) {
        ItemDto toSave = payload;
        if (payload.id() == null || payload.id().isBlank()) {
            toSave = payload.toBuilder()
                    .id("SKU-" + UUID.randomUUID())
                    .build();
        }
        ItemDto saved = ItemMapper.toDto(items.save(ItemMapper.toEntity(toSave)));
        return ResponseEntity.created(URI.create("/api/inventory/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDto> update(@PathVariable String id, @Valid @RequestBody ItemDto payload) {
        return items.findById(id)
                .map(entity -> {
                    ItemMapper.merge(payload, entity);
                    ItemDto saved = ItemMapper.toDto(items.save(entity));
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (items.existsById(id)) {
            items.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
