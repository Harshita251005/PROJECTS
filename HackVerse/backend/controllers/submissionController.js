const Submission = require('../models/Submission');

const Team = require('../models/Team');
const Event = require('../models/Event');
const Notification = require('../models/Notification');


exports.createSubmission = async (req, res) => {
  try {
    const { teamId, eventId, title, description, repoLink, demoLink, videoLink, slidesLink } = req.body;

    // Check if team exists and user is leader
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can submit project' });
    }

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check deadline (assuming registrationDeadline or end date, or specific submission deadline if added)
    // For now using endDate as submission deadline
    if (new Date() > new Date(event.endDate)) {
      return res.status(400).json({ success: false, message: 'Submission deadline has passed' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({ team: teamId });
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: 'Project already submitted. Please update existing submission.' });
    }

    const submission = await Submission.create({
      team: teamId,
      event: eventId,
      title,
      description,
      repoLink,
      demoLink,
      videoLink,
      videoLink,
      slidesLink,
      status: 'submitted',
    });

    // Notify team members
    // (Implementation omitted for brevity, but good to have)

    res.status(201).json({
      success: true,
      message: 'Project submitted successfully',
      submission,
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ success: false, message: 'Error submitting project', error: error.message });
  }
};


exports.updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Check team leadership
    const team = await Team.findById(submission.team);
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can update submission' });
    }

    // Check deadline
    const event = await Event.findById(submission.event);
    if (new Date() > new Date(event.endDate)) {
      return res.status(400).json({ success: false, message: 'Submission deadline has passed' });
    }

    const { title, description, repoLink, demoLink, videoLink, slidesLink } = req.body;

    if (title) submission.title = title;
    if (description) submission.description = description;
    if (repoLink) submission.repoLink = repoLink;
    if (demoLink) submission.demoLink = demoLink;
    if (videoLink) submission.videoLink = videoLink;
    if (slidesLink) submission.slidesLink = slidesLink;

    await submission.save();

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission,
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ success: false, message: 'Error updating submission', error: error.message });
  }
};


exports.reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    if (!['finalized', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const submission = await Submission.findById(id).populate('event');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Verify organizer (or admin)
    if (submission.event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to review' });
    }

    submission.status = status;
    if (status === 'finalized') {
      submission.finalizedAt = Date.now();
      submission.rejectionRemark = undefined; // Clear previous remark if approved
    } else if (status === 'rejected') {
      submission.rejectionRemark = remark;
    }

    await submission.save();

    res.json({
      success: true,
      message: `Submission ${status} successfully`,
      submission,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ success: false, message: 'Error reviewing submission', error: error.message });
  }
};

exports.finalizeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const team = await Team.findById(submission.team);
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can finalize submission' });
    }

    const event = await Event.findById(submission.event);
    if (new Date() > new Date(event.endDate)) {
      return res.status(400).json({ success: false, message: 'Submission deadline has passed' });
    }

    submission.status = 'finalized';
    submission.finalizedAt = Date.now();
    
    // Save current version to versions history
    submission.versions.push({
      versionNumber: submission.version,
      title: submission.title,
      description: submission.description,
      repoLink: submission.repoLink,
      demoLink: submission.demoLink,
      videoLink: submission.videoLink,
      slidesLink: submission.slidesLink,
      savedAt: new Date()
    });
    
    submission.version += 1;
    
    await submission.save();

    res.json({
      success: true,
      message: 'Submission finalized successfully',
      submission,
    });
  } catch (error) {
    console.error('Finalize submission error:', error);
    res.status(500).json({ success: false, message: 'Error finalizing submission', error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      event: req.params.eventId,
      status: 'finalized' 
    })
      .populate('team', 'name members')
      .populate({
        path: 'team',
        populate: { path: 'members', select: 'name profilePicture' }
      })
      .sort({ createdAt: -1 }); // Or sort by score if scores exist

    res.json({
      success: true,
      data: submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaderboard', error: error.message });
  }
};

exports.getEventSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ event: req.params.eventId })
      .populate('team', 'name members')
      .populate({
        path: 'team',
        populate: { path: 'members', select: 'name profilePicture' }
      });

    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching submissions', error: error.message });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('team', 'name members')
      .populate({
        path: 'team',
        populate: { path: 'members', select: 'name profilePicture' }
      });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }



    res.json({
      success: true,
      submission,

    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ success: false, message: 'Error fetching submission', error: error.message });
  }
};




exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('team', 'name leader')
      .populate('event', 'title')
      .populate({
         path: 'team',
         populate: { path: 'leader', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching all submissions', error: error.message });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's teams
    const teams = await Team.find({ members: userId })
      .populate('event', 'title startDate endDate status')
      .select('name event members leader');

    // Get submissions for user's teams
    const teamIds = teams.map(team => team._id);
    const submissions = await Submission.find({ team: { $in: teamIds } })
      .populate('team', 'name')
      .populate('event', 'title')
      .select('title status finalizedAt createdAt version event team');



    // Calculate progress metrics
    const totalEvents = [...new Set(teams.map(t => t.event?._id?.toString()))].filter(Boolean).length;
    const totalTeams = teams.length;
    const totalSubmissions = submissions.length;
    const finalizedSubmissions = submissions.filter(s => s.status === 'finalized' || s.status === 'reviewed').length;
    const draftSubmissions = submissions.filter(s => s.status === 'draft').length;

    // Calculate milestones
    const milestones = {
      firstEventJoined: totalEvents > 0,
      firstTeamCreated: totalTeams > 0,
      firstSubmission: totalSubmissions > 0,
      firstFinalizedSubmission: finalizedSubmissions > 0,
      multipleEvents: totalEvents >= 3,
      activeParticipant: totalSubmissions >= 5,
    };

    // Group submissions by status
    const submissionsByStatus = {
      draft: submissions.filter(s => s.status === 'draft'),
      finalized: submissions.filter(s => s.status === 'finalized'),
      reviewed: submissions.filter(s => s.status === 'reviewed'),
      locked: submissions.filter(s => s.status === 'locked'),
    };

    // Calculate completion percentage
    let completionPercentage = 0;
    if (totalTeams > 0) completionPercentage += 25;
    if (totalSubmissions > 0) completionPercentage += 25;
    if (finalizedSubmissions > 0) completionPercentage += 25;


    res.json({
      success: true,
      progress: {
        metrics: {
          totalEvents,
          totalTeams,
          totalSubmissions,
          finalizedSubmissions,
          draftSubmissions,
          completionPercentage,
        },
        teams,
        submissions,
        submissionsByStatus,

        milestones,
      },
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ success: false, message: 'Error fetching progress data', error: error.message });
  }
};
