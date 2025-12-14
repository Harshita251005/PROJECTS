const Schedule = require('../models/Schedule');
const Event = require('../models/Event');

// Create schedule item
exports.createScheduleItem = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, type, speaker, startTime, endTime, location, meetingLink, tags } = req.body;


    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add schedule items' });
    }

    const scheduleItem = await Schedule.create({
      event: eventId,
      title,
      description,
      type,
      speaker,
      startTime,
      endTime,
      location,
      meetingLink,
      tags,
    });

    res.status(201).json({
      success: true,
      data: scheduleItem,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get event schedule
exports.getEventSchedule = async (req, res) => {
  try {
    const { eventId } = req.params;

    const scheduleItems = await Schedule.find({ event: eventId }).sort({ startTime: 1 });

    res.json({
      success: true,
      count: scheduleItems.length,
      data: scheduleItems,
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update schedule item
exports.updateScheduleItem = async (req, res) => {
  try {
    const { id } = req.params;

    const scheduleItem = await Schedule.findById(id).populate('event');
    if (!scheduleItem) {
      return res.status(404).json({ success: false, message: 'Schedule item not found' });
    }

    // Check authorization
    if (scheduleItem.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedItem = await Schedule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete schedule item
exports.deleteScheduleItem = async (req, res) => {
  try {
    const { id } = req.params;

    const scheduleItem = await Schedule.findById(id).populate('event');
    if (!scheduleItem) {
      return res.status(404).json({ success: false, message: 'Schedule item not found' });
    }

    // Check authorization
    if (scheduleItem.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Schedule.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Schedule item deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
