const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    tokenId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    tokenURI: {
      type: String,
      required: true,
    },
    ipfsHash: {
      type: String,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    transactionHash: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "minted", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries (certificateId and tokenId already indexed via unique/unique sparse)
certificateSchema.index({ studentAddress: 1 });

module.exports = mongoose.model("Certificate", certificateSchema);
