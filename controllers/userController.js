const User = require('../models/User');
const Tour = require('../models/Tour');
const Transaction = require('../models/Transaction');

// دریافت اطلاعات پروفایل کاربر
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otpCode -otpExpires');
    if (!user) return res.status(404).json({ message: "کاربر پیدا نشد." });
    res.json(user);
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: "خطا در دریافت اطلاعات کاربر." });
  }
};

// ویرایش اطلاعات کاربر
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, gender } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, gender },
      { new: true }
    ).select('-otpCode -otpExpires');

    if (!user) return res.status(404).json({ message: "کاربر پیدا نشد." });

    res.json({
      message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد.",
      user,
    });
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ message: "خطا در به‌روزرسانی اطلاعات کاربر." });
  }
};



// لیست تورهای کاربر
exports.getUserTours = async (req, res) => {
  try {
    const tours = await Tour.find({ userId: req.user.id });
    res.json(tours);
  } catch (err) {
    console.error('Error in getUserTours:', err);
    res.status(500).json({ message: "خطا در دریافت تورهای کاربر." });
  }
};

// لیست تراکنش‌های کاربر
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    console.error('Error in getUserTransactions:', err);
    res.status(500).json({ message: "خطا در دریافت تراکنش‌های کاربر." });
  }
};
