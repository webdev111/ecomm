const express = require("express");
const { validationResult } = require("express-validator");

const { validationErrors, requireAuth } = require("../middleware");
const usersdb = require("../../repos/users");

const router = express.Router();
const {
  emailValidation,
  passwordValidation,
  passwordMatchValidation,
  emailValidationSignin,
  passwordValidationSignin,
} = require("./validation");

// views
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");

// get
router.get("/", requireAuth, async (req, res) => {
  const user = await usersdb.getOne(req.session.userId);
  if (user) {
    const { username, email } = user;
    res.send(`
      <h2>${username}</h2>
      <h4>${email}</h4>
    `);
  } else {
    res.redirect("/signin");
  }
});

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate({ req }));
});

router.get("/signout", requireAuth, (req, res) => {
  req.session = null;
  res.redirect("/signin");
});

// post
router.post(
  '/signup',
  [emailValidation, passwordValidation, passwordMatchValidation],
  validationErrors(signupTemplate),

  async (req, res) => {
    const { username, email, password, passwordCon } = req.body;
    try {
      const insertedUser = await usersdb.create({
        email,
        password,
        username,
      });
      req.session.userId = insertedUser.id;
      res.redirect("/admin/products");
    } catch (error) {
      res.send("oops error");
    }
  }
);

router.post(
  "/signin",
  [passwordValidationSignin, emailValidationSignin],
  validationErrors(signinTemplate),
  async (req, res) => {
    const user = await usersdb.getOneBy({ email: req.body.email });

    req.session.userId = user.id;
    res.redirect("/admin/products");
  }
);

module.exports = router;
