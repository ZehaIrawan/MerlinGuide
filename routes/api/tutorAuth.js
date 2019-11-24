const express = require('express');
require('dotenv').config();
const router = express.Router();
const tutorAuth = require('../../middleware/tutorAuth');
const jwtSecret = process.env.REACT_APP_jwtSecret;
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Tutor = require('../../models/Tutor');

// @route    GET api/tutorAuth
// @desc     Test route
// @access   Public
router.get('/', tutorAuth, async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.tutor.id).select('-password');
    res.json(tutor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let tutor = await Tutor.findOne({ email });

      if (!tutor) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, tutor.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

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