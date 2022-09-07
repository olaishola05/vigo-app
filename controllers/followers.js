const db = require('../db/db');
const { validationResult } = require('express-validator');
const { followUser } = require('../db/db');

// follow a user
exports.followUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { id } = req.user;
    const { following_id } = req.body;
    const result = await followUser(id, following_id);
    res.status(200).json({ message: 'You are now following this user', result });
  } catch (error) {
    next(error);
  }
}

// unfollow a user
exports.unfollowUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { following_id } = req.body;
    const result = await db.unfollowUser(id, following_id);
    const followers = await db.getFollowers(id);
    const users = await db.getAllUsers();
    const filteredResult = followers.map(follower => {
      return users.find(user => user.id === follower.following_id);
    }).filter(user => user !== undefined).map(user => {
      return { id: user.id, name: user.name, email: user.email };
    }).sort((a, b) => {
      return a.id - b.id;
    }).reverse();
    res.status(200).json({ message: 'You are no longer following this user', filteredResult });
  } catch (error) {
    next(error);
  }
}

// get all followers of a user
exports.getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await db.getAllUsers()
    const followers = await db.getFollowers(id);
    const result = followers.map(follower => {
      return users.find(user => user.id === follower.following_id);
    })
    const filteredResult = result.filter(user => user !== undefined && user.id !== id).map(user => {
      return { id: user.id, name: user.name, email: user.email };
    }).sort((a, b) => {
      return a.id - b.id;
    }).reverse();

    res.status(200).json({
      message: 'Followers retrieved successfully',
      followers: filteredResult,
      count: result.length,
    });
  } catch (error) {
    next(error);
  }
}