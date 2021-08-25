const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (req, res) => {
  const blogs=await Blog
    .find({}).populate('user', {name: 1, username: 1});
  res.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  blog ? res.json(blog.toJSON()) : res.status(404).end();
});

blogsRouter.post('/', async (req, res) => {
  const body = req.body;
  const user = await User.findById(req.user);

  if (!body.title) {
    return res.status(400).json({
      error: 'Body content `title` missing'
    });
  }

  if (!body.url) {
    return res.status(400).json({
      error: 'Body content `url` missing'
    });
  }

  if (!user) {
    return res.status(400).json({
      error: 'no user with the given id ' + req.user
    });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  });

  const savedBlog=await blog.save();

  user.blogs=user.blogs.concat(savedBlog._id);
  await user.save();

  res.json(savedBlog.toJSON());
});

blogsRouter.delete('/:id', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!req.token || !decodedToken.id) {
    return res.status(401).json({error: 'token missing or invalid'});
  }

  const blog = await Blog.findById(req.params.id);
  console.log(blog);
  console.log(decodedToken.id);
  console.log(blog.user.id);

  if (req.user === blog.user.toString()) {
    await Blog.findByIdAndRemove(req.params.id);
    res.status(204).end();
  } else {
    res.status(401).end();
  }

});

blogsRouter.put('/:id', async (req, res) => {
  const body = req.body;

  const blog = {
    likes: Number(body.likes)
  };

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {new: true});
  res.json(updatedBlog.toJSON());
});

module.exports = blogsRouter;