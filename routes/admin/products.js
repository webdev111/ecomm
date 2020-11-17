const express = require("express");
const router = express.Router();
const productsdb = require("../../repos/products");
const multer = require("multer");

const { validationErrors, requireAuth } = require("../middleware");
const { productName, productPrice } = require("./validation");
const { validationResult } = require("express-validator");

const upload = multer({ storage: multer.memoryStorage() });

// views
const newProductTemplate = require("../../views/admin/products/newProduct");
const prodIndexTemplate = require("../../views/admin/products/index");

// get
router.get("/admin/products/new", requireAuth, async (req, res) => {
  res.send(newProductTemplate({}));
});

router.get("/admin/products", requireAuth, async (req, res) => {
  const products = await productsdb.getAll();
  res.send(prodIndexTemplate({ products }));
});

router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  [productName, productPrice],
  validationErrors(newProductTemplate),

  async (req, res) => {
    const { title, price } = req.body;
    const img = req.file.buffer.toString("base64");
    await productsdb.create({ title, price, img });
    res.redirect("/admin/products");
  }
);

module.exports = router;
