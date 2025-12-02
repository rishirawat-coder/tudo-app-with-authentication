const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/user");
const Todo = require("./models/todo");

const app = express();
app.use(express.json());


mongoose.connect("mongodb://127.0.0.1:27017/todo-auth");


function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, "MY_SECRET_KEY", (err, data) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = data;
    next();
  });
}



app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashed
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      "MY_SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/todos", auth, async (req, res) => {
  const todo = await Todo.create({
    userId: req.user.id,
    title: req.body.title
  });

  res.status(201).json(todo);
})
app.get("/todos", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.user.id });
  res.status(200).json(todos);
});
app.put("/todos/:id", auth, async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );

  if (!todo) return res.status(404).json({ message: "Todo not found" });

  res.status(200).json(todo);
});

app.delete("/todos/:id", auth, async (req, res) => {
  const deleted = await Todo.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!deleted) return res.status(404).json({ message: "Todo not found" });

  res.status(200).json({ message: "Todo deleted successfully" });
});

app.listen(4000, () => console.log("Server running on port 4000"));
