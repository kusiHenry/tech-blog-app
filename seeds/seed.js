// Import required packages
const sequelize = require("../config/connection");

// import models
const { Post, Category } = require("../models");

// add data and seeding for Category model
const categoryData = require("./category.json")
// import seed data
const postData = require("./posts.json");

// Seed database
const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  await Post.bulkCreate(postData);

  process.exit(0);
};

// Call seedDatabase function
seedDatabase();
