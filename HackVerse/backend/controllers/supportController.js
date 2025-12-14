const SupportTicket = require('../models/SupportTicket');

exports.getTickets = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching support tickets'
    });
  }
};

// @desc    Resolve a ticket
// @route   PUT /api/support/:id/resolve
// @access  Private (Admin only)
exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = 'resolved';
    ticket.resolvedAt = Date.now();
    ticket.resolvedBy = req.user.id;
    
    await ticket.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket resolved successfully'
    });
  } catch (error) {
    console.error('Resolve ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving ticket'
    });
  }
};


exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await ticket.deleteOne();

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting ticket'
    });
  }
};
