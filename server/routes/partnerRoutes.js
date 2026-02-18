const express = require("express");
const router = express.Router();
const Partner = require("../models/Partner");

router.post("/", async (req, res) => {
  try {
    const p = new Partner(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (e) {
    res.status(500).json(e);
  }
});
router.get("/", async (req, res) => {
  const partners = await Partner.find();
  res.json(partners);
});
module.exports = router;
