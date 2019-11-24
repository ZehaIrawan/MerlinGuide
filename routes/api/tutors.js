const express = require('express');
require('dotenv').config();
const router = express.Router();
const tutorAuth = require('../../middleware/tutorAuth');
const jwtSecret = process.env.REACT_APP_jwtSecret;
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Tutor = require('../../models/Tutor');

// @route   GET api/tutors
// @desc    Register route
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let tutor = await Tutor.findOne({ email });

      if (tutor) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'tutor already exists' }] });
      }

      tutor = new Tutor({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      tutor.password = await bcrypt.hash(password, salt);

      await tutor.save();

      const payload = {
        tutor: {
          id: tutor.id,
        },
      };

      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },
);

module.exports = router;
