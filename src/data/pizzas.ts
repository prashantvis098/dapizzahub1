import { PizzaItem } from "@/types";

// Transcribed directly from Da Pizza Hub's printed menu.
// All prices in INR. GST extra as applicable (shown at checkout).
//
// IMAGE NOTES:
// Only pizzas with a confirmed ingredient-labeled source photo get a
// specific matching image (see /public/images/pizza-named/). Every other
// pizza uses a generic whole-pizza photo from /public/images/pizza-generic/
// — these are real, on-brand Da Pizza Hub photos, just not verified to
// show that exact topping combination. This is intentional: it's more
// honest than guessing which unlabeled photo matches which dish.
export const pizzas: PizzaItem[] = [
  // ---------------- ROYAL SPECIAL ----------------
  {
    id: "da-paneer-special",
    name: "Da Paneer Special",
    description: "Black olive, jalapeno, corn, capsicum, red pepper & paneer, pasta topping",
    category: "royal-special",
    prices: { regular: 250, medium: 430, large: 599 },
    image: "/images/pizza-named/da-paneer-special.webp",
    type: "pizza",
    isBestSeller: true,
  },
  {
    id: "tandoori-pizza",
    name: "Tandoori Pizza",
    description: "Onion, red pepper, capsicum, corn, jalapeno, spicy tandoori sauce",
    category: "royal-special",
    prices: { regular: 250, medium: 430, large: 599 },
    image: "/images/pizza-generic/pizza-1.webp",
    type: "pizza",
  },
  {
    id: "veg-extra-vaganza",
    name: "Veg Extra Vaganza",
    description: "Onion, capsicum, mushroom, corn, black olive, jalapeno, tomato, extra cheese",
    category: "royal-special",
    prices: { regular: 250, medium: 430, large: 599 },
    image: "/images/pizza-generic/pizza-2.webp",
    type: "pizza",
  },
  {
    id: "tandoori-paneer-pizza",
    name: "Tandoori Paneer Pizza",
    description: "Onion, red pepper, capsicum, jalapeno, spicy tandoori paneer",
    category: "royal-special",
    prices: { regular: 250, medium: 430, large: 599 },
    image: "/images/pizza-generic/pizza-3.webp",
    type: "pizza",
  },

  // ---------------- VEG SPECIAL ----------------
  {
    id: "chefs-special",
    name: "Chef's Special",
    description: "Mushroom, jalapeno, corn, capsicum, red pepper & paneer",
    category: "veg-special",
    prices: { regular: 219, medium: 410, large: 579 },
    image: "/images/pizza-named/chefs-special.webp",
    type: "pizza",
    isBestSeller: true,
  },
  {
    id: "veg-exotica",
    name: "Veg. Exotica",
    description: "Onion, capsicum, red pepper, black olive & cheese",
    category: "veg-special",
    prices: { regular: 219, medium: 410, large: 579 },
    image: "/images/pizza-named/veg-exotica.webp",
    type: "pizza",
  },
  {
    id: "deluxe-veggie-delight",
    name: "Deluxe Veggie Delight",
    description: "Onion, capsicum, mushroom, corn, paneer & cheese",
    category: "veg-special",
    prices: { regular: 219, medium: 410, large: 579 },
    image: "/images/pizza-named/deluxe-veggie-delight.webp",
    type: "pizza",
  },
  {
    id: "veggie-paradise",
    name: "Veggie Paradise",
    description: "Capsicum, red pepper, corn, black olive",
    category: "veg-special",
    prices: { regular: 219, medium: 410, large: 579 },
    image: "/images/pizza-named/veggie-paradise.webp",
    type: "pizza",
  },

  // ---------------- VEG FEAST PIZZA ----------------
  {
    id: "farm-house-pizza",
    name: "Farm House Pizza",
    description: "Capsicum, onion, mushroom, tomato & cheese",
    category: "veg-feast",
    prices: { regular: 199, medium: 379, large: 499 },
    image: "/images/pizza-named/farm-house-pizza.webp",
    type: "pizza",
    isBestSeller: true,
  },
  {
    id: "peppy-paneer-special",
    name: "Peppy Paneer Special",
    description: "Paneer, capsicum, red pepper",
    category: "veg-feast",
    prices: { regular: 199, medium: 379, large: 499 },
    image: "/images/pizza-named/peppy-paneer-special.webp",
    type: "pizza",
  },
  {
    id: "gourmet-pizza",
    name: "Gourmet Pizza",
    description: "Corn, jalapeno, black olive & cheese",
    category: "veg-feast",
    prices: { regular: 199, medium: 379, large: 499 },
    image: "/images/pizza-named/gourmet-pizza.webp",
    type: "pizza",
  },
  {
    id: "maxican-green",
    name: "Maxican Green",
    description: "Onion, capsicum, jalapeno, tomato & cheese",
    category: "veg-feast",
    prices: { regular: 199, medium: 379, large: 499 },
    image: "/images/pizza-named/maxican-green.webp",
    type: "pizza",
  },

  // ---------------- VEG DELIGHT ----------------
  {
    id: "spicy-triple-tangy-twist",
    name: "Spicy Triple Tangy Twist",
    description: "Corn, jalapeno & tomato",
    category: "veg-delight",
    prices: { regular: 169, medium: 329, large: 479 },
    image: "/images/pizza-generic/pizza-4.webp",
    type: "pizza",
  },
  {
    id: "super-soft-pizza",
    name: "Super Soft Pizza",
    description: "Capsicum, onion, paneer & cheese",
    category: "veg-delight",
    prices: { regular: 169, medium: 329, large: 479 },
    image: "/images/pizza-named/super-soft-pizza.webp",
    type: "pizza",
  },
  {
    id: "spicy-veggie",
    name: "Spicy Veggie",
    description: "Onion, capsicum, corn, spicy & cheese",
    category: "veg-delight",
    prices: { regular: 169, medium: 329, large: 479 },
    image: "/images/pizza-named/spicy-veggie.webp",
    type: "pizza",
  },
  {
    id: "country-special",
    name: "Country Special",
    description: "Onion, capsicum, tomato & cheese",
    category: "veg-delight",
    prices: { regular: 169, medium: 329, large: 479 },
    image: "/images/pizza-named/country-special.webp",
    type: "pizza",
  },

  // ---------------- VEG TREAT ----------------
  {
    id: "double-cheese-margherita",
    name: "Double Cheese Margherita",
    description: "Double cheese, extra cheese",
    category: "veg-treat",
    prices: { regular: 149, medium: 299, large: 449 },
    image: "/images/pizza-generic/pizza-5.webp",
    type: "pizza",
    isBestSeller: true,
  },
  {
    id: "fresh-veggie",
    name: "Fresh Veggie",
    description: "Onion & capsicum",
    category: "veg-treat",
    prices: { regular: 149, medium: 299, large: 449 },
    image: "/images/pizza-generic/pizza-6.webp",
    type: "pizza",
  },
  {
    id: "cheese-and-corn",
    name: "Cheese & Corn",
    description: "Corn & cheese",
    category: "veg-treat",
    prices: { regular: 149, medium: 299, large: 449 },
    image: "/images/pizza-generic/pizza-7.webp",
    type: "pizza",
  },
  {
    id: "cheese-and-paneer",
    name: "Cheese & Paneer",
    description: "Paneer & cheese",
    category: "veg-treat",
    prices: { regular: 149, medium: 299, large: 449 },
    image: "/images/pizza-generic/pizza-8.webp",
    type: "pizza",
  },
  {
    id: "cheese-and-mushroom",
    name: "Cheese & Mushroom",
    description: "Mushroom & cheese",
    category: "veg-treat",
    prices: { regular: 149, medium: 299, large: 449 },
    image: "/images/pizza-generic/pizza-9.webp",
    type: "pizza",
  },
  {
    id: "cheese-red-pepper",
    name: "Cheese Red Pepper",
    description: "Cheese & red pepper",
    category: "veg-treat",
    prices: { regular: 149, medium: 299, large: 449 },
    image: "/images/pizza-generic/pizza-10.webp",
    type: "pizza",
    isNew: true,
  },

  // ---------------- SIMPLY VEG ----------------
  {
    id: "margherita-single-cheese",
    name: "Margherita",
    description: "Single cheese topping",
    category: "simply-veg",
    prices: { regular: 120, medium: 229, large: 369 },
    image: "/images/pizza-generic/pizza-11.webp",
    type: "pizza",
  },
  {
    id: "margherita-cheese-tomato",
    name: "Margherita",
    description: "Cheese & tomato",
    category: "simply-veg",
    prices: { regular: 120, medium: 229, large: 369 },
    image: "/images/pizza-generic/pizza-12.webp",
    type: "pizza",
  },
];

export const doublePizzas = [
  { id: "paneer-onion", name: "Paneer Onion", price: 110 },
  { id: "onion-capsicum", name: "Onion Capsicum", price: 110 },
  { id: "tomato-corn", name: "Tomato Corn", price: 110 },
  { id: "red-paper-onion", name: "Red Paper Onion", price: 110 },
  { id: "cheesy-pizza", name: "Cheesy Pizza", price: 120 },
  { id: "veg-loaded-pizza", name: "Veg. Loaded Pizza", price: 120 },
];

export const veganSinglePizza = {
  id: "veg-single-pizza",
  name: "Veg Single Pizza",
  description: "Onion, capsicum, tomato, corn",
  price: 80,
};

export const pizzaAddOns = {
  extraCheese: { regular: 40, medium: 60, large: 80 },
  cheeseBurst: { regular: 65, medium: 85, large: 120 },
  panBase: { regular: 20, medium: 40, large: 40 }, // large uses medium rate per menu (no large listed)
};

export const vegVegetableToppings = [
  { id: "olive", name: "Olive" },
  { id: "tomato", name: "Tomato" },
  { id: "onion", name: "Onion" },
  { id: "paneer", name: "Paneer" },
  { id: "capsicum", name: "Capsicum" },
  { id: "mushroom", name: "Mushroom" },
  { id: "corn", name: "Corn" },
  { id: "jalapeno", name: "Jalapeno" },
];

export const vegVegetablePricing = { regular: 30, medium: 45, large: 55 };

export const pizzaCombos = [
  { id: "veg-single-combo", name: "Veg Single Pizza Combo", price: 300 },
  { id: "veg-double-combo", name: "Veg Double Pizza Combo", price: 380 },
  { id: "veg-treat-combo-4", name: "Veg Treat Pizza Combo-4", price: 550 },
  { id: "veg-delight-combo-4", name: "Veg Delight Pizza Combo-4", price: 600 },
  { id: "veg-feast-combo-4", name: "Veg Feast Pizza Combo-4", price: 750 },
  { id: "veg-special-combo-4", name: "Veg Special Pizza Combo-4", price: 800 },
];

export const sizeLabels: Record<"regular" | "medium" | "large", { label: string; note: string }> = {
  regular: { label: "Regular", note: '7" · Serves 1' },
  medium: { label: "Medium", note: '10" · Serves 2' },
  large: { label: "Large", note: '13" · Serves 4' },
};