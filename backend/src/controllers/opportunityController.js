const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities (shared pipeline)
// @route   GET /api/opportunities
// @access  Private
const getOpportunities = async (req, res, next) => {
  try {
    const { stage, priority, sort } = req.query;

    // Build filter
    const filter = {};
    if (stage && stage !== 'All') filter.stage = stage;
    if (priority && priority !== 'All') filter.priority = priority;

    // Build sort
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'value_desc') sortOption = { estimatedValue: -1 };
    else if (sort === 'value_asc') sortOption = { estimatedValue: 1 };
    else if (sort === 'followup') sortOption = { nextFollowUpDate: 1 };
    else if (sort === 'priority') {
      // Custom sort: High > Medium > Low
      sortOption = { priority: 1 }; // will be handled in aggregation
    }

    const opportunities = await Opportunity.find(filter)
      .populate('owner', 'name email')
      .sort(sortOption)
      .lean();

    // If priority sort, do it in JS (enum order)
    if (sort === 'priority') {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      opportunities.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    // Mark which ones belong to the requesting user
    const result = opportunities.map((opp) => ({
      ...opp,
      isOwner: opp.owner._id.toString() === req.user._id.toString(),
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Private
const getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('owner', 'name email')
      .lean();

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...opportunity,
        isOwner: opportunity.owner._id.toString() === req.user._id.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create opportunity
// @route   POST /api/opportunities
// @access  Private
const createOpportunity = async (req, res, next) => {
  try {
    const {
      customerName,
      contactName,
      contactEmail,
      contactPhone,
      requirement,
      estimatedValue,
      stage,
      priority,
      nextFollowUpDate,
      notes,
    } = req.body;

    // Validate required fields
    if (!customerName || !requirement) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and requirement summary are required',
      });
    }

    // Owner is derived from JWT — never from request body
    const opportunity = await Opportunity.create({
      owner: req.user._id,
      customerName: customerName.trim(),
      contactName: contactName?.trim() || '',
      contactEmail: contactEmail?.trim().toLowerCase() || '',
      contactPhone: contactPhone?.trim() || '',
      requirement: requirement.trim(),
      estimatedValue: estimatedValue >= 0 ? estimatedValue : 0,
      stage: stage || 'New',
      priority: priority || 'Medium',
      nextFollowUpDate: nextFollowUpDate || null,
      notes: notes?.trim() || '',
    });

    const populated = await Opportunity.findById(opportunity._id)
      .populate('owner', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: { ...populated, isOwner: true },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (owner only)
const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Ownership check — enforced on backend
    if (opportunity.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only edit your own opportunities.',
      });
    }

    // Allowed fields to update (never allow changing owner)
    const {
      customerName,
      contactName,
      contactEmail,
      contactPhone,
      requirement,
      estimatedValue,
      stage,
      priority,
      nextFollowUpDate,
      notes,
    } = req.body;

    const updateData = {};
    if (customerName !== undefined) updateData.customerName = customerName.trim();
    if (contactName !== undefined) updateData.contactName = contactName.trim();
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail.trim().toLowerCase();
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone.trim();
    if (requirement !== undefined) updateData.requirement = requirement.trim();
    if (estimatedValue !== undefined) updateData.estimatedValue = Math.max(0, estimatedValue);
    if (stage !== undefined) updateData.stage = stage;
    if (priority !== undefined) updateData.priority = priority;
    if (nextFollowUpDate !== undefined) updateData.nextFollowUpDate = nextFollowUpDate || null;
    if (notes !== undefined) updateData.notes = notes.trim();

    const updated = await Opportunity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email').lean();

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      data: { ...updated, isOwner: true },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (owner only)
const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    // Ownership check — enforced on backend
    if (opportunity.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only delete your own opportunities.',
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
