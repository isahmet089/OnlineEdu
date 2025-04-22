const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  iyzicoPaymentId: { type: String },
  iyzicoConversationId: { type: String },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },
  paidPrice: { type: Number, required: true },
  currency: { type: String, default: "TRY" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);