const express = require('express');
const multer = require('multer');
const Booking = require('../models/Booking');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create Booking
router.post('/', upload.array('photos', 5), async (req, res) => {
  const { userId, serviceType, description, preferredDate } = req.body;
  const photos = req.files.map(file => file.path);
  try {
    const booking = new Booking({ user: userId, serviceType, description, preferredDate, photos });
    await booking.save();
    res.status(201).json({ message: "Booking created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Approve/Reschedule Booking and Add Cost
router.post('/:id/confirm', async (req, res) => {
  const { id } = req.params;
  const { status, adminComment, cost } = req.body;
  try {
    const booking = await Booking.findByIdAndUpdate(id, { status, adminComment, cost }, { new: true }).populate('user');
    if (booking) {
      // Send email to user for confirmation
      const user = await User.findById(booking.user);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Booking Confirmation Needed',
        text: `Hello ${user.name},

Your booking for ${booking.serviceType} has been updated. Here are the details:

Status: ${status}
Cost: ${cost}
Admin Comment: ${adminComment}

Please confirm or deny this offer by replying to this email.

Thank you.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Error sending email" });
        } else {
          console.log('Email sent: ' + info.response);
          res.json({ message: "Booking updated and email sent to user" });
        }
      });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
