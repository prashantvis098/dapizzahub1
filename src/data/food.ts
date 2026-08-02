import { SimpleItem } from "@/types";

// IMAGE NOTES: burger, fries, pasta, wrap, dessert, and shake images below
// are confirmed matches, verified via the banner text baked into each
// source photo. Mocktail images (mocktail-1 through mocktail-8) are
// generic mocktail-glass photos assigned in menu order — the source
// banner text for that batch wasn't legible enough to confirm which
// specific flavor each shows, so treat those 8 as interchangeable/generic
// rather than guaranteed-accurate per flavor.

export const burgers: SimpleItem[] = [
  { id: "aloo-tikki", name: "Aloo Tikki", category: "burger", price: 60, type: "simple", image: "/images/burger/aloo-tikki.webp" },
  { id: "crispy-veggie", name: "Crispy Veggie", category: "burger", price: 65, type: "simple", image: "/images/burger/crispy-veggie.webp" },
  { id: "spicy-veggie-burger", name: "Spicy Veggie", category: "burger", price: 65, type: "simple", image: "/images/burger/spicy-veggie-burger.webp" },
  { id: "king-special", name: "King Special", category: "burger", price: 70, type: "simple", image: "/images/burger/king-special.webp" },
  { id: "paneer-burger", name: "Paneer Burger", category: "burger", price: 80, type: "simple", image: "/images/burger/paneer-burger.webp", isBestSeller: true },
  { id: "tandoori-burger", name: "Tandoori Burger", category: "burger", price: 80, type: "simple", image: "/images/burger/tandoori-burger.webp" },
  { id: "spicy-burger", name: "Spicy Burger", category: "burger", price: 85, type: "simple", image: "/images/burger/spicy-burger.webp" },
  { id: "pizza-burger", name: "Pizza Burger", category: "burger", price: 85, type: "simple", image: "/images/burger/pizza-burger.webp" },
  { id: "cheese-burger", name: "Cheese Burger", category: "burger", price: 99, type: "simple", image: "/images/burger/cheese-burger.webp", isBestSeller: true },
  { id: "maharaja-burger", name: "Maharaja Burger", category: "burger", price: 99, type: "simple", image: "/images/burger/maharaja-burger.webp" },
];

export const burgerAddOn = { id: "add-cheese", name: "Add Cheese (any burger)", price: 15 };

export const fries: SimpleItem[] = [
  { id: "french-fries", name: "French Fries", category: "fries", price: 80, type: "simple", image: "/images/fries/masala-fries.webp", isBestSeller: true },
  { id: "kungfu-fries", name: "Kungfu Fries", category: "fries", price: 90, type: "simple", image: "/images/fries/kungfu-fries.webp" },
  { id: "crispers-fries", name: "Crispers Fries", category: "fries", price: 100, type: "simple", image: "/images/fries/crispers-fries.webp" },
  { id: "masala-fries", name: "Masala Fries", category: "fries", price: 80, type: "simple", image: "/images/fries/masala-fries.webp" },
  { id: "lemon-peri-peri-fries", name: "Lemon Peri Peri Fries", category: "fries", price: 90, type: "simple", image: "/images/fries/lemon-peri-peri-fries.webp" },
  { id: "cheese-fries", name: "Cheese Fries", category: "fries", price: 120, type: "simple", image: "/images/fries/cheese-fries.webp" },
];

export const pastas: SimpleItem[] = [
  { id: "white-sauce-pasta", name: "White Sauce Pasta", category: "pasta", price: 120, type: "simple", image: "/images/pasta/white-sauce-pasta.webp" },
  { id: "red-sauce-pasta", name: "Red Sauce Pasta", category: "pasta", price: 130, type: "simple", image: "/images/pasta/red-sauce-pasta.webp" },
  { id: "tandoori-sauce-pasta", name: "Tandoori Sauce Pasta", category: "pasta", price: 130, type: "simple", image: "/images/pasta/tandoori-sauce-pasta.webp" },
  { id: "mix-sauce-pasta", name: "Mix Sauce Pasta", category: "pasta", price: 140, type: "simple", image: "/images/pasta/white-sauce-pasta.webp", isBestSeller: true },
];

export const wraps: SimpleItem[] = [
  { id: "indian-veg-wrap", name: "Indian Veg. Wrap", category: "wrap", price: 80, type: "simple", image: "/images/wrap/indian-veg-wrap.webp" },
  { id: "indian-paneer-wrap", name: "Indian Paneer Wrap", category: "wrap", price: 99, type: "simple", image: "/images/wrap/indian-veg-wrap.webp" },
  { id: "mexican-aloo-tikki-wrap", name: "Mexican Aloo Tikki Wrap", category: "wrap", price: 99, type: "simple", image: "/images/wrap/mexican-aloo-tikki-wrap.webp" },
];

export const breads: SimpleItem[] = [
  { id: "stuffed-garlic-bread", name: "Stuffed Garlic Bread", category: "bread", price: 130, type: "simple", image: "/images/gallery/insta-1.webp", isBestSeller: true },
  { id: "garlic-bread", name: "Garlic Bread", category: "bread", price: 80, type: "simple", image: "/images/gallery/insta-2.webp" },
  { id: "garlic-bread-cheese", name: "Garlic Bread Cheese", category: "bread", price: 110, type: "simple", image: "/images/gallery/insta-3.webp" },
  { id: "tandoori-garlic", name: "Tandoori Garlic", category: "bread", price: 140, type: "simple", image: "/images/gallery/insta-4.webp" },
  { id: "cheese-dip", name: "Cheese Dip", category: "bread", price: 30, type: "simple", image: "/images/gallery/insta-5.webp" },
  { id: "jalapeno-dip", name: "Jalapeno Dip", category: "bread", price: 30, type: "simple", image: "/images/gallery/insta-6.webp" },
];

export const otherSides: SimpleItem[] = [
  { id: "calzone", name: "Calzone", category: "sides-other", price: 110, type: "simple", image: "/images/gallery/insta-7.webp" },
  { id: "pocket-parcel", name: "Pocket Parcel", category: "sides-other", price: 50, type: "simple", image: "/images/gallery/insta-8.webp" },
  { id: "cheesy-spicy-twists", name: "Cheesy Spicy Twists", category: "sides-other", price: 90, type: "simple", image: "/images/bread/cheesy-spicy-twists.webp" },
  { id: "cheesy-paneer-spicy-twists", name: "Cheesy Paneer Spicy Twists", category: "sides-other", price: 110, type: "simple", image: "/images/bread/cheesy-paneer-spicy-twists.webp" },
];

export const desserts: SimpleItem[] = [
  { id: "choco-lava-cake", name: "Choco Lava Cake", category: "dessert", price: 80, type: "simple", image: "/images/dessert/choco-lava-cake.webp", isBestSeller: true },
];

export const shakes: SimpleItem[] = [
  { id: "vanilla-shake", name: "Vanilla Shake", category: "shake", price: 80, type: "simple", image: "/images/shake/vanilla-shake.webp" },
  { id: "chocolate-shake", name: "Chocolate Shake", category: "shake", price: 80, type: "simple", image: "/images/shake/chocolate-shake.webp", isBestSeller: true },
  { id: "strawberry-shake", name: "Strawberry Shake", category: "shake", price: 80, type: "simple", image: "/images/shake/strawberry-shake.webp" },
  { id: "butter-scotch-shake", name: "Butter Scotch Shake", category: "shake", price: 80, type: "simple", image: "/images/shake/butter-scotch-shake.webp" },
  { id: "hot-coffee", name: "Hot Coffee", category: "shake", price: 50, type: "simple", image: "/images/shake/hot-coffee.webp" },
  { id: "cold-coffee", name: "Cold Coffee", category: "shake", price: 80, type: "simple", image: "/images/shake/cold-coffee.webp" },
  { id: "pan-shake", name: "Pan Shake", category: "shake", price: 90, type: "simple", image: "/images/shake/pan-shake.webp" },
  { id: "saffron-sweet-shake", name: "Saffron Sweet Shake", category: "shake", price: 90, type: "simple", image: "/images/shake/saffron-sweet-shake.webp" },
];

// Mocktail images are generic (see note above) — same visual style/quality,
// just not verified per-flavor. Replace with confirmed photos if/when available.
export const mocktails: SimpleItem[] = [
  { id: "lemon-mint-mojito", name: "Lemon Mint Mojito", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-1.webp" },
  { id: "blue-lagoon", name: "Blue Lagoon", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-2.webp" },
  { id: "green-apple-fizz", name: "Green Apple Fizz", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-3.webp" },
  { id: "spicy-jamun-fizz", name: "Spicy Jamun Fizz", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-4.webp" },
  { id: "lemon-ice-tea", name: "Lemon Ice Tea", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-5.webp" },
  { id: "masala-lemonade", name: "Masala Lemonade", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-6.webp" },
  { id: "kala-khatta", name: "Kala Khatta", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-7.webp" },
  { id: "peach-mojito", name: "Peach Mojito", category: "mocktail", price: 80, type: "simple", image: "/images/mocktail/mocktail-8.webp" },
];

export const foodCombos = [
  { id: "combo-1", name: "2 Burger + French Fries + Coke", description: "2 Person", price: null as number | null, note: "Ask branch for combo pricing" },
  { id: "combo-2", name: "Burger + Cold Coffee + French Fries", description: "1 Person", price: null },
  { id: "combo-3", name: "Regular Pizza + 2 Burger + Coke", description: "2 Person", price: null },
  { id: "combo-4", name: "2 Small Pizza + Garlic Bread + Coke", description: "3 Person", price: null },
  { id: "combo-5", name: "Large Pizza + Garlic Bread + Coke", description: "Family Combo", price: null },
];

export const allFoodItems: SimpleItem[] = [
  ...burgers,
  ...fries,
  ...pastas,
  ...wraps,
  ...breads,
  ...otherSides,
  ...desserts,
  ...shakes,
  ...mocktails,
];