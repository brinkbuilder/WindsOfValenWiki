import assert from 'node:assert/strict';
import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync(new URL('../app/lib/item-commerce-data.json', import.meta.url), 'utf8'));
const allListings = data.shops.flatMap((shop) => shop.listings.map((listing) => ({ ...listing, shop: shop.name })));

function listingsFor(item) {
  return allListings.filter((listing) => listing.item === item);
}

function purchase(item, shop) {
  return listingsFor(item).find((listing) => listing.shop === shop)?.price;
}

function shopBuyBack(item) {
  return Math.ceil(data.itemValues[item] * data.shopBuyBackRate);
}

assert.equal(data.source.gameBuild, 'ProjectSandbox 5.7.4');
assert.equal(data.shopBuyBackRate, 0.7);
assert.equal(data.shops.length, 37, 'All extracted shop inventories must remain present.');
assert.equal(allListings.length, 154, 'All extracted merchant listings must remain present.');

assert.equal(listingsFor('Archery Potion').length, 0);
assert.equal(listingsFor('Small Archery Potion').length, 0);
assert.equal(listingsFor('Large Archery Potion').length, 0);
assert.equal(listingsFor('Gilded Archery Potion').length, 0);
assert.equal(data.itemValues['Small Archery Potion'], 46);
assert.equal(data.itemValues['Large Archery Potion'], 100);
assert.equal(data.itemValues['Gilded Archery Potion'], 185);
assert.equal(shopBuyBack('Small Archery Potion'), 33);
assert.equal(shopBuyBack('Large Archery Potion'), 70);
assert.equal(shopBuyBack('Gilded Archery Potion'), 130);

assert.equal(data.itemValues['Gold Bar'], 1000);
assert.equal(shopBuyBack('Gold Bar'), 700);
assert.equal(listingsFor('Gold Bar').length, 0);

assert.equal(data.itemValues['Ore Sack'], 250);
assert.equal(shopBuyBack('Ore Sack'), 175);
assert.equal(purchase('Ore Sack', 'Grave Town Mining Stall'), 350);
assert.equal(purchase('Iron Ore', 'Mining Stall'), 6);
assert.equal(purchase('Iron Ore', 'Grave Town Mining Stall'), 6);
assert.equal(purchase('Iron Sword', 'Valen City Weapon'), 175);
assert.equal(purchase('Steel Sword', 'Valen City Weapon'), 1020);
assert.equal(purchase('Smithing Hammer', 'Smithing Stall'), 10);
assert.equal(purchase('Bronze Bar', 'Smithing Stall'), 8);
assert.equal(purchase('Iron Bar', 'Smithing Stall'), 24);
assert.equal(purchase('Small Fang', 'Potion Ingredients'), 75);
assert.equal(purchase('Mud Root', 'Potion Ingredients'), 60);

assert.equal(purchase('Small Weak Health Potion', 'Potion Stall'), 10);
assert.equal(purchase('Large Health Potion', 'Potion Stall'), 100);
assert.equal(purchase('Large Strong Health Potion', 'Potion Stall'), 1000);
assert.equal(purchase('Large Shields Potion', 'Potion Stall'), 300);
assert.equal(purchase('Large Strong Shields Potion', 'Potion Stall'), 3000);

const roughLeatherService = listingsFor('Rough Leather').find((listing) => listing.shop === 'Hide Tanning Stall');
assert.equal(roughLeatherService?.price, 5);
assert.deepEqual(roughLeatherService?.additionalCosts, [{ name: 'Cowhide', count: 1 }]);
const thickVestService = listingsFor('Thick Leather Vest Line').find((listing) => listing.shop === 'Leatherworking Services');
assert.equal(thickVestService?.price, 100);
assert.deepEqual(thickVestService?.additionalCosts, [{ name: 'Thick Leather', count: 4 }]);
const exquisiteVestService = listingsFor('Exquisite Silk Vest Line').find((listing) => listing.shop === 'Tailoring Services');
assert.equal(exquisiteVestService?.price, 10000);
assert.deepEqual(exquisiteVestService?.additionalCosts, [{ name: 'Exquisite Silk', count: 6 }]);

const valenPotionStock = data.shops.find((shop) => shop.name === 'Valen City Potion Store')?.listings ?? [];
assert.deepEqual(
  valenPotionStock.filter((listing) => /Potion$/.test(listing.item)).map((listing) => listing.item),
  ['Small Weak Health Potion', 'Large Health Potion', 'Large Strong Health Potion', 'Large Shields Potion', 'Large Strong Shields Potion'],
);

const wikiDataSource = fs.readFileSync(new URL('../app/lib/wiki-data.ts', import.meta.url), 'utf8');
const itemDataSource = fs.readFileSync(new URL('../app/lib/item-data.ts', import.meta.url), 'utf8');
assert.doesNotMatch(wikiDataSource, /itemStoreInfo/);
assert.doesNotMatch(itemDataSource, /itemStoreInfo/);
assert.match(wikiDataSource, /No current merchant inventory/);
assert.match(wikiDataSource, /Shop prices by vial size/);

console.log(`Verified ${data.shops.length} shop inventories, ${allListings.length} listings, and ${Object.keys(data.itemValues).length} item values.`);
