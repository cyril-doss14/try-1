const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function for validating required fields
const validateFields = (fields, res) => {
    for (const field of fields) {
        if (!field.value) {
            return res.status(400).json({ msg: `Please provide ${field.name}` });
        }
    }
};

// Register User
exports.registerUser = async (req, res) => {
    try {
        let { name, email, password, mobile, student, university, workExp, companyName, yearsOfExperience } = req.body;

        const isStudent = student === "true" || student === true;
        const hasWorkExperience = workExp === "true" || workExp === true;

        university = isStudent ? university || null : null;
        companyName = hasWorkExperience ? companyName || null : null;
        yearsOfExperience = hasWorkExperience ? yearsOfExperience || 0 : 0;

        const validationResponse = validateFields([
            { value: name, name: 'name' },
            { value: email, name: 'email' },
            { value: password, name: 'password' },
            { value: mobile, name: 'mobile' }
        ], res);

        if (validationResponse) return validationResponse;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password should be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (hasWorkExperience && (!companyName || yearsOfExperience === undefined)) {
            return res.status(400).json({ msg: 'Company name and years of experience are required for users with work experience' });
        }

        if (isStudent && !university) {
            return res.status(400).json({ msg: 'University is required for students' });
        }

        user = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
            isStudent,
            university,
            hasWorkExperience,
            companyName,
            yearsOfExperience,
            firstLogin: true
        });

        await user.save();

        const payload = {
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return res.status(201).json({
            msg: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                isStudent: user.isStudent,
                university: user.university,
                hasWorkExperience: user.hasWorkExperience,
                companyName: user.companyName,
                yearsOfExperience: user.yearsOfExperience
            },
            isFirstLogin: true
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide both email and password' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User doesnt Exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password' });
        }

        const isFirstLogin = user.firstLogin;
        if (isFirstLogin) {
            user.firstLogin = false;
            await user.save();
        }

        const payload = {
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        return res.json({
            msg: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                isStudent: user.isStudent,
                university: user.university,
                hasWorkExperience: user.hasWorkExperience,
                companyName: user.companyName,
                yearsOfExperience: user.yearsOfExperience
            },
            isFirstLogin
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ msg: 'Server error' });
    }
};

// ✅ Unfollow a user (Updated with validation fix)
exports.unfollowUser = async (req, res) => {
    const { userId, unfollowUserId } = req.body;

    if (!userId || !unfollowUserId) {
        return res.status(400).json({ msg: 'Missing userId or unfollowUserId' });
    }

    try {
        const user = await User.findById(userId);
        const unfollowUser = await User.findById(unfollowUserId);

        if (!user || !unfollowUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Logging to diagnose missing data
        if (!user.name || !unfollowUser.name) {
            console.warn('⚠️ Missing name on unfollow:', {
                userName: user.name,
                unfollowUserName: unfollowUser.name
            });
        }

        // Update lists
        user.following = user.following.filter(id => id.toString() !== unfollowUserId);
        unfollowUser.followers = unfollowUser.followers.filter(id => id.toString() !== userId);

        // Save with validation disabled
        await user.save({ validateBeforeSave: false });
        await unfollowUser.save({ validateBeforeSave: false });

        return res.status(200).json({ msg: 'Unfollowed successfully' });
    } catch (error) {
        console.error("Unfollow error:", error.message);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};