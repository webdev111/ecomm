const express = require("express");
const router = express.Router();
const productsdb = require("../../repos/products");
const multer = require("multer");

const { validationErrors, requireAuth } = require("../middleware");
const { productName, productPrice, productImage } = require("./validation");
const { validationResult } = require("express-validator");

const upload = multer({ storage: multer.memoryStorage() });

// views
const prodIndexTemplate = require("../../views/admin/products/index");
const newProductTemplate = require("../../views/admin/products/newProduct");
const editProductTemplate = require("../../views/admin/products/editProduct");

// get
router.get("/admin/products/new", requireAuth, async (req, res) => {
  res.send(newProductTemplate({}));
});

router.get("/admin/products", requireAuth, async (req, res) => {
  const products = await productsdb.getAll();
  res.send(prodIndexTemplate({ products }));
});

// create new product
router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  [productName, productPrice, productImage],
  validationErrors(newProductTemplate),

  async (req, res) => {
    console.log(validationResult(req));
    const { title, price, image } = req.body;
    const img = req.file.buffer.toString("base64");
    await productsdb.create({ title, price, img });
    res.redirect("/admin/products");
  }
);

router.get("/admin/products/:id/edit", requireAuth, async (req, res) => {
  const product = await productsdb.getOne(req.params.id);
  if (!product) {
    return res.redirect("/admin/products?error=invalidId");
  }
  res.send(editProductTemplate({ product }));
});

router.post(
  "/admin/products/:id/edit",
  requireAuth,
  upload.single("image"),
  [productName, productPrice],
  validationErrors(editProductTemplate, async (req) => {
    const product = await productsdb.getOne(req.params.id);
    return { product };
  }),
  async (req, res) => {
    let changes = req.body;
    if (req.file) {
      changes.img = req.file.buffer.toString("base64");
    }

    await productsdb.update(req.params.id, changes);
    res.redirect("/admin/products");
  }
);

router.post("/admin/products/:id/delete", requireAuth, async (req, res) => {
  const product = await productsdb.getOne(req.params.id);
  if (product) {
    await productsdb.delete(req.params.id);
  }
  res.redirect("/admin/products");
});

module.exports = router;
