"use strict";

const MEASURES = {
  weight: {
    label: "Weight",
    baseLabel: "g",
    units: [
      ["mg", "milligram", 0.001],
      ["g", "gram", 1],
      ["kg", "kilogram", 1000],
      ["oz", "ounce", 28.349523125],
      ["lb", "pound", 453.59237],
    ],
  },
  volume: {
    label: "Volume",
    baseLabel: "ml",
    units: [
      ["ml", "milliliter", 1],
      ["l", "liter", 1000],
      ["tsp", "teaspoon", 4.928921594],
      ["tbsp", "tablespoon", 14.786764781],
      ["fl_oz", "fluid ounce", 29.5735295625],
      ["cup", "cup", 236.5882365],
      ["pt", "pint", 473.176473],
      ["qt", "quart", 946.352946],
      ["gal", "gallon", 3785.411784],
    ],
  },
  quantity: {
    label: "Quantity",
    baseLabel: "item",
    units: [
      ["item", "item", 1],
      ["pair", "pair", 2],
      ["dozen", "dozen", 12],
      ["pack", "pack", 1],
      ["sheet", "sheet", 1],
      ["serving", "serving", 1],
    ],
  },
  length: {
    label: "Length",
    baseLabel: "m",
    units: [
      ["mm", "millimeter", 0.001],
      ["cm", "centimeter", 0.01],
      ["m", "meter", 1],
      ["in", "inch", 0.0254],
      ["ft", "foot", 0.3048],
      ["yd", "yard", 0.9144],
    ],
  },
  area: {
    label: "Area",
    baseLabel: "sqm",
    units: [
      ["sqcm", "square centimeter", 0.0001],
      ["sqm", "square meter", 1],
      ["sqin", "square inch", 0.00064516],
      ["sqft", "square foot", 0.09290304],
      ["sqyd", "square yard", 0.83612736],
    ],
  },
};

const DEFAULT_ITEMS = [
  { name: "Item 1", price: "", amount: "", packCount: 1, unit: "" },
  { name: "Item 2", price: "", amount: "", packCount: 1, unit: "" },
];

const elements = {
  currency: document.querySelector("#currency"),
  measureType: document.querySelector("#measure-type"),
  displayUnit: document.querySelector("#display-unit"),
  addItem: document.querySelector("#add-item"),
  items: document.querySelector("#items"),
  template: document.querySelector("#item-template"),
  winnerTitle: document.querySelector("#winner-title"),
  winnerDetail: document.querySelector("#winner-detail"),
  installStatus: document.querySelector("#install-status"),
};

let itemCount = 0;

function unitLabel(unit) {
  return `${unit[1]} (${unit[0].replace("_", " ")})`;
}

function currentMeasure() {
  return MEASURES[elements.measureType.value];
}

function currentDisplayUnit() {
  return currentMeasure().units.find((unit) => unit[0] === elements.displayUnit.value);
}

function formatMoney(value) {
  const currency = elements.currency.value.trim();

  if (!Number.isFinite(value)) {
    return "-";
  }

  if (/^[A-Za-z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: value < 1 ? 4 : 2,
      }).format(value);
    } catch {
      // Fall through to a text prefix for custom or unsupported codes.
    }
  }

  const amount = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
  return currency ? `${currency} ${amount}` : amount;
}

function fillMeasureControls() {
  for (const [key, measure] of Object.entries(MEASURES)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = measure.label;
    elements.measureType.append(option);
  }

  elements.measureType.value = "weight";
  fillDisplayUnits();
}

function fillDisplayUnits() {
  const measure = currentMeasure();
  elements.displayUnit.replaceChildren();

  measure.units.forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit[0];
    option.textContent = unitLabel(unit);
    elements.displayUnit.append(option);
  });

  elements.displayUnit.value = measure.baseLabel;
  fillItemUnits();
}

function fillItemUnits() {
  const measure = currentMeasure();
  const unitSelects = elements.items.querySelectorAll(".item-unit");

  unitSelects.forEach((select) => {
    const previous = select.value;
    select.replaceChildren();

    measure.units.forEach((unit) => {
      const option = document.createElement("option");
      option.value = unit[0];
      option.textContent = unitLabel(unit);
      select.append(option);
    });

    select.value = measure.units.some((unit) => unit[0] === previous)
      ? previous
      : measure.units[0][0];
  });

  updateResults();
}

function addItem(data = {}) {
  itemCount += 1;
  const defaultUnit = elements.displayUnit.value || currentMeasure().units[0][0];

  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".item-card");
  const name = fragment.querySelector(".item-name");
  const price = fragment.querySelector(".item-price");
  const amount = fragment.querySelector(".item-amount");
  const packCount = fragment.querySelector(".item-pack-count");
  const unit = fragment.querySelector(".item-unit");
  const remove = fragment.querySelector(".remove-item");

  name.value = data.name ?? `Item ${itemCount}`;
  price.value = data.price ?? "";
  amount.value = data.amount ?? "";
  packCount.value = data.packCount ?? 1;

  currentMeasure().units.forEach((measureUnit) => {
    const option = document.createElement("option");
    option.value = measureUnit[0];
    option.textContent = unitLabel(measureUnit);
    unit.append(option);
  });

  unit.value = data.unit || defaultUnit;

  card.addEventListener("input", updateResults);
  card.addEventListener("change", updateResults);
  remove.addEventListener("click", () => {
    const cards = elements.items.querySelectorAll(".item-card");
    if (cards.length <= 2) {
      card.querySelectorAll("input").forEach((input) => {
        if (input.classList.contains("item-name")) {
          input.value = name.value;
        } else if (input.classList.contains("item-pack-count")) {
          input.value = "1";
        } else {
          input.value = "";
        }
      });
    } else {
      card.remove();
    }
    updateResults();
  });

  elements.items.append(fragment);
  updateResults();
}

function readItems() {
  const measure = currentMeasure();

  return [...elements.items.querySelectorAll(".item-card")].map((card, index) => {
    const name = card.querySelector(".item-name").value.trim() || `Item ${index + 1}`;
    const price = Number(card.querySelector(".item-price").value);
    const amount = Number(card.querySelector(".item-amount").value);
    const rawPackCount = Number(card.querySelector(".item-pack-count").value);
    const packCount = Number.isFinite(rawPackCount) && rawPackCount > 0 ? rawPackCount : 1;
    const unitId = card.querySelector(".item-unit").value;
    const unit = measure.units.find((candidate) => candidate[0] === unitId);
    const baseAmount = unit ? amount * packCount * unit[2] : NaN;
    const unitPrice = price > 0 && baseAmount > 0 ? price / baseAmount : NaN;

    return { card, name, price, amount, packCount, unit, baseAmount, unitPrice };
  });
}

function formatAmount(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 3,
  }).format(value);
}

function updateResults() {
  const displayUnit = currentDisplayUnit();
  const displayFactor = displayUnit ? displayUnit[2] : 1;
  const displayName = displayUnit ? displayUnit[0].replace("_", " ") : currentMeasure().baseLabel;
  const items = readItems();
  const validItems = items.filter((item) => Number.isFinite(item.unitPrice));
  const sorted = [...validItems].sort((a, b) => a.unitPrice - b.unitPrice);
  const best = sorted[0];
  const second = sorted[1];

  items.forEach((item) => {
    const rank = item.card.querySelector(".item-rank");
    const price = item.card.querySelector(".item-unit-price");
    const breakdown = item.card.querySelector(".item-breakdown");
    item.card.classList.toggle("best", item === best && validItems.length > 1);

    if (!Number.isFinite(item.unitPrice)) {
      rank.textContent = "Waiting for details";
      price.textContent = "-";
      breakdown.textContent = "";
      return;
    }

    const perDisplayUnit = item.unitPrice * displayFactor;
    const position = sorted.indexOf(item) + 1;
    rank.textContent = item === best && validItems.length > 1 ? "Best value" : `Rank ${position}`;
    price.textContent = `${formatMoney(perDisplayUnit)} per ${displayName}`;
    breakdown.textContent =
      `${formatAmount(item.amount)} ${item.unit[0].replace("_", " ")} x ` +
      `${formatAmount(item.packCount)} packs = ` +
      `${formatAmount(item.baseAmount / displayFactor)} ${displayName}`;
  });

  if (validItems.length < 2) {
    elements.winnerTitle.textContent = "Add at least two complete items.";
    elements.winnerDetail.textContent = "Each item needs a price, amount, and unit.";
    return;
  }

  const bestPerDisplay = best.unitPrice * displayFactor;
  elements.winnerTitle.textContent = `${best.name} is the best value.`;

  if (second && second.unitPrice > best.unitPrice) {
    const savings = ((second.unitPrice - best.unitPrice) / second.unitPrice) * 100;
    elements.winnerDetail.textContent =
      `${formatMoney(bestPerDisplay)} per ${displayName}, about ` +
      `${savings.toFixed(1)}% cheaper than the next best option.`;
  } else {
    elements.winnerDetail.textContent =
      `${formatMoney(bestPerDisplay)} per ${displayName}. Multiple items are tied.`;
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    elements.installStatus.textContent = "Works in browser";
    return;
  }

  navigator.serviceWorker
    .register("sw.js")
    .then(() => {
      elements.installStatus.textContent = "Ready offline";
    })
    .catch(() => {
      elements.installStatus.textContent = "Offline after install";
    });
}

function init() {
  fillMeasureControls();
  DEFAULT_ITEMS.forEach(addItem);

  elements.addItem.addEventListener("click", () => addItem());
  elements.currency.addEventListener("input", updateResults);
  elements.measureType.addEventListener("change", fillDisplayUnits);
  elements.displayUnit.addEventListener("change", updateResults);

  registerServiceWorker();
}

init();
