const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res, next) => {
  console.log("Hit", req.body);
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    if (user) {
      return res.status(409).json({
        message: "User already exists",
      });
    }
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        const user = new User({
          username: req.body.email,
          email: req.body.email,
          password: hash,
          phonenumber: req.body.phonenumber,
        });

        user
          .save()
          .then((result) => {
            res.status(200).json({
              message: "New user added",
            });
          })
          .catch({
            error: err,
          });
      }
    });
  });
});

router.post("/login", (req, res, next) => {
  console.log(req.body);
  User.find({ username: req.body.email })
    .exec()
    .then((User) => {
      if (User.length < 1) {
        return res.status(401).json({
          msg: "user not exist",
        });
      }
      bcrypt.compare(req.body.password, User[0].password, (err, result) => {
        if (!result) {
          res.status(401).json({
            msg: "Password doesn't match",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              username: User[0].username,
              email: User[0].email,
              phonenumber: User[0].phonenumber,
            },
            "this is a dummy text",
            {
              expiresIn: "24h",
            }
          );
          res.status(200).json({
            username: User[0].username,
            email: User[0].email,
            phonenumber: User[0].phonenumber,
            token: token,
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
module.exports = router;
