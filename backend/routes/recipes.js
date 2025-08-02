const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  const { id, title, image, sourceUrl, publisher } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Prevent duplicate recipes
    if (user.recipes.some(recipe => recipe.id === id)) {
      return res.status(400).json({ msg: 'Recipe already saved' });
    }
    user.recipes.push({ id, title, image, sourceUrl, publisher });
    await user.save();
    res.json(user.recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.recipes = user.recipes.filter(recipe => recipe.id !== req.params.id);
    await user.save();
    res.json(user.recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
