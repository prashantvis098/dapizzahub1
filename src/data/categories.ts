import { MenuCategory } from "@/types";

export interface CategoryConfig {
  key: MenuCategory | "all" | "pizza";
  label: string;
}

export const categoryGroups: { label: string; categories: CategoryConfig[] }[] = [
  {
    label: "Pizza",
    categories: [
      { key: "royal-special", label: "Royal Special" },
      { key: "veg-special", label: "Veg Special" },
      { key: "veg-feast", label: "Veg Feast" },
      { key: "veg-delight", label: "Veg Delight" },
      { key: "veg-treat", label: "Veg Treat" },
      { key: "simply-veg", label: "Simply Veg" },
    ],
  },
  {
    label: "More",
    categories: [
      { key: "burger", label: "Burgers" },
      { key: "fries", label: "Fries" },
      { key: "pasta", label: "Pasta" },
      { key: "wrap", label: "Wraps" },
      { key: "bread", label: "Garlic Bread" },
      { key: "sides-other", label: "Snacks" },
      { key: "shake", label: "Shakes" },
      { key: "mocktail", label: "Mocktails" },
      { key: "dessert", label: "Desserts" },
    ],
  },
];

export const flatCategories: CategoryConfig[] = categoryGroups.flatMap((g) => g.categories);
