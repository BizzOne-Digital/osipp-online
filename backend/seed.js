require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Settings = require('./models/Settings');
const Promotion = require('./models/Promotion');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/osipp_delivery';

const products = [
  {
    "name": "Crown Royal",
    "volume": "375ML",
    "price": 19.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal",
    "volume": "750ML",
    "price": 31.45,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Crown Royal",
    "volume": "1.14L",
    "price": 47.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal",
    "volume": "1.75L",
    "price": 70.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal",
    "volume": "3L",
    "price": 143.45,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Black",
    "volume": "750ML",
    "price": 37.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Black",
    "volume": "1.14L",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Blackberry",
    "volume": "750ml",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Vanilla",
    "volume": "750ml",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Chocolate",
    "volume": "750ml",
    "price": 35.0,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Peach",
    "volume": "750ml",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Apple",
    "volume": "375ml",
    "price": 19.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Apple",
    "volume": "750ml",
    "price": 32.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Crown Royal Rye",
    "volume": "750ml",
    "price": 37.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal XO",
    "volume": "750ml",
    "price": 79.45,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Reserve",
    "volume": "12yr",
    "price": 59.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crown Royal Extra Rare",
    "volume": "18yr",
    "price": 209.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "200ml",
    "price": 9.9,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "375ml",
    "price": 17.5,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "750ml",
    "price": 31.15,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "1.14L",
    "price": 46.85,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "1.75L",
    "price": 69.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "3L",
    "price": 142.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "12yr",
    "price": 19.5,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "12yr",
    "price": 35.05,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "12yr",
    "price": 47.4,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Canadian Club",
    "volume": "12yr",
    "price": 71.55,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Canadian Club 100% Rye",
    "volume": "375ml",
    "price": 18.4,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club 100% Rye",
    "volume": "750ml",
    "price": 31.15,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club 100% Rye",
    "volume": "1.14L",
    "price": 48.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "200ml",
    "price": 9.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "375ml",
    "price": 18.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "750ml",
    "price": 31.45,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "1.14L",
    "price": 47.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "1.75L",
    "price": 70.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "3L",
    "price": 142.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's Old Fashioned",
    "volume": "750ml",
    "price": 33.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "10yr",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "15yr",
    "price": 56.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's",
    "volume": "18yr",
    "price": 93.25,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's Apple",
    "volume": "750ml",
    "price": 32.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "J.P. Wiser's Vanilla",
    "volume": "750ml",
    "price": 32.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Forty Creek Barrel Select",
    "volume": "200ml",
    "price": 9.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Forty Creek Barrel Select",
    "volume": "375ml",
    "price": 17.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Forty Creek Barrel Select",
    "volume": "750ml",
    "price": 32.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Forty Creek Barrel Select",
    "volume": "1.14L",
    "price": 47.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Forty Creek Barrel Select",
    "volume": "1.75L",
    "price": 70.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Forty Creek Double Barrel Reserve",
    "volume": "750ml",
    "price": 42.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Forty Creek Honey Spiced",
    "volume": "750ml",
    "price": 32.85,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Forty Creek Copper Bold",
    "volume": "750ml",
    "price": 36.75,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wayne Gretzky Red Cask",
    "volume": "375ml",
    "price": 19.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wayne Gretzky Red Cask",
    "volume": "750ml",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Wayne Gretzky Red Cask",
    "volume": "1.14L",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wayne Gretzky Double Barrel Oaked",
    "volume": "750ml",
    "price": 37.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Seagram's VO",
    "volume": "750ml",
    "price": 31.45,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Seagram's 83",
    "volume": "750ml",
    "price": 29.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Gibson's Finest",
    "volume": "12yr",
    "price": 35.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Alberta Premium",
    "volume": "750ml",
    "price": 31.15,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Collingwood Whisky",
    "volume": "750ml",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Canadian Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jameson Irish",
    "volume": "200ml",
    "price": 12.75,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jameson Irish",
    "volume": "375ml",
    "price": 22.5,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jameson Irish",
    "volume": "750ml",
    "price": 42.75,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jameson Irish",
    "volume": "1.14L",
    "price": 56.0,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Jameson Irish",
    "volume": "1.75L",
    "price": 83.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jameson Black Barrel",
    "volume": "750ml",
    "price": 57.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jameson Caskmates Stout",
    "volume": "750ml",
    "price": 46.75,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bushmills",
    "volume": "750ml",
    "price": 35.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bushmills Black Bush",
    "volume": "750ml",
    "price": 40.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bushmills 10yr",
    "volume": "750ml",
    "price": 53.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Proper No. Twelve",
    "volume": "750ml",
    "price": 39.0,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Tullamore DEW",
    "volume": "750ml",
    "price": 39.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Redbreast 12yr",
    "volume": "750ml",
    "price": 97.45,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Teeling Small Batch",
    "volume": "750ml",
    "price": 51.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Powers Gold",
    "volume": "750ml",
    "price": 43.95,
    "category": "Spirits",
    "subCategory": "Irish Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Red Label",
    "volume": "200ml",
    "price": 11.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Red Label",
    "volume": "375ml",
    "price": 19.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Red Label",
    "volume": "750ml",
    "price": 36.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Red Label",
    "volume": "1.14L",
    "price": 51.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Red Label",
    "volume": "1.75L",
    "price": 76.2,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Black Label 12yr",
    "volume": "375ml",
    "price": 37.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Black Label 12yr",
    "volume": "750ml",
    "price": 67.05,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Black Label 12yr",
    "volume": "1.14L",
    "price": 85.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Gold Label Reserve",
    "volume": "750ml",
    "price": 105.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Green Label",
    "volume": "750ml",
    "price": 110.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker 18yr",
    "volume": "750ml",
    "price": 169.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Blue Label",
    "volume": "750ml",
    "price": 359.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Johnnie Walker Double Black",
    "volume": "750ml",
    "price": 89.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chivas Regal 12yr",
    "volume": "750ml",
    "price": 64.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chivas Regal 12yr",
    "volume": "1.14L",
    "price": 91.25,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ballantine's Blended",
    "volume": "750ml",
    "price": 36.05,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Dewar's White Label",
    "volume": "750ml",
    "price": 29.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Dewar's White Label",
    "volume": "1.14L",
    "price": 44.75,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grant's Triple Wood",
    "volume": "750ml",
    "price": 32.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Glenlivet 12yr",
    "volume": "750ml",
    "price": 77.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Glenlivet 14yr",
    "volume": "750ml",
    "price": 105.15,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Glenlivet 18yr",
    "volume": "750ml",
    "price": 215.15,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Glenlivet Founder's Reserve",
    "volume": "750ml",
    "price": 74.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Glenfiddich 12yr",
    "volume": "750ml",
    "price": 76.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Glenfiddich 15yr",
    "volume": "750ml",
    "price": 119.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Glenfiddich 21yr",
    "volume": "750ml",
    "price": 429.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Glenmorangie Original",
    "volume": "750ml",
    "price": 70.7,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Macallan 12yr Double Cask",
    "volume": "750ml",
    "price": 149.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Macallan 15yr Double Cask",
    "volume": "750ml",
    "price": 344.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Macallan Rare Cask",
    "volume": "750ml",
    "price": 699.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Balvenie 12yr Double Wood",
    "volume": "750ml",
    "price": 134.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Laphroaig 10yr",
    "volume": "750ml",
    "price": 99.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Lagavulin 16yr",
    "volume": "750ml",
    "price": 174.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Highland Park 12yr",
    "volume": "750ml",
    "price": 89.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Oban 14yr",
    "volume": "750ml",
    "price": 169.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Aberlour 12yr",
    "volume": "750ml",
    "price": 93.25,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Dalmore 12yr",
    "volume": "750ml",
    "price": 109.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bowmore 12yr",
    "volume": "750ml",
    "price": 65.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Talisker 10yr",
    "volume": "750ml",
    "price": 109.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ardbeg 10yr",
    "volume": "750ml",
    "price": 120.25,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bruichladdich Classic Laddie",
    "volume": "750ml",
    "price": 74.95,
    "category": "Spirits",
    "subCategory": "Scotch Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Hibiki Harmony",
    "volume": "750ml",
    "price": 154.3,
    "category": "Spirits",
    "subCategory": "Japanese Whisky",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Suntory Toki",
    "volume": "750ml",
    "price": 65.95,
    "category": "Spirits",
    "subCategory": "Japanese Whisky",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Nikka From The Barrel",
    "volume": "500ml",
    "price": 59.95,
    "category": "Spirits",
    "subCategory": "Japanese Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Nikka Miyagikyo Single Malt",
    "volume": "700ml",
    "price": 94.95,
    "category": "Spirits",
    "subCategory": "Japanese Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Tenjaku Japanese Whisky",
    "volume": "750ml",
    "price": 79.95,
    "category": "Spirits",
    "subCategory": "Japanese Whisky",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Suntory World Whisky AO",
    "volume": "700ml",
    "price": 94.95,
    "category": "Spirits",
    "subCategory": "Japanese Whisky",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Jose Cuervo Silver",
    "volume": "750ml",
    "price": 39.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jose Cuervo Silver",
    "volume": "1.14L",
    "price": 56.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Sauza Silver",
    "volume": "750ml",
    "price": 36.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Sauza Silver",
    "volume": "1.14L",
    "price": 52.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "1800 Blanco",
    "volume": "375ml",
    "price": 25.45,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "1800 Blanco",
    "volume": "750ml",
    "price": 44.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Patron Silver",
    "volume": "375ml",
    "price": 44.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Patron Silver",
    "volume": "750ml",
    "price": 75.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Don Julio Blanco",
    "volume": "750ml",
    "price": 89.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Don Julio 70th Anniversary",
    "volume": "750ml",
    "price": 119.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Casamigos Blanco",
    "volume": "375ml",
    "price": 43.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Casamigos Blanco",
    "volume": "750ml",
    "price": 71.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Casamigos Blanco",
    "volume": "1.75L",
    "price": 185.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Espolon Blanco",
    "volume": "750ml",
    "price": 45.0,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "818 Tequila Blanco",
    "volume": "750ml",
    "price": 64.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hornitos Plata",
    "volume": "750ml",
    "price": 37.75,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "El Jimador Blanco",
    "volume": "750ml",
    "price": 41.5,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Herradura Silver",
    "volume": "750ml",
    "price": 73.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Milagro Silver",
    "volume": "750ml",
    "price": 45.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Teremana Blanco",
    "volume": "750ml",
    "price": 58.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Olmeca Altos Plata",
    "volume": "750ml",
    "price": 47.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Tromba Blanco",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cazadores Blanco",
    "volume": "750ml",
    "price": 39.95,
    "category": "Spirits",
    "subCategory": "Tequila Blanco",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "1800 Reposado",
    "volume": "750ml",
    "price": 43.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Don Julio Reposado",
    "volume": "750ml",
    "price": 94.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Casamigos Reposado",
    "volume": "750ml",
    "price": 85.05,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Patron Reposado",
    "volume": "750ml",
    "price": 89.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Espolon Reposado",
    "volume": "750ml",
    "price": 49.0,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Teremana Reposado",
    "volume": "750ml",
    "price": 58.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Herradura Reposado",
    "volume": "750ml",
    "price": 79.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jose Cuervo Gold",
    "volume": "750ml",
    "price": 39.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jose Cuervo Gold",
    "volume": "1.14L",
    "price": 56.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hornitos Reposado",
    "volume": "750ml",
    "price": 41.75,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "818 Reposado",
    "volume": "750ml",
    "price": 74.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Olmeca Altos Reposado",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Tromba Reposado",
    "volume": "750ml",
    "price": 64.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Sauza Gold",
    "volume": "750ml",
    "price": 36.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cazadores Reposado",
    "volume": "750ml",
    "price": 43.95,
    "category": "Spirits",
    "subCategory": "Tequila Reposado",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Don Julio Anejo",
    "volume": "750ml",
    "price": 109.95,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Don Julio 1942",
    "volume": "750ml",
    "price": 319.95,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Casamigos Anejo",
    "volume": "750ml",
    "price": 94.95,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Patron Anejo",
    "volume": "750ml",
    "price": 99.95,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "1800 Anejo",
    "volume": "750ml",
    "price": 58.45,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Espolon Anejo",
    "volume": "750ml",
    "price": 55.2,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Herradura Ultra Anejo",
    "volume": "750ml",
    "price": 99.75,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Olmeca Altos Anejo",
    "volume": "750ml",
    "price": 59.95,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cazadores Anejo",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Tequila Anejo",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Absolut",
    "volume": "200ml",
    "price": 9.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Absolut",
    "volume": "375ml",
    "price": 18.45,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Absolut",
    "volume": "750ml",
    "price": 31.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Absolut",
    "volume": "1.14L",
    "price": 45.85,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Absolut",
    "volume": "1.75L",
    "price": 69.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grey Goose",
    "volume": "200ml",
    "price": 17.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grey Goose",
    "volume": "375ml",
    "price": 27.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grey Goose",
    "volume": "750ml",
    "price": 47.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Grey Goose",
    "volume": "1.14L",
    "price": 74.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grey Goose",
    "volume": "1.75L",
    "price": 109.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff",
    "volume": "200ml",
    "price": 9.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff",
    "volume": "375ml",
    "price": 17.45,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff",
    "volume": "750ml",
    "price": 29.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Smirnoff",
    "volume": "1.14L",
    "price": 46.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff",
    "volume": "1.75L",
    "price": 67.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Ketel One",
    "volume": "750ml",
    "price": 33.55,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Ketel One",
    "volume": "1.14L",
    "price": 53.15,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Belvedere Pure",
    "volume": "750ml",
    "price": 56.5,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Belvedere Pure",
    "volume": "1.14L",
    "price": 81.3,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ciroc",
    "volume": "750ml",
    "price": 50.05,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Stoli",
    "volume": "750ml",
    "price": 31.05,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Finlandia",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Polar Ice",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Polar Ice",
    "volume": "1.14L",
    "price": 46.9,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Iceberg",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Tag No.5",
    "volume": "750ml",
    "price": 29.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Alberta Pure",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Crystal Head",
    "volume": "750ml",
    "price": 60.4,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Haku",
    "volume": "750ml",
    "price": 48.7,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chopin Potato",
    "volume": "750ml",
    "price": 53.15,
    "category": "Spirits",
    "subCategory": "Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Absolut Peach",
    "volume": "750ml",
    "price": 31.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Absolut Raspberri",
    "volume": "750ml",
    "price": 31.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Absolut Citron",
    "volume": "750ml",
    "price": 31.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Absolut Lime",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Absolut Watermelon",
    "volume": "750ml",
    "price": 31.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grey Goose Le Citron",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grey Goose La Poire",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ciroc Peach",
    "volume": "750ml",
    "price": 52.05,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ciroc Pineapple",
    "volume": "750ml",
    "price": 50.05,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Ciroc Watermelon",
    "volume": "750ml",
    "price": 52.0,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ciroc Red Berry",
    "volume": "750ml",
    "price": 52.05,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff Raspberry",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff Blueberry",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff Vanilla",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff Pink Lemonade",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Polar Ice Berry Blizzard",
    "volume": "750ml",
    "price": 29.95,
    "category": "Spirits",
    "subCategory": "Flavoured Vodka",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Captain Morgan Dark",
    "volume": "375ml",
    "price": 18.45,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan Dark",
    "volume": "750ml",
    "price": 31.45,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan Dark",
    "volume": "1.14L",
    "price": 46.85,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan Dark",
    "volume": "1.75L",
    "price": 69.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan Spiced",
    "volume": "200ml",
    "price": 10.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan Spiced",
    "volume": "375ml",
    "price": 18.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan Spiced",
    "volume": "750ml",
    "price": 33.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Captain Morgan Spiced",
    "volume": "1.14L",
    "price": 47.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan Spiced",
    "volume": "1.75L",
    "price": 69.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bacardi Gold",
    "volume": "375ml",
    "price": 18.75,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bacardi Gold",
    "volume": "750ml",
    "price": 31.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bacardi Gold",
    "volume": "1.75L",
    "price": 68.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bacardi Black",
    "volume": "750ml",
    "price": 29.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Appleton Estate Signature",
    "volume": "375ml",
    "price": 18.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Appleton Estate Signature",
    "volume": "750ml",
    "price": 33.25,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Appleton Estate Signature",
    "volume": "1.14L",
    "price": 47.45,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Appleton Estate 8yr",
    "volume": "750ml",
    "price": 42.45,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Kraken Black Spiced",
    "volume": "375ml",
    "price": 20.2,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Kraken Black Spiced",
    "volume": "750ml",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Kraken Black Spiced",
    "volume": "1.14L",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Kraken Black Spiced",
    "volume": "1.75L",
    "price": 69.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mount Gay Eclipse",
    "volume": "750ml",
    "price": 38.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Havana Club Anejo Reserva",
    "volume": "750ml",
    "price": 33.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Havana Club 7yr",
    "volume": "750ml",
    "price": 41.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "El Dorado 5yr",
    "volume": "750ml",
    "price": 34.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "El Dorado 12yr",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "El Dorado 15yr",
    "volume": "750ml",
    "price": 79.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Diplomatico Reserva Exclusiva",
    "volume": "750ml",
    "price": 64.4,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bumbu Original",
    "volume": "750ml",
    "price": 59.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ron Zacapa 23",
    "volume": "750ml",
    "price": 88.85,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Flor de Cana 7yr",
    "volume": "750ml",
    "price": 38.95,
    "category": "Spirits",
    "subCategory": "Dark Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bacardi Superior White",
    "volume": "200ml",
    "price": 10.15,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bacardi Superior White",
    "volume": "375ml",
    "price": 16.45,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bacardi Superior White",
    "volume": "750ml",
    "price": 29.95,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Bacardi Superior White",
    "volume": "1.14L",
    "price": 43.25,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bacardi Superior White",
    "volume": "1.75L",
    "price": 66.45,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan White",
    "volume": "375ml",
    "price": 18.45,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan White",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan White",
    "volume": "1.14L",
    "price": 46.95,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Captain Morgan White",
    "volume": "1.75L",
    "price": 69.95,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Lamb's Classic White",
    "volume": "750ml",
    "price": 31.15,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wray & Nephew Overproof",
    "volume": "375ml",
    "price": 24.0,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wray & Nephew Overproof",
    "volume": "750ml",
    "price": 45.95,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Malibu Coconut",
    "volume": "750ml",
    "price": 28.75,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Malibu Coconut",
    "volume": "1.14L",
    "price": 42.45,
    "category": "Spirits",
    "subCategory": "White Rum",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Tanqueray London Dry",
    "volume": "375ml",
    "price": 18.0,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Tanqueray London Dry",
    "volume": "750ml",
    "price": 34.5,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Tanqueray London Dry",
    "volume": "1.14L",
    "price": 47.55,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Tanqueray No. Ten",
    "volume": "750ml",
    "price": 53.95,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bombay Sapphire",
    "volume": "200ml",
    "price": 11.45,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bombay Sapphire",
    "volume": "750ml",
    "price": 33.45,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bombay Sapphire",
    "volume": "1.14L",
    "price": 48.95,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bombay Sapphire",
    "volume": "1.75L",
    "price": 73.95,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hendrick's",
    "volume": "375ml",
    "price": 30.0,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hendrick's",
    "volume": "750ml",
    "price": 55.0,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Hendrick's",
    "volume": "1.75L",
    "price": 105.65,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Beefeater London Dry",
    "volume": "750ml",
    "price": 31.5,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Beefeater London Dry",
    "volume": "1.14L",
    "price": 46.8,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Gordon's Dry",
    "volume": "750ml",
    "price": 30.95,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Gordon's Dry",
    "volume": "1.14L",
    "price": 46.95,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Aviation",
    "volume": "750ml",
    "price": 43.0,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Roku",
    "volume": "750ml",
    "price": 54.8,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bruichladdich Botanist",
    "volume": "750ml",
    "price": 49.8,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Empress 1908",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Malfy Originale",
    "volume": "750ml",
    "price": 44.8,
    "category": "Spirits",
    "subCategory": "Gin",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hennessy VS",
    "volume": "200ml",
    "price": 24.6,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hennessy VS",
    "volume": "375ml",
    "price": 37.8,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hennessy VS",
    "volume": "750ml",
    "price": 75.2,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Hennessy VS",
    "volume": "1.75L",
    "price": 187.9,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hennessy VSOP",
    "volume": "375ml",
    "price": 72.35,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hennessy VSOP",
    "volume": "750ml",
    "price": 115.4,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hennessy XO",
    "volume": "750ml",
    "price": 345.65,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Remy Martin VSOP",
    "volume": "750ml",
    "price": 102.95,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Remy Martin 1738",
    "volume": "750ml",
    "price": 148.95,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Remy Martin XO",
    "volume": "750ml",
    "price": 312.95,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Courvoisier VS",
    "volume": "750ml",
    "price": 70.2,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Courvoisier VSOP",
    "volume": "750ml",
    "price": 110.75,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "D'Usse VSOP",
    "volume": "750ml",
    "price": 84.95,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "D'Usse XO",
    "volume": "750ml",
    "price": 299.95,
    "category": "Spirits",
    "subCategory": "Cognac",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Baileys Original Irish Cream",
    "volume": "200ml",
    "price": 10.0,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Baileys Original Irish Cream",
    "volume": "375ml",
    "price": 19.0,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Baileys Original Irish Cream",
    "volume": "750ml",
    "price": 33.0,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Baileys Original Irish Cream",
    "volume": "1.14L",
    "price": 44.05,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Baileys Espresso",
    "volume": "750ml",
    "price": 33.5,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Baileys Salted Caramel",
    "volume": "750ml",
    "price": 33.5,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Kahlua Original",
    "volume": "375ml",
    "price": 20.75,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Kahlua Original",
    "volume": "750ml",
    "price": 31.95,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Kahlua Original",
    "volume": "1.14L",
    "price": 39.95,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jagermeister",
    "volume": "375ml",
    "price": 18.0,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jagermeister",
    "volume": "750ml",
    "price": 28.85,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Jagermeister",
    "volume": "1.14L",
    "price": 46.6,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Campari",
    "volume": "750ml",
    "price": 33.55,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Aperol",
    "volume": "375ml",
    "price": 17.05,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Aperol",
    "volume": "750ml",
    "price": 33.5,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Fireball Cinnamon",
    "volume": "375ml",
    "price": 14.95,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Fireball Cinnamon",
    "volume": "750ml",
    "price": 25.95,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Fireball Cinnamon",
    "volume": "1.14L",
    "price": 32.95,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Fireball Cinnamon",
    "volume": "1.75L",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Grand Marnier",
    "volume": "750ml",
    "price": 55.85,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cointreau",
    "volume": "750ml",
    "price": 49.05,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Disaronno Amaretto",
    "volume": "750ml",
    "price": 34.05,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Southern Comfort",
    "volume": "750ml",
    "price": 29.45,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Drambuie",
    "volume": "750ml",
    "price": 50.05,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Malibu Pink",
    "volume": "750ml",
    "price": 29.45,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Tia Maria",
    "volume": "750ml",
    "price": 32.0,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "St-Germain Elderflower",
    "volume": "750ml",
    "price": 49.95,
    "category": "Spirits",
    "subCategory": "Liqueurs",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chum Churum Soju",
    "volume": "360ml",
    "price": 9.5,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chum Churum Strawberry",
    "volume": "360ml",
    "price": 10.05,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chum Churum Peach",
    "volume": "360ml",
    "price": 10.05,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chum Churum Yogurt",
    "volume": "360ml",
    "price": 10.05,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chum Churum Apple Mango",
    "volume": "360ml",
    "price": 10.05,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Chum Churum Grape",
    "volume": "360ml",
    "price": 10.05,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jinro Green Grape",
    "volume": "360ml",
    "price": 10.7,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jinro Chamisul Fresh",
    "volume": "360ml",
    "price": 10.8,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Jinro Plum",
    "volume": "360ml",
    "price": 9.85,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jinro Grapefruit",
    "volume": "360ml",
    "price": 9.85,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Good Day Melon",
    "volume": "360ml",
    "price": 10.3,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Good Day Lychee",
    "volume": "360ml",
    "price": 10.3,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hallasan Watermelon",
    "volume": "375ml",
    "price": 9.9,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Hallasan Mandarine",
    "volume": "375ml",
    "price": 10.95,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Hakutsuru Junmai Sake",
    "volume": "720ml",
    "price": 11.0,
    "category": "Spirits",
    "subCategory": "Soju & Sake",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Apothic Red",
    "volume": "750ml",
    "price": 16.99,
    "category": "Wine",
    "subCategory": "Red Wine - Italy",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Ruffino Chianti",
    "volume": "750ml",
    "price": 15.0,
    "category": "Wine",
    "subCategory": "Red Wine - Italy",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Pasqua Passimento Rosso",
    "volume": "750ml",
    "price": 14.95,
    "category": "Wine",
    "subCategory": "Red Wine - Italy",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Masi Campofiorin",
    "volume": "375ml",
    "price": 14.95,
    "category": "Wine",
    "subCategory": "Red Wine - Italy",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Fat Bastard Shiraz",
    "volume": "750ml",
    "price": 15.0,
    "category": "Wine",
    "subCategory": "Red Wine - France",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Famille Perrin C\u00f4tes du Rh\u00f4ne",
    "volume": "750ml",
    "price": 16.95,
    "category": "Wine",
    "subCategory": "Red Wine - France",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Porta 6 Lisboa",
    "volume": "750ml",
    "price": 13.0,
    "category": "Wine",
    "subCategory": "Red Wine - Portugal",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Espor\u00e3o Monte Velho",
    "volume": "750ml",
    "price": 12.8,
    "category": "Wine",
    "subCategory": "Red Wine - Portugal",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Silk & Spice Red",
    "volume": "750ml",
    "price": 13.95,
    "category": "Wine",
    "subCategory": "Red Wine - Portugal",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Yellow Tail Shiraz",
    "volume": "750ml",
    "price": 15.0,
    "category": "Wine",
    "subCategory": "Red Wine - Australia",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Yellow Tail Cabernet Sauvignon",
    "volume": "750ml",
    "price": 15.0,
    "category": "Wine",
    "subCategory": "Red Wine - Australia",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "19 Crimes Cabernet Sauvignon",
    "volume": "750ml",
    "price": 17.9,
    "category": "Wine",
    "subCategory": "Red Wine - Australia",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Jacob's Creek Shiraz",
    "volume": "750ml",
    "price": 15.05,
    "category": "Wine",
    "subCategory": "Red Wine - Australia",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wolf Blass Yellow Label Cab",
    "volume": "750ml",
    "price": 18.05,
    "category": "Wine",
    "subCategory": "Red Wine - Australia",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Kim Crawford Pinot Noir",
    "volume": "750ml",
    "price": 22.95,
    "category": "Wine",
    "subCategory": "Red Wine - New Zealand",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Oyster Bay Pinot Noir",
    "volume": "750ml",
    "price": 21.95,
    "category": "Wine",
    "subCategory": "Red Wine - New Zealand",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Antano Crianza Rioja",
    "volume": "750ml",
    "price": 12.0,
    "category": "Wine",
    "subCategory": "Red Wine - Spain",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Casillero del Diablo Cabernet",
    "volume": "750ml",
    "price": 13.95,
    "category": "Wine",
    "subCategory": "Red Wine - Chile",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Casillero del Diablo Merlot",
    "volume": "750ml",
    "price": 14.0,
    "category": "Wine",
    "subCategory": "Red Wine - Chile",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Santa Carolina Cabernet Merlot",
    "volume": "750ml",
    "price": 10.0,
    "category": "Wine",
    "subCategory": "Red Wine - Chile",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Concha Y Toro Cabernet",
    "volume": "750ml",
    "price": 9.85,
    "category": "Wine",
    "subCategory": "Red Wine - Chile",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Trapiche Reserva Malbec",
    "volume": "750ml",
    "price": 12.95,
    "category": "Wine",
    "subCategory": "Red Wine - Argentina",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Alamos Malbec",
    "volume": "750ml",
    "price": 17.95,
    "category": "Wine",
    "subCategory": "Red Wine - Argentina",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Luigi Bosca Malbec",
    "volume": "750ml",
    "price": 17.95,
    "category": "Wine",
    "subCategory": "Red Wine - Argentina",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Santa Julia Malbec",
    "volume": "750ml",
    "price": 14.95,
    "category": "Wine",
    "subCategory": "Red Wine - Argentina",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Kim Crawford Sauvignon Blanc",
    "volume": "750ml",
    "price": 21.95,
    "category": "Wine",
    "subCategory": "White Wine - New Zealand",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Kim Crawford Sauvignon Blanc",
    "volume": "375ml",
    "price": 11.95,
    "category": "Wine",
    "subCategory": "White Wine - New Zealand",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Oyster Bay Sauvignon Blanc",
    "volume": "750ml",
    "price": 17.95,
    "category": "Wine",
    "subCategory": "White Wine - New Zealand",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Oyster Bay Chardonnay",
    "volume": "750ml",
    "price": 20.95,
    "category": "Wine",
    "subCategory": "White Wine - New Zealand",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Oyster Bay Pinot Grigio",
    "volume": "750ml",
    "price": 20.95,
    "category": "Wine",
    "subCategory": "White Wine - New Zealand",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Santa Margherita Pinot Grigio",
    "volume": "750ml",
    "price": 19.95,
    "category": "Wine",
    "subCategory": "White Wine - Vintage",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Folonari Pinot Grigio",
    "volume": "750ml",
    "price": 14.95,
    "category": "Wine",
    "subCategory": "White Wine - Italy",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mezzacorona Pinot Grigio",
    "volume": "750ml",
    "price": 14.95,
    "category": "Wine",
    "subCategory": "White Wine - Italy",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Yellow Tail Sauvignon Blanc",
    "volume": "750ml",
    "price": 15.0,
    "category": "Wine",
    "subCategory": "White Wine - Australia",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Yellow Tail Pinot Grigio",
    "volume": "750ml",
    "price": 15.0,
    "category": "Wine",
    "subCategory": "White Wine - Australia",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jacob's Creek Chardonnay",
    "volume": "750ml",
    "price": 13.0,
    "category": "Wine",
    "subCategory": "White Wine - Australia",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Casillero del Diablo Sauvignon Blanc",
    "volume": "750ml",
    "price": 13.95,
    "category": "Wine",
    "subCategory": "White Wine - Chile",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Santa Carolina Chardonnay",
    "volume": "750ml",
    "price": 10.0,
    "category": "Wine",
    "subCategory": "White Wine - Chile",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Santa Carolina Sauvignon Blanc",
    "volume": "750ml",
    "price": 10.0,
    "category": "Wine",
    "subCategory": "White Wine - Chile",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Alamos Chardonnay",
    "volume": "750ml",
    "price": 15.05,
    "category": "Wine",
    "subCategory": "White Wine - Argentina",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Casal Garcia Vinho Verde",
    "volume": "750ml",
    "price": 12.0,
    "category": "Wine",
    "subCategory": "White Wine - Portugal",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Aveleda Vinho Verde",
    "volume": "750ml",
    "price": 13.0,
    "category": "Wine",
    "subCategory": "White Wine - Portugal",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jackson-Triggs Cabernet Sauvignon",
    "volume": "750ml",
    "price": 13.45,
    "category": "Wine",
    "subCategory": "Ontario Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jackson-Triggs Shiraz",
    "volume": "750ml",
    "price": 12.95,
    "category": "Wine",
    "subCategory": "Ontario Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bodacious Smooth Red",
    "volume": "750ml",
    "price": 12.45,
    "category": "Wine",
    "subCategory": "Ontario Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bodacious Cabernet Sauvignon",
    "volume": "750ml",
    "price": 13.45,
    "category": "Wine",
    "subCategory": "Ontario Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Peller Family Red",
    "volume": "1.5L",
    "price": 19.95,
    "category": "Wine",
    "subCategory": "Ontario Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jackson-Triggs Pinot Grigio",
    "volume": "750ml",
    "price": 13.45,
    "category": "Wine",
    "subCategory": "Ontario White",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jackson-Triggs Sauvignon Blanc",
    "volume": "750ml",
    "price": 12.45,
    "category": "Wine",
    "subCategory": "Ontario White",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bodacious Smooth White",
    "volume": "750ml",
    "price": 12.45,
    "category": "Wine",
    "subCategory": "Ontario White",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "XOXO Pinot Grigio Chardonnay",
    "volume": "750ml",
    "price": 9.95,
    "category": "Wine",
    "subCategory": "Ontario White",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Peller Family Pinot Grigio",
    "volume": "750ml",
    "price": 13.25,
    "category": "Wine",
    "subCategory": "Ontario White",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bask Sauvignon Blanc",
    "volume": "750ml",
    "price": 13.95,
    "category": "Wine",
    "subCategory": "Ontario White",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wayne Gretzky Baco Noir VQA",
    "volume": "750ml",
    "price": 16.95,
    "category": "Wine",
    "subCategory": "VQA Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Trius Red VQA",
    "volume": "750ml",
    "price": 24.95,
    "category": "Wine",
    "subCategory": "VQA Red",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Henry of Pelham Baco Noir VQA",
    "volume": "750ml",
    "price": 14.95,
    "category": "Wine",
    "subCategory": "VQA Red",
    "store": "Liquor Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Inniskillin Pinot Noir VQA",
    "volume": "750ml",
    "price": 18.95,
    "category": "Wine",
    "subCategory": "VQA Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cave Spring Pinot Noir VQA",
    "volume": "750ml",
    "price": 21.95,
    "category": "Wine",
    "subCategory": "VQA Red",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Wayne Gretzky Chardonnay VQA",
    "volume": "750ml",
    "price": 16.95,
    "category": "Wine",
    "subCategory": "VQA White",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Trius Pinot Grigio VQA",
    "volume": "750ml",
    "price": 17.95,
    "category": "Wine",
    "subCategory": "VQA White",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Henry of Pelham Chardonnay VQA",
    "volume": "750ml",
    "price": 16.95,
    "category": "Wine",
    "subCategory": "VQA White",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bodacious Ros\u00e9 VQA",
    "volume": "750ml",
    "price": 11.95,
    "category": "Wine",
    "subCategory": "Ros\u00e9",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Pelee Island Pelee Pink VQA",
    "volume": "750ml",
    "price": 13.95,
    "category": "Wine",
    "subCategory": "Ros\u00e9",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Henry of Pelham Ros\u00e9 VQA",
    "volume": "750ml",
    "price": 15.95,
    "category": "Wine",
    "subCategory": "Ros\u00e9",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cave Spring Dry Ros\u00e9 VQA",
    "volume": "750ml",
    "price": 17.95,
    "category": "Wine",
    "subCategory": "Ros\u00e9",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Popcorn Ros\u00e9 VQA",
    "volume": "750ml",
    "price": 17.95,
    "category": "Wine",
    "subCategory": "Ros\u00e9",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Trius Ros\u00e9 VQA",
    "volume": "750ml",
    "price": 19.95,
    "category": "Wine",
    "subCategory": "Ros\u00e9",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Girls' Night Out Ros\u00e9 VQA",
    "volume": "750ml",
    "price": 13.95,
    "category": "Wine",
    "subCategory": "Ros\u00e9",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Veuve Clicquot Brut",
    "volume": "375ml",
    "price": 49.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Veuve Clicquot Brut",
    "volume": "750ml",
    "price": 87.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Veuve Clicquot Brut Ros\u00e9",
    "volume": "750ml",
    "price": 103.9,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mo\u00ebt & Chandon Brut Imperial",
    "volume": "375ml",
    "price": 47.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mo\u00ebt & Chandon Brut Imperial",
    "volume": "750ml",
    "price": 79.8,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Mo\u00ebt & Chandon Brut Ros\u00e9",
    "volume": "750ml",
    "price": 99.7,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Dom P\u00e9rignon Vintage",
    "volume": "750ml",
    "price": 351.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Ace of Spades Brut Gold",
    "volume": "750ml",
    "price": 398.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Louis Roederer Cristal",
    "volume": "750ml",
    "price": 468.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "Premium",
    "stock": 100
  },
  {
    "name": "Bollinger Special Cuv\u00e9e",
    "volume": "750ml",
    "price": 104.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Taittinger Brut R\u00e9serve",
    "volume": "750ml",
    "price": 91.15,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mumm Grand Cordon",
    "volume": "750ml",
    "price": 78.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Perrier-Jou\u00ebt Grand Brut",
    "volume": "750ml",
    "price": 87.5,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bottega Gold Prosecco",
    "volume": "750ml",
    "price": 30.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mionetto Prosecco Brut",
    "volume": "750ml",
    "price": 19.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Ruffino Prosecco",
    "volume": "750ml",
    "price": 19.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "La Marca Prosecco",
    "volume": "750ml",
    "price": 22.0,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Martini Asti",
    "volume": "750ml",
    "price": 16.4,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Baby Duck",
    "volume": "750ml",
    "price": 9.95,
    "category": "Wine",
    "subCategory": "Sparkling & Champagne",
    "store": "Liquor Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Labatt Blue",
    "volume": "473ml Tallboy",
    "price": 2.55,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Labatt Blue",
    "volume": "6x473ml",
    "price": 15.05,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Labatt Blue",
    "volume": "12x473ml",
    "price": 28.87,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Labatt Blue",
    "volume": "24x473ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Labatt Blue",
    "volume": "24x355ml",
    "price": 49.85,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Labatt Blue",
    "volume": "30x355ml",
    "price": 58.36,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Molson Canadian",
    "volume": "473ml Tallboy",
    "price": 3.25,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Molson Canadian",
    "volume": "6x473ml",
    "price": 18.9,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Molson Canadian",
    "volume": "12x473ml",
    "price": 30.0,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Molson Canadian",
    "volume": "24x473ml",
    "price": 59.91,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Molson Canadian",
    "volume": "24x355ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Molson Canadian",
    "volume": "30x355ml",
    "price": 56.1,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Coors Light",
    "volume": "473ml Tallboy",
    "price": 3.25,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Coors Light",
    "volume": "6x473ml",
    "price": 18.1,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Coors Light",
    "volume": "12x473ml",
    "price": 31.13,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Coors Light",
    "volume": "24x473ml",
    "price": 63.7,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Coors Light",
    "volume": "24x355ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Coors Light",
    "volume": "30x355ml",
    "price": 61.75,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Budweiser",
    "volume": "473ml Tallboy",
    "price": 3.25,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Budweiser",
    "volume": "6x473ml",
    "price": 18.1,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Budweiser",
    "volume": "12x473ml",
    "price": 33.39,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Budweiser",
    "volume": "24x473ml",
    "price": 63.41,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Budweiser",
    "volume": "24x355ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Budweiser",
    "volume": "30x355ml",
    "price": 58.36,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Bud Light",
    "volume": "473ml Tallboy",
    "price": 3.25,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bud Light",
    "volume": "6x473ml",
    "price": 18.1,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bud Light",
    "volume": "24x473ml",
    "price": 61.04,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Heineken",
    "volume": "500ml Tallboy",
    "price": 3.93,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Heineken",
    "volume": "6x500ml",
    "price": 22.06,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Heineken",
    "volume": "12x500ml",
    "price": 40.74,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Heineken",
    "volume": "24x500ml",
    "price": 75.27,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Heineken",
    "volume": "24x330ml Bottles",
    "price": 56.63,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Stella Artois",
    "volume": "473ml Tallboy",
    "price": 3.93,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Stella Artois",
    "volume": "6x473ml",
    "price": 22.06,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Stella Artois",
    "volume": "24x473ml",
    "price": 75.27,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Stella Artois",
    "volume": "24x330ml Bottles",
    "price": 56.63,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Corona Extra",
    "volume": "473ml Tallboy",
    "price": 3.93,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Corona Extra",
    "volume": "6x473ml",
    "price": 22.06,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Corona Extra",
    "volume": "24x473ml",
    "price": 75.27,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Corona Extra",
    "volume": "24x330ml Bottles",
    "price": 60.02,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Guinness Draught Stout",
    "volume": "500ml Tallboy",
    "price": 4.0,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Guinness Draught Stout",
    "volume": "4x440ml",
    "price": 13.95,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Guinness Draught Stout",
    "volume": "8x440ml",
    "price": 27.3,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Michelob Ultra",
    "volume": "473ml Tallboy",
    "price": 3.48,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Michelob Ultra",
    "volume": "6x473ml",
    "price": 19.23,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Michelob Ultra",
    "volume": "24x473ml",
    "price": 69.06,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Michelob Ultra",
    "volume": "30x355ml",
    "price": 61.49,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Sapporo",
    "volume": "500ml Tallboy",
    "price": 3.93,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Sapporo",
    "volume": "12x500ml",
    "price": 40.74,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Sapporo",
    "volume": "24x500ml",
    "price": 75.27,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Blue Moon Belgian White",
    "volume": "473ml Tallboy",
    "price": 3.48,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Blue Moon Belgian White",
    "volume": "6x473ml",
    "price": 19.23,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Blue Moon Belgian White",
    "volume": "24x473ml",
    "price": 67.82,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Moosehead",
    "volume": "473ml Tallboy",
    "price": 3.25,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Moosehead",
    "volume": "24x473ml",
    "price": 62.28,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Alexander Keith's",
    "volume": "473ml Tallboy",
    "price": 3.48,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Alexander Keith's",
    "volume": "24x473ml",
    "price": 70.19,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Steam Whistle",
    "volume": "473ml Tallboy",
    "price": 3.82,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Steam Whistle",
    "volume": "6x473ml",
    "price": 20.93,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Steam Whistle",
    "volume": "24x473ml",
    "price": 66.8,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mill Street Organic",
    "volume": "473ml Tallboy",
    "price": 3.82,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mill Street Organic",
    "volume": "6x473ml",
    "price": 20.93,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Peroni Nastro Azzurro",
    "volume": "500ml Tallboy",
    "price": 3.95,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Peroni Nastro Azzurro",
    "volume": "24x330ml Bottles",
    "price": 60.02,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Asahi Super Dry",
    "volume": "500ml Tallboy",
    "price": 3.95,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Asahi Super Dry",
    "volume": "24x330ml Bottles",
    "price": 55.5,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Rickard's Red",
    "volume": "473ml Tallboy",
    "price": 3.48,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Rickard's Red",
    "volume": "24x473ml",
    "price": 69.06,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Busch",
    "volume": "473ml Tallboy",
    "price": 2.55,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Busch",
    "volume": "24x473ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Busch Light",
    "volume": "473ml Tallboy",
    "price": 2.55,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Busch Light",
    "volume": "24x473ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Busch Light",
    "volume": "30x355ml",
    "price": 54.97,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Pabst Blue Ribbon",
    "volume": "473ml Tallboy",
    "price": 2.55,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Pabst Blue Ribbon",
    "volume": "24x473ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Old Milwaukee Ice",
    "volume": "473ml Tallboy",
    "price": 2.55,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Old Milwaukee Ice",
    "volume": "24x473ml",
    "price": 54.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Laker Ice",
    "volume": "473ml Tallboy",
    "price": 2.52,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Laker Ice",
    "volume": "24x473ml",
    "price": 50.87,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Miller Lite",
    "volume": "473ml Tallboy",
    "price": 3.48,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Miller Lite",
    "volume": "24x473ml",
    "price": 69.06,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Miller Lite",
    "volume": "30x355ml",
    "price": 59.49,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Carlsberg",
    "volume": "473ml Tallboy",
    "price": 3.37,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Carlsberg",
    "volume": "24x473ml",
    "price": 61.94,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Modelo Especial",
    "volume": "6x355ml",
    "price": 18.95,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Modelo Especial",
    "volume": "12x355ml",
    "price": 33.45,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Dos Equis Lager",
    "volume": "6x355ml",
    "price": 18.0,
    "category": "Beer",
    "subCategory": "Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Amsterdam Boneshaker",
    "volume": "6x473ml",
    "price": 21.95,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Amsterdam Boneshaker",
    "volume": "24x473ml",
    "price": 74.95,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Muskoka Cream Ale",
    "volume": "473ml",
    "price": 3.85,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Muskoka Detour",
    "volume": "473ml",
    "price": 3.85,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Muskoka Mad Tom IPA",
    "volume": "473ml",
    "price": 3.95,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Flying Monkeys Juicy Ass",
    "volume": "473ml",
    "price": 3.95,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Beau's Lug Tread",
    "volume": "473ml",
    "price": 3.4,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Goose Island IPA",
    "volume": "473ml",
    "price": 3.35,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Collective Arts Lager",
    "volume": "473ml",
    "price": 3.25,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Side Launch Northbound",
    "volume": "473ml",
    "price": 3.25,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Great Lakes Brewery Lager",
    "volume": "473ml",
    "price": 3.0,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Great Lakes Pompous Ass",
    "volume": "473ml",
    "price": 3.1,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Nickel Brook Head Stock IPA",
    "volume": "473ml",
    "price": 3.85,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Creemore Lot 9 Pilsner",
    "volume": "473ml",
    "price": 3.7,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Innis & Gunn Original",
    "volume": "473ml",
    "price": 3.85,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Bellwoods Ultra",
    "volume": "473ml",
    "price": 3.5,
    "category": "Beer",
    "subCategory": "Craft Beer",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Heineken 0.0",
    "volume": "6x330ml",
    "price": 12.95,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Corona Sunbrew",
    "volume": "6x330ml",
    "price": 12.95,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Guinness 0",
    "volume": "4x440ml",
    "price": 11.95,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Budweiser ZERO",
    "volume": "473ml",
    "price": 2.5,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Michelob Ultra ZERO",
    "volume": "6x355ml",
    "price": 10.95,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Sapporo Alcohol Free",
    "volume": "6x355ml",
    "price": 11.95,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Peroni 0.0",
    "volume": "6x330ml",
    "price": 13.95,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Partake Pale Ale NA",
    "volume": "355ml",
    "price": 2.0,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Partake IPA NA",
    "volume": "355ml",
    "price": 2.0,
    "category": "Beer",
    "subCategory": "Non-Alcoholic",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "White Claw Variety Pack",
    "volume": "12x355ml",
    "price": 31.95,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "White Claw Raspberry",
    "volume": "473ml",
    "price": 3.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "White Claw Mango",
    "volume": "473ml",
    "price": 3.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "White Claw Black Cherry",
    "volume": "473ml",
    "price": 3.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "White Claw Watermelon",
    "volume": "473ml",
    "price": 2.65,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "Sale",
    "stock": 100
  },
  {
    "name": "Smirnoff Ice",
    "volume": "473ml",
    "price": 3.2,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Smirnoff Ice",
    "volume": "12x355ml",
    "price": 26.95,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mike's Hard Lemonade",
    "volume": "473ml",
    "price": 3.35,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mike's Hard Lemonade",
    "volume": "6x355ml",
    "price": 14.95,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Twisted Tea Original",
    "volume": "473ml",
    "price": 3.25,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Twisted Tea Peach",
    "volume": "473ml",
    "price": 3.25,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Twisted Tea Party Pack",
    "volume": "12x355ml",
    "price": 29.45,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mott's Clamato Caesar",
    "volume": "458ml",
    "price": 3.95,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Mott's Caesar Variety Pack",
    "volume": "12x341ml",
    "price": 33.45,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Nutrl Vodka Soda Lime",
    "volume": "473ml",
    "price": 3.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Nutrl Vodka Soda Grapefruit",
    "volume": "473ml",
    "price": 3.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Nutrl Vodka Soda Raspberry",
    "volume": "473ml",
    "price": 3.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Happy Dad Hard Seltzer Variety",
    "volume": "12x355ml",
    "price": 31.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cottage Springs Vodka Soda Mixed",
    "volume": "8x355ml",
    "price": 21.95,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cottage Springs Vodka Lemonade Mixed",
    "volume": "8x355ml",
    "price": 21.95,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "High Noon Variety Pack",
    "volume": "8x355ml",
    "price": 25.95,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cutwater Tequila Margarita",
    "volume": "355ml",
    "price": 4.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Cutwater Rum Mai Tai",
    "volume": "355ml",
    "price": 4.5,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Aperol Spritz",
    "volume": "3x200ml",
    "price": 14.45,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Georgian Bay Gin Smash",
    "volume": "473ml",
    "price": 3.35,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "Popular",
    "stock": 100
  },
  {
    "name": "Crown Royal Whisky & Cola",
    "volume": "473ml",
    "price": 3.25,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canadian Club & Ginger Ale",
    "volume": "473ml",
    "price": 3.25,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Jameson Ginger & Lime",
    "volume": "473ml",
    "price": 3.65,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Strongbow Cider",
    "volume": "500ml",
    "price": 3.65,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Somersby Apple Cider",
    "volume": "473ml",
    "price": 3.65,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Thornbury Craft Apple Cider",
    "volume": "473ml",
    "price": 3.75,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Brickworks Batch 1904",
    "volume": "473ml",
    "price": 4.0,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "D'Ont Poke The Bear Cider",
    "volume": "473ml",
    "price": 3.65,
    "category": "Ready To Drink",
    "subCategory": "Coolers & RTD",
    "store": "Beer Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Canada Dry",
    "volume": "2L",
    "price": 4.6,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Coca-Cola",
    "volume": "2L",
    "price": 4.5,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Pepsi",
    "volume": "2L",
    "price": 4.6,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Coke Zero",
    "volume": "2L",
    "price": 5.0,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Diet Coke",
    "volume": "2L",
    "price": 4.7,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Lay's Classic Chips",
    "volume": "1 bag",
    "price": 6.0,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Lay's Sour Cream & Onion",
    "volume": "1 bag",
    "price": 6.0,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Ruffles",
    "volume": "1 bag",
    "price": 6.0,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Doritos",
    "volume": "1 bag",
    "price": 7.0,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  },
  {
    "name": "Lighter",
    "volume": "1 unit",
    "price": 4.0,
    "category": "Convenience",
    "subCategory": "Drinks & Snacks",
    "store": "Convenience Store",
    "badge": "",
    "stock": 100
  }
];

// Group same-name products (same category/subCategory/store) whose volume is a
// size or pack (ml / L) into a single product with `variants`. Age-statement
// items (12yr, 18yr, etc.) and one-off items (1 bag, 1 unit) are left as their
// own separate products so nothing gets wrongly merged.
function groupIntoVariants(flat) {
  const isSize = (v) => /\d\s*(ml|l)\b/i.test(v || '');
  const groups = new Map();
  const result = [];

  for (const p of flat) {
    if (!isSize(p.volume)) {
      result.push({ ...p, variants: [] }); // standalone product
      continue;
    }
    const key = [p.name, p.category, p.subCategory, p.store].join('||');
    if (!groups.has(key)) {
      const shell = { ...p, variants: [] };
      groups.set(key, shell);
      result.push(shell);
    }
    groups.get(key).variants.push({
      label: p.volume, price: p.price, stock: p.stock != null ? p.stock : 100, sku: ''
    });
  }

  for (const prod of groups.values()) {
    if (prod.variants.length === 1) {
      const v = prod.variants[0];
      prod.volume = v.label; prod.price = v.price; prod.stock = v.stock;
      prod.variants = [];
    } else {
      prod.price = Math.min(...prod.variants.map(v => v.price)); // "from" price
      prod.volume = '';
    }
  }

  return result;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Settings.deleteMany({});
    await Promotion.deleteMany({});

    // Admin user
    await User.create({
      name: "O'SIPP Admin",
      email: 'admin@osipp.ca',
      phone: '905-462-2160',
      password: 'osipp2024',
      role: 'admin'
    });
    console.log('Admin created: admin@osipp.ca / osipp2024');

    // Products (grouped into size/pack variants)
    const grouped = groupIntoVariants(products);
    const created = await Product.insertMany(grouped);
    console.log(created.length + ' products seeded (grouped from ' + products.length + ' rows)');

    // Settings
    await Settings.create({
      businessName: "O'SIPP Delivery",
      phone: '905-462-2160',
      email: 'support@osipp.ca',
      whatsapp: '+1 905 462 2160',
      instagram: 'https://www.instagram.com/osipp_delivery',
      address: 'Mississauga, ON',
      deliveryLocations: ['Mississauga', 'Brampton', 'Oakville', 'Burlington', 'Milton', 'Toronto (GTA)'],
      deliveryFee: 13,
      deliveryFeeNote: 'Taxes included',
      deliveryTime: '40 minutes',
      ageRequirement: '19+ ID required at delivery',
      minOrder: 0
    });
    console.log('Settings created');

    // Sample promotion
    await Promotion.create({
      title: 'Grand Opening',
      description: 'Free delivery on your first order! Use code OSIPP2024',
      type: 'banner',
      isActive: true
    });
    console.log('Sample promotion created');

    console.log('\nSeed complete! ' + created.length + ' products loaded.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

if (require.main === module) seed();

module.exports = { groupIntoVariants, products };
