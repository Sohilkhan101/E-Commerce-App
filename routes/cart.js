const express = require("express");
const { contentSecurityPolicy } = require("helmet");
const router = express.Router();
const { isloggedIn } = require("../middleware");
const Product = require("../models/product");
const User = require("../models/user");

router.get("/user/cart", isloggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart");
  const totalAmount = user.cart.reduce((sum, curr) => sum + curr.price, 0);
  const productInfo = user.cart.map((p) => p.desc).join(",");

  res.render("cart/cart", { user, totalAmount, productInfo });
});

router.post("/user/:productid", isloggedIn, async (req, res) => {
  const { productid } = req.params;
  const userid = req.user._id;
  const product = await Product.findById(productid);
  const user = await User.findById(userid);

  user.cart.push(product);

  await user.save();

  res.redirect(`/products/${productid}`);
});

router.delete("/cart/:productid", isloggedIn, async (req, res) => {
  const { productid } = req.params;
  const user = await User.findById(req.user._id);

  try {
    const filtered = await user.cart.filter(function (obj) {
      return obj._id != productid;
    });
    user.cart = filtered;
    await user.save();
    res.redirect("/user/cart");
  } catch (e) {
    res.status(500).render("error", { err: e.message });
  }
});

module.exports = router;
