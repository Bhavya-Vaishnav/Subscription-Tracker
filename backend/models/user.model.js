import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter the password"],
      minLength: 6,
    },
  },
  {timestamps:true}
);

const User=mongoose.model('user',userSchema);

export default User;

