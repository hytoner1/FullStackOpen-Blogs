const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((a, b) => a + (b['likes'] || 0), 0);
};

const favoriteBlog = (blogs) => {
  const likesArray = blogs.map(blog => blog.likes);
  return blogs[likesArray.indexOf(Math.max(...likesArray))];
};

const mostBlogs = (blogs) => {
  let authorsWithNBlogs = {};
  blogs.forEach(blog => {
    if (blog.author in authorsWithNBlogs) {
      authorsWithNBlogs[blog.author] += 1;
    } else {
      authorsWithNBlogs[blog.author] = 1;
    }
  });

  let mostBlogsAuthor = {};
  for (const [key, value] of Object.entries(authorsWithNBlogs)) {
    if (Object.keys(mostBlogsAuthor).length === 0 || value > mostBlogsAuthor.blogs) {
      mostBlogsAuthor = {author: key, blogs: value};
    }
  }

  return mostBlogsAuthor;
};

const mostLikes = (blogs) => {
  let authorsWithLikes = {};
  blogs.forEach(blog => {
    if (blog.author in authorsWithLikes) {
      authorsWithLikes[blog.author] += blog.likes;
    } else {
      authorsWithLikes[blog.author] = blog.likes;
    }
  });

  let mostLikesAuthor = {};
  for (const [key, value] of Object.entries(authorsWithLikes)) {
    if (Object.keys(mostLikesAuthor).length === 0 || value > mostLikesAuthor.likes) {
      mostLikesAuthor = {author: key, likes: value};
    }
  }

  return mostLikesAuthor;
};

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
};