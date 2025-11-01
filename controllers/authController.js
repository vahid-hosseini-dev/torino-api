const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ✅ ارسال OTP
exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile)
    return res.status(400).json({ message: "شماره موبایل را وارد کنید!" });

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({ mobile });
    }

    user.otpCode = otpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`✅ OTP for ${mobile}: ${otpCode}`);

    res.json({ message: "کد اعتبارسنجی ارسال شد.", code: otpCode });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    res.status(500).json({
      message: "خطا در ارسال کد اعتبارسنجی.",
      error: error.message,
    });
  }
};

// ✅ بررسی OTP
exports.checkOtp = async (req, res) => {
  const { mobile, code } = req.body;

  if (!mobile || !code)
    return res
      .status(400)
      .json({ message: "لطفاً شماره موبایل و کد را وارد کنید!" });

  try {
    const user = await User.findOne({ mobile });

    if (!user)
      return res.status(404).json({ message: "کاربری با این شماره یافت نشد." });

    if (user.otpCode !== code || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "کد وارد شده معتبر نیست!" });
    }

    const accessToken = jwt.sign(
      { id: user._id, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "ورود با موفقیت انجام شد.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Error in checkOtp:", error);
    res.status(500).json({
      message: "خطا در بررسی کد اعتبارسنجی.",
      error: error.message,
    });
  }
};

// ✅ رفرش توکن
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "خطای دسترسی، مجددا وارد شوید!" });
  }

  jwt.verify(refreshToken, JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({ message: "خطای دسترسی، مجددا وارد شوید!" });
    }

    const accessToken = jwt.sign(
      { id: userData.id, mobile: userData.mobile },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken });
  });
};
