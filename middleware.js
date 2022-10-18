const { productSchema, reviewSchema } = require("./schemas");
const Product = require("./models/product");

module.exports.isloggedIn = (req, res, next) => {
  if (req.xhr && !req.isAuthenticated()) {
    if (req.session.returnUrl) {
      delete req.session.returnUrl;
    }
    req.flash("error", "Please login to continue");
    return res.status(401).json({ msg: "You need to login first" });
  }
  // console.log(req.originalUrl);
  // console.log(req.session);
  req.session.returnUrl = req.originalUrl;

  if (!req.isAuthenticated()) {
    req.flash("error", "You need to login first to do that!");
    return res.redirect("/login");
  }
  console.log("Yes LoggedIn");
  next();
};

module.exports.validateProduct = (req, res, next) => {
  console.log("Enter Validat page");

  const { name, img, desc, price } = req.body;
  const { error } = productSchema.validate({ name, img, price, desc });

  if (error) {
    const msg = error.details.map((err) => err.message).join(", this is error");
    return res.render("error", { err: msg });
  }
  console.log("End Validat page");
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { rating, comment } = req.body;
  const { error } = reviewSchema.validate({ rating, comment });

  if (error) {
    const msg = error.details.map((err) => err.message).join(",");
    return res.render("error", { err: msg });
  }
  next();
};

module.exports.isSeller = (req, res, next) => {
  if (req.user.role !== "Seller") {
    req.flash("error", "You don't have permissions to do that ");
    return res.redirect("/products");
  }
  console.log("Yes Seller");

  next();
};

module.exports.isProductAuthor = async (req, res, next) => {
  // Getting a product id
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!(product.author && product.author.equals(req.user._id))) {
    req.flash("error", "You dont have permissions to do that");
    return res.redirect(`/products/${id}`);
  }
  next();
  // module.exports.isReviewAuthor = async (req, res, next) => {
  //   // Getting a product id
  //   const { id } = req.params;
  //   const product = await Product.findById(id);

  //   if (!(product.author && product.author.equals(req.user._id))) {
  //     req.flash("error", "You dont have permissions to do that");
  //     return res.redirect(`/products/${id}`);
  //   }
  //   next();
};
