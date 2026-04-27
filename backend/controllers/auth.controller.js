import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/* ---------------- REGISTER ---------------- */
export const register = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    const existingUser = await User.findOne({ phoneOrEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      phoneOrEmail,
      passwordHash,
      role: 'user'
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        phoneOrEmail: user.phoneOrEmail,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------- LOGIN ---------------- */
export const login = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    const user = await User.findOne({ phoneOrEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json({ token });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------- ME ---------------- */
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user._id,
      phoneOrEmail: user.phoneOrEmail,
      role: user.role
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------- REGISTER ADMIN ---------------- */
export const registerAdmin = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    const existingUser = await User.findOne({ phoneOrEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      phoneOrEmail,
      passwordHash,
      role: 'station_admin'
    });

    return res.status(201).json({
      message: 'Admin registered successfully',
      user: {
        id: user._id,
        phoneOrEmail: user.phoneOrEmail,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneOrEmail, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update phone/email if provided
    if (phoneOrEmail) {
      user.phoneOrEmail = phoneOrEmail;
    }

    // Update password if provided
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.passwordHash = hashed;
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        phoneOrEmail: user.phoneOrEmail,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // NOTE: queue check comes later (Dev 4 integration)
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};