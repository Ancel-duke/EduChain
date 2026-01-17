const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    certificates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certificate",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
