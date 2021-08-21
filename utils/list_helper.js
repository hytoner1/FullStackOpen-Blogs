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

module.exports = {
  dummy, totalLikes, favoriteBlog
};