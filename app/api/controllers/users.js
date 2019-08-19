const userModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
module.exports = {
  create: function(req, res, next) {
    userModel.create(
      {
        email: req.body.email,
        password: req.body.password,
        isVerified: false,
        token: Math.random()
          .toString(36)
          .substring(2)
      },
      function(err, result) {
        if (err) next(err);
        else {
          res.json({
            status: "success",
            message: "User added successfully!!!",
            data: result
          });
        }
      }
    );
  },
  confirmation: function(req, res, next) {
    userModel.findOne({ token: req.query.token }, function(err, userInfo) {
      if (err) {
        next(err);
      } else {
        if (req.query.token === userInfo.token) {
          userInfo.isVerified = true;
          userInfo.update({ isVerified: true }, function(err) {
            if (err) res.json(err);
            else
              res.json({
                status: "success",
                message: "Contact Info updated",
                data: userInfo
              });
          });
        } else {
          res.json({ message: "Not verified" });
        }
      }
    });
  },
  authenticate: function(req, res, next) {
    userModel.findOne({ email: req.body.email }, function(err, userInfo) {
      if (err) {
        next(err);
      } else {
        console.log("user", userInfo);
        if (bcrypt.compareSync(req.body.password, userInfo.password)) {
          const token = jwt.sign(
            { id: userInfo._id },
            req.app.get("secretKey"),
            { expiresIn: "1h" }
          );
          res.json({
            status: "success",
            message: "user found!!!",
            data: { user: userInfo, token: token }
          });
        } else {
          res.json({
            status: "error",
            message: "Invalid email/password!!!",
            data: userInfo
          });
        }
      }
    });
  }
};
