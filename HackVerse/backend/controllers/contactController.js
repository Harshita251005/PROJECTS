const nodemailer = require('nodemailer');
const SupportTicket = require('../models/SupportTicket');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message, subject = 'General Inquiry' } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create Support Ticket in DB
    const ticket = await SupportTicket.create({
      user: req.user ? req.user.id : undefined,
      subject,
      description: message,
      messages: [{
        sender: req.user ? req.user.id : undefined,
        content: message,
        isStaff: false
      }],
      status: 'open',
      priority: 'normal',
      category: 'general'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });


    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `Support Ticket #${ticket._id}: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Ticket ID:</strong> ${ticket._id}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({
      success: true,
      message: 'Message sent and ticket created successfully',
      ticketId: ticket._id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};