const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.post("/", productController.createProduct); // Only logged-in users can post
// URL: http://localhost:5000/api/products
router.post("/", productController.createProduct); // To Create
router.get("/", productController.getProducts); // To List All

module.exports = router;
