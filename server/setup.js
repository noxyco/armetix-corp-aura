const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = new User({
    name: "Admin",
    email: "admin@armetix.com",
    password: "password123",
    role: "admin",
  });
  await admin.save();
  console.log("✅ Admin user created! Use admin@armetix.com / password123");
  process.exit();
});
