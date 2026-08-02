export type SizeKey = "regular" | "medium" | "large";

export interface SizePricing {
  regular: number;
  medium: number;
  large: number;
}

export type MenuCategory =
  | "royal-special"
  | "veg-special"
  | "veg-feast"
  | "veg-delight"
  | "veg-treat"
  | "simply-veg"
  | "burger"
  | "fries"
  | "pasta"
  | "wrap"
  | "bread"
  | "sides-other"
  | "shake"
  | "mocktail"
  | "double-pizza"
  | "combo"
  | "dessert";

export interface PizzaItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  isNew?: boolean;
  isBestSeller?: boolean;
  prices: SizePricing;
  image: string;
  type: "pizza";
}

export interface SimpleItem {
  id: string;
  name: string;
  description?: string;
  category: MenuCategory;
  price: number;
  image?: string;
  isBestSeller?: boolean;
  type: "simple";
}

export type MenuItem = PizzaItem | SimpleItem;

export interface ComboItem {
  id: string;
  name: string;
  description: string;
  price: number;
  people: string;
  image: string;
}

export interface ToppingOption {
  id: string;
  name: string;
  category: "veg-topping";
}

// ---- Cart ----

export interface PizzaCustomization {
  size: SizeKey;
  extraCheese: boolean;
  cheeseBurst: boolean;
  panBase: boolean;
  extraToppings: string[]; // topping ids
}

export interface CartLine {
  lineId: string;
  itemId: string;
  name: string;
  image?: string;
  basePrice: number;
  quantity: number;
  customization?: PizzaCustomization;
  customizationSummary?: string;
  unitPrice: number; // basePrice + customization additions
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
  swiggyUrl?: string;
  zomatoUrl?: string;
  lat: number;
  lng: number;
}
