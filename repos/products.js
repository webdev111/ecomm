const fs = require("fs");
const crypto = require("crypto");
const Repo = require("./repo");

class ProductsRepo extends Repo {}

module.exports = new ProductsRepo("products.json");
