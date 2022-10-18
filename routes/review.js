const express = require("express");
const { isloggedIn } = require("../middleware");
const router = express.Router();
const Product = require("../models/product");
const { findById } = require("../models/review");
const Review = require("../models/review");
const mongoose = require("mongoose");

router.post("/products/:productid/review", isloggedIn, async (req, res) => {
  try {
    const { productid } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productid);
    const review = new Review({ rating, comment });

    // Average Rating Logic
    const newAverageRating = (product.avgRating * product.reviews.length + parseInt(rating)) / (product.reviews.length + 1);
    product.avgRating = parseFloat(newAverageRating.toFixed(1));

    product.reviews.push(review);

    await review.save();
    await product.save();

    req.flash("success", "Added your review successfully!");
    res.redirect(`/products/${productid}`);
  } catch (e) {
    res.status(500).render("error", { err: e.message });
  }
});

router.delete("/review/:productid/:reviewid", isloggedIn, async (req, res) => {
  const { productid } = req.params;
  const { reviewid } = req.params;
  const product = await Product.findById(productid);

  try {
    const filtered = product.reviews.filter(function (obj) {
      return obj._id != reviewid;
    });

    product.reviews = filtered;
    await product.save();
    res.redirect(`/products/${productid}`);
  } catch (e) {
    res.status(500).render("error", { err: e.message });
  }
});

module.exports = router;
