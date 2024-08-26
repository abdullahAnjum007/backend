const User = require("../models/User");
const Complain = require("../models/Complain");
const crypto = require("crypto");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Received email:", email); // Debugging statement

    const user = await User.findOne({ email }).select("+password");
    console.log("User found:", user); // Debugging statement

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Check if users were found
    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found in the database.",
        data: [],
      });
    }

    // Return the users in the response
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users from the database:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
      error: error.message,
    });
  }
};

// exports.getAllUsers = async (req, res) => {
//   try {
//     console.log("Starting to fetch users...");

//     // Fetch users with non-null pushToken
//     const users = await User.find({ pushToken: { $ne: null } });

//     console.log(`Users retrieved: ${users.length}`);

//     // Send successful response
//     res.status(200).json({
//       success: true,
//       data: users,
//     });
//   } catch (error) {
//     // Log the error to identify the issue
//     console.error("Error occurred while fetching users:", error);

//     // Send error response with detailed error information
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching users.",
//       error: {
//         message: error.message,
//         stack: error.stack, // Include stack trace for detailed debugging
//       },
//     });
//   }
// };

exports.addUser = async (req, res) => {
  try {
    // Extract user data from the request body
    const { name, status, email, password } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Email already in use
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    // Create a new user if email does not exist
    const newUserData = {
      name,
      status,
      email,
      password,
    };

    const user = await User.create(newUserData);

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "User Registered",
      user,
    });
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.testUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "", { expires: new Date(0), httpOnly: true });
  res.status(200).json({ success: true, message: "Logged out" });
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Old password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyComplains = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const complains = [];

    for (let i = 0; i < user.complains.length; i++) {
      const complain = await Complain.findById(user.complains[i]).populate(
        "complainer technician"
      );
      complains.push(complain);
    }

    res.status(200).json({
      success: true,
      complains,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUserComplains = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const complains = [];

    for (let i = 0; i < user.complains.length; i++) {
      const complain = await Complain.findById(user.complains[i]).populate(
        "complainer technician"
      );
      complains.push(complain);
    }

    res.status(200).json({
      success: true,
      complains,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
