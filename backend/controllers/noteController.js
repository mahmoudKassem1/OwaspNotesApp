const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');

// @desc    Get logged in user notes
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id });
  res.json(notes);
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const { title, content, isPrivate } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please add a title and content');
  }

  const note = new Note({
    user: req.user._id,
    title,
    content,
    isPrivate,
  });

  const createdNote = await note.save();
  res.status(201).json(createdNote);
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (note) {
    // Check for note ownership
    if (note.user.toString() !== req.user._id.toString()) {
      res.status(401); // Unauthorized
      throw new Error('User not authorized to delete this note');
    }

    await Note.deleteOne({ _id: req.params.id });
    res.json({ message: 'Note removed' });
  } else {
    res.status(404);
    throw new Error('Note not found');
  }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
    const { title, content, isPrivate } = req.body;

    const note = await Note.findById(req.params.id);

    if (note) {
        // Check for note ownership
        if (note.user.toString() !== req.user._id.toString()) {
            res.status(401); // Unauthorized
            throw new Error('User not authorized to update this note');
        }

        note.title = title || note.title;
        note.content = content || note.content;
        note.isPrivate = typeof isPrivate !== 'undefined' ? isPrivate : note.isPrivate;

        const updatedNote = await note.save();
        res.json(updatedNote);
    } else {
        res.status(404);
        throw new Error('Note not found');
    }
});

module.exports = {
  getNotes,
  createNote,
  deleteNote,
  updateNote,
};
