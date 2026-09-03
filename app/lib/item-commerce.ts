import commerceData from './item-commerce-data.json';

export type ItemShopListing = {
  shop: string;
  quantity: number;
  purchasePrice?: number;
  additionalCosts?: Array<{
    name: string;
    count: number;
  }>;
};

export type ItemCommerceInfo = {
  name: string;
  baseValue?: number;
  shopBuyBack?: number;
  listings: ItemShopListing[];
};

export const SHOP_BUY_BACK_RATE = commerceData.shopBuyBackRate;
export const ITEM_COMMERCE_SOURCE = commerceData.source;

const itemValues = commerceData.itemValues as Record<string, number | null>;

function normalizedItemName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const itemNameByNormalizedName = new Map(
  Object.keys(itemValues).map((name) => [normalizedItemName(name), name]),
);

const listingsByNormalizedName = new Map<string, ItemShopListing[]>();
const listingNameByNormalizedName = new Map<string, string>();
for (const shop of commerceData.shops) {
  for (const listing of shop.listings) {
    const key = normalizedItemName(listing.item);
    listingNameByNormalizedName.set(key, listing.item);
    const listings = listingsByNormalizedName.get(key) ?? [];
    listings.push({
      shop: shop.name,
      quantity: listing.quantity,
      purchasePrice: listing.price ?? undefined,
      additionalCosts: 'additionalCosts' in listing ? listing.additionalCosts : undefined,
    });
    listingsByNormalizedName.set(key, listings);
  }
}

const aliases = new Map<string, string>([
  [normalizedItemName('Coal'), normalizedItemName('Coal Ore')],
]);

const potionFamilies = [
  'Weak Health Potion',
  'Fishing Potion',
  'Shields Potion',
  'Mining Potion',
  'Health Potion',
  'Attack Potion',
  'Archery Potion',
  'Magic Potion',
  'Strong Health Potion',
  'Strong Shields Potion',
] as const;

const potionFamilyByNormalizedName = new Map<string, string>();
for (const family of potionFamilies) {
  potionFamilyByNormalizedName.set(normalizedItemName(family), family);
  potionFamilyByNormalizedName.set(normalizedItemName(family.replace('Shields', 'Shield')), family);
}

function resolvedItemName(value: string) {
  let key = normalizedItemName(value);
  key = aliases.get(key) ?? key;
  const direct = itemNameByNormalizedName.get(key);
  if (direct) return direct;
  const directListing = listingNameByNormalizedName.get(key);
  if (directListing) return directListing;

  // Older pages sometimes use singular "Shield" where the current data
  // asset uses "Shields". Keep that spelling alias away from unrelated names.
  key = key.replace('strongshieldpotion', 'strongshieldspotion').replace('shieldpotion', 'shieldspotion');
  return itemNameByNormalizedName.get(key) ?? listingNameByNormalizedName.get(key);
}

function buyBackFor(baseValue: number) {
  // The live shop component exposes a 0.7 buy-back rate. Shop currency is an
  // integer, and the game's shop calculations round fractional Coins upward.
  return Math.ceil(baseValue * SHOP_BUY_BACK_RATE);
}

export function potionFamilyForItem(names: string[]) {
  for (const name of names) {
    const family = potionFamilyByNormalizedName.get(normalizedItemName(name));
    if (family) return family;
  }
  return undefined;
}

export function itemCommerceInfoFor(names: string[]): ItemCommerceInfo | undefined {
  // A potion family is not one physical item: the vial size changes both its
  // value and its shop listing. Its three physical variants are handled below.
  if (potionFamilyForItem(names)) return undefined;

  for (const candidate of names) {
    const name = resolvedItemName(candidate);
    if (!name || name === 'Coins') continue;
    const baseValue = itemValues[name];
    const listings = listingsByNormalizedName.get(normalizedItemName(name)) ?? [];
    if (baseValue === undefined && listings.length === 0) continue;
    return {
      name,
      baseValue: baseValue ?? undefined,
      shopBuyBack: baseValue == null ? undefined : buyBackFor(baseValue),
      listings,
    };
  }
  return undefined;
}

export function potionVariantCommerceFor(names: string[]) {
  const family = potionFamilyForItem(names);
  if (!family) return [];
  return ['Small', 'Large', 'Gilded']
    .map((size) => itemCommerceInfoFor([`${size} ${family}`]))
    .filter((item): item is ItemCommerceInfo => Boolean(item));
}
