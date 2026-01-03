package com.opscontrol.api.inventory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "items")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class ItemEntity {

	@Id
	private String id;

	@NotBlank
	private String sku;

	@NotBlank
	private String name;

	@NotBlank
	private String category;

	private String industry;
	private String subCategory;

	@NotBlank
	private String uom;

	@NotBlank
	private String status;

	private String trackingType;
	private String hsnSac;
	private Integer reorderMinQty;
	private Integer reorderQty;
	private Integer shelfLifeDays;
	private String batchType;
	private String importance;

	@ElementCollection
	private List<String> types;

	private Boolean internalManufacturing;
	private Boolean purchase;
	private BigDecimal stdCost;
	private BigDecimal purchaseCost;
	private BigDecimal salePrice;
	private BigDecimal gst;
	private BigDecimal mrp;

	@Column(columnDefinition = "text")
	private String description;

	@Column(columnDefinition = "text")
	private String internalNotes;

	private Integer leadTimeDays;

	@ElementCollection
	private List<String> tags;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(columnDefinition = "jsonb")
	private Map<String, Integer> safetyStockByLocation;

	private String defaultStoreId;
}
