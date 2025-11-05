import bcrypt from "bcryptjs";
import { supabase } from "../utils/supabase.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role: "customer",
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const guestLogin = async (req, res) => {
  try {
    // Generate a guest token with limited privileges
    const guestId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const token = generateToken({
      userId: guestId,
      email: null,
      role: "guest",
    });

    res.json({
      success: true,
      message: "Guest login successful",
      token,
      user: {
        id: guestId,
        name: "Guest",
        email: null,
        role: "guest",
      },
    });
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({
      success: false,
      message: "Guest login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const logout = async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint is here for consistency and potential future server-side token blacklisting
  res.json({
    success: true,
    message: "Logout successful",
  });
};

export const verify = async (req, res) => {
  try {
    // Token is already verified by auth middleware
    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", req.user.userId)
      .single();

    if (!user && req.user.role !== "guest") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: user || {
        id: req.user.userId,
        name: "Guest",
        email: null,
        role: "guest",
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
