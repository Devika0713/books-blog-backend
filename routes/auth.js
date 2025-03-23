const router = require("express").Router(); //used to create routes
const User = require("../models/User");
//to hash passwords in the database
const bcrypt = require("bcrypt");

//REGISTER

//creating something -post, updating existing model - put, delete- delete, fetching data and not creating/deleting  get
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    //find if user already exists and if password is same
    const user = await User.findOne({
      username: req.body.username,
    });
    !user && res.status(400).json("Wrong credentials");

    const validate = await bcrypt.compare(req.body.password, user.password);
    !validate && res.status(400).json("Wrong password");

    //display everything but password
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
