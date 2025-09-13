export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum ProductCategory {
  SUPPLEMENTS = 'supplements',
  EQUIPMENT = 'equipment',
  APPAREL = 'apparel',
  ACCESSORIES = 'accessories',
  FOOD = 'food',
  DRINKS = 'drinks',
  OTHER = 'other',
}

export enum StockOperation {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
  RESERVE = 'reserve',
  RELEASE = 'release',
}

export enum PriceType {
  REGULAR = 'regular',
  SALE = 'sale',
  MEMBER = 'member',
  WHOLESALE = 'wholesale',
}

export const PRODUCT_CONSTANTS = {
  DEFAULT_LOW_STOCK_THRESHOLD: 10,
  MAX_IMAGES: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
