/**
 * Common constants for furniture product attributes
 * Used in admin dashboard for product management
 */

export const PRODUCT_MATERIALS = [
  'Wood',
  'Metal',
  'Leather',
  'Fabric',
  'Glass',
  'Plastic',
  'Rattan',
  'Bamboo',
  'MDF',
  'Particle Board',
  'Solid Wood',
  'Veneer',
  'Marble',
  'Stone',
  'Composite',
  'Upholstery',
] as const;

export const PRODUCT_STYLES = [
  'Modern',
  'Contemporary',
  'Traditional',
  'Classic',
  'Minimalist',
  'Industrial',
  'Scandinavian',
  'Rustic',
  'Bohemian',
  'Mid-Century Modern',
  'Art Deco',
  'Victorian',
  'Transitional',
  'Coastal',
  'Farmhouse',
  'Shabby Chic',
] as const;

export const PRODUCT_COLORS = [
  'Black',
  'White',
  'Gray',
  'Beige',
  'Brown',
  'Oak',
  'Walnut',
  'Cherry',
  'Mahogany',
  'Espresso',
  'Natural Wood',
  'Cream',
  'Ivory',
  'Charcoal',
  'Navy',
  'Blue',
  'Green',
  'Red',
  'Yellow',
  'Multi-Color',
] as const;

export const PRODUCT_FINISHES = [
  'Matte',
  'Glossy',
  'Satin',
  'Brushed',
  'Polished',
  'Distressed',
  'Antique',
  'Natural',
  'Stained',
  'Painted',
  'Lacquered',
] as const;

export const FURNITURE_CATEGORIES = [
  'Sofa',
  'Bed',
  'Chair',
  'Table',
  'Dining Table',
  'Coffee Table',
  'Side Table',
  'Desk',
  'Cabinet',
  'Wardrobe',
  'Dresser',
  'Bookshelf',
  'Storage',
  'Ottoman',
  'Bench',
  'Stool',
  'Nightstand',
  'TV Stand',
  'Console Table',
  'Bar Stool',
  'Dining Chair',
  'Armchair',
  'Recliner',
  'Sectional',
  'Loveseat',
  'Futon',
] as const;

export const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Office',
  'Kitchen',
  'Bathroom',
  'Outdoor',
  'Entryway',
  'Hallway',
  'Nursery',
  'Kids Room',
  'Patio',
  'Balcony',
] as const;

export const CONDITION_OPTIONS = [
  'New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
] as const;

export const WARRANTY_OPTIONS = [
  'No Warranty',
  '1 Year',
  '2 Years',
  '3 Years',
  '5 Years',
  '10 Years',
  'Lifetime',
] as const;

export const DELIVERY_OPTIONS = [
  'Standard Delivery',
  'Express Delivery',
  'White Glove Delivery',
  'Pickup Only',
  'Free Shipping',
] as const;

// Type definitions for TypeScript
export type ProductMaterial = typeof PRODUCT_MATERIALS[number];
export type ProductStyle = typeof PRODUCT_STYLES[number];
export type ProductColor = typeof PRODUCT_COLORS[number];
export type ProductFinish = typeof PRODUCT_FINISHES[number];
export type FurnitureCategory = typeof FURNITURE_CATEGORIES[number];
export type RoomType = typeof ROOM_TYPES[number];
export type ConditionOption = typeof CONDITION_OPTIONS[number];
export type WarrantyOption = typeof WARRANTY_OPTIONS[number];
export type DeliveryOption = typeof DELIVERY_OPTIONS[number];

// Helper function to get all constants as arrays for dropdowns
export const getProductConstants = () => ({
  materials: [...PRODUCT_MATERIALS],
  styles: [...PRODUCT_STYLES],
  colors: [...PRODUCT_COLORS],
  finishes: [...PRODUCT_FINISHES],
  categories: [...FURNITURE_CATEGORIES],
  roomTypes: [...ROOM_TYPES],
  conditions: [...CONDITION_OPTIONS],
  warranties: [...WARRANTY_OPTIONS],
  deliveryOptions: [...DELIVERY_OPTIONS],
});


