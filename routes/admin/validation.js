const { check, body } = require("express-validator");
const usersdb = require("../../repos/users");

module.exports = {
  emailValidation: check("email")
    .trim()
    .notEmpty()
    .withMessage("email is empty")
    .isEmail()
    .withMessage("invalid email")
    .custom(async (email) => {
      const exists = await usersdb.getOneBy({ email });
      if (exists) {
        throw new Error("email already registered");
      } else {
        return true;
      }
    }),
  passwordValidation: check("password")
    .notEmpty()
    .withMessage("password is empty")
    .isLength({ min: 4, max: 20 })
    .withMessage("password should be between 4-20"),

  passwordMatchValidation: check("passwordCon")
    .notEmpty()
    .withMessage("confirm password is empty")
    .isLength({ min: 4, max: 20 })
    .withMessage("password should be between 4-20")
    .custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("passwords dont match");
      } else {
        return true;
      }
    }),
  emailValidationSignin: check("email")
    .trim()
    .notEmpty()
    .withMessage("email cannot be empty")
    .isEmail()
    .withMessage("invalid email")
    .custom(async (email) => {
      const user = await usersdb.getOneBy({ email });
      if (!user) {
        throw new Error("email not registered");
      } else {
        return true;
      }
    }),
  passwordValidationSignin: check("password")
    .trim()
    .notEmpty()
    .withMessage("password cannot be empty")
    .custom(async (password, { req }) => {
      const user = await usersdb.getOneBy({ email: req.body.email });
      if (!user) {
        throw new Error(" ");
      }
      // compare above hashed to hash from db
      const passMatched = await usersdb.passMatch(password, user.password);
      if (!passMatched) {
        throw new Error("invalid password");
      }
    }),
  productName: check("title").trim().notEmpty().withMessage("name is required"),
  productPrice: check("price")
    .trim()
    .notEmpty()
    .withMessage("price is required")
    .isLength({ min: 1 })
    .toFloat()
    .isFloat()
    .withMessage("invalid price"),
  productImage: check("image").custom((val,{req})=>{
    if (!req.file) {
      throw new Error('image is required');
    }else{
      return true
    }
  }),
};
