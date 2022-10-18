const express = require("express");
const Joi = require("joi");
const router = express.Router();
const Product = require("../models/product");
const { validateProduct, isloggedIn, isSeller, isProductAuthor } = require("../middleware");
const { showAllProducts, productForm, createProduct, showProduct, editProductForm, updateProduct, deleteProduct } = require("../controllers/product");

// Show all the products
router.get("/products", showAllProducts);

// Display a form to add product

router.get("/products/new", isloggedIn, isSeller, productForm);

// Add a new Product

router.post("/products", isloggedIn, isSeller, createProduct);

router.get("/products/:id", showProduct);

router.get("/products/:id/edit", isloggedIn, isProductAuthor, editProductForm);

// Update a single product
router.patch("/products/:id", isloggedIn, isProductAuthor, updateProduct);

router.delete("/products/:id", isloggedIn, isProductAuthor, deleteProduct);

router.delete("/products/review/:id", isloggedIn, deleteProduct);

module.exports = router;
