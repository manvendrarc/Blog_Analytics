import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import lodash from 'lodash';

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;


const API_URL = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const API_HEADERS = {
  'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
};


async function fetchBlogData() {
    try {
      const response = await fetch(API_URL, { method: 'GET', headers: API_HEADERS });
  
      if (!response.ok) {
        throw new Error('Failed to fetch data from the third-party API. Status Code: ' + response.status);
      }
  
      const data = await response.json();
      const blogData = data.blogs; 
  
      if (!Array.isArray(blogData)) {
        throw new Error('Invalid blog data format');
      }
      return blogData;
    } catch (error) {
      throw new Error('Failed to fetch blog data: ' + error.message);
    }
  }

app.get('/api/blog-stats', async (req, res) => {
  try {
    const blogData = await fetchBlogData();

    if (!Array.isArray(blogData)) {
      throw new Error('Invalid blog data format');
    }
    
    // Data Analysis
    const totalBlogs = blogData.length;
    const longestBlog = lodash.maxBy(blogData, 'title.length');
    const blogsWithPrivacy = blogData.filter(blog => blog.title.toLowerCase().includes('privacy'));
    const uniqueTitles = lodash.uniqBy(blogData, 'title');

    const analytics = {
      totalBlogs,
      longestBlog: longestBlog ? longestBlog.title : '', // Handle the case where longestBlog is null
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueTitles: uniqueTitles.map(blog => blog.title),
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Blog search functionality.
app.get('/api/blog-search', async (req, res) => {
  const query = req.query.query.toLowerCase();

  try {
    const blogData = await fetchBlogData();

    // Search functionality
    const searchResults = blogData.filter(blog => blog.title.toLowerCase().includes(query));
    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
