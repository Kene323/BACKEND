const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");

const app = express();
const port = process.env.port;

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/userDb")
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log("an error occured in db", err);
  });

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
});

const userModel = mongoose.model("user", userSchema);


//  LOGIN ENDPOINT
    app.get("/login", async (req, res) => {
        try { 
            const {email, password} = req.body
            const checkUser = await userModel.findOne({email})

            if(!checkUser || checkUser.password !== password) {
                res.status(404).json({message: "Invalid email or password"})
            }
             else {
                res.status(200).json({message: "Welcome!!", user: {_id: checkUser._id, name: checkUser.name, email: checkUser.email}})
            }
        } catch (err) {
            res.status(500).json({status: false, error: err.message})
        }
    })


//  GET ALL USERS
app.get("/user", async (req, res) => {
  try {
    const getAllUsers = await userModel.find();
    res.status(200).json({ status: true, getAllUsers });
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
});


//  GET ONE USER
app.get("/get-one-user/:id", async (req, res) => {
  try {
    const get_one_user = await userModel.findById(req.params.id);
    if (!get_one_user) {
      res.status(404).json({ status: false, message: "user not found" });
    }
    res.status(200).json({ status: true, get_one_user });
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
});

//  DELETE A USER
app.delete("/delete-one-user/:id", async (req, res) => {
  try {
    const deleteAUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deleteAUser) {
      res.status(404).json({ status: false, message: "user not found" });
    }
    res.status(200).json({ status: true, message: "user deleted" });
  } catch (error) {
    res.status(500).json({ status: false, error: error });
  }
});

//  CREATE A USER
app.post("/create-user", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const checkIfUserExist = await userModel.findOne({
      email,
    });

    if (checkIfUserExist) {
      res.status(409).json({ message: "user already exist" });
    }
    const user = await userModel.create({ name, email, password });
    res.status(201).json({ status: true, user });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

//  UPDATE A USER
app.patch("/update-user/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updateUser = await userModel.findByIdAndUpdate(
      req.params.id,
      {
        email,
        name,
        password,
      },
      { new: true }
    );

    if (!updateUser) {
      res.status(404).json({ message: "user does not exist" });
    }

    res.status(200).json({ status: true, user: updateUser });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

//  DELETE ALL USERS
app.all("/delete-all-user", async (req, res) => {
  try {
    await userModel.deleteMany();

    res.status(404).json({
      status: true,
      message: "all user deleted",
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

//  CATCH NON-EXISTING ROUTES
app.all("*", (req, res) => {
  res.status(404).json({
    status: false,
    message: "are you lost? this route does not exist",
  });
});

app.listen(port, () => {
  console.log("app is listening to port", port);
});