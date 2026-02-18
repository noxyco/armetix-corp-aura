const Product = require("../models/Product");

// ADD A NEW PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { reference, designation, priceHT, tvaRate, stockQuantity } =
      req.body;

    // Validation for Moroccan TVA rates
    if (![7, 10, 14, 20].includes(Number(tvaRate))) {
      return res
        .status(400)
        .json({ message: "Invalid Moroccan TVA rate. Use 7, 10, 14, or 20." });
    }

    const newProduct = new Product({
      reference,
      designation,
      priceHT,
      tvaRate,
      stockQuantity,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PRODUCTS (Inventory View)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
