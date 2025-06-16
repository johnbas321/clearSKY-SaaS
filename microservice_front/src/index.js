import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app and set views directory location
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to simulate authentication
app.use((req, res, next) => {
  req.authToken = 'sample-auth-token'; // Normally read from cookies or headers
  next();
});

app.get('/dashboard', async (req, res) => {
  res.render('index', { user, posts });


  try {
    // Fetch from other microservices
    // const [userRes, postsRes] = await Promise.all([
    //   fetch('http://user-service.local/api/user', {
    //     headers: { Authorization: `Bearer ${req.authToken}` }
    //   }),
    //   fetch('http://post-service.local/api/posts')
    // ]);

    // if (!userRes.ok || !postsRes.ok) throw new Error('Service fetch failed');

    // const user = await userRes.json();
    // const posts = await postsRes.json();

    // Render page with data
    res.render('dashboard', { user, posts });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});





app.get('/dashboard', async (req, res) => {
  try {
    // Fetch from other microservices
    // const [userRes, postsRes] = await Promise.all([
    //   fetch('http://user-service.local/api/user', {
    //     headers: { Authorization: `Bearer ${req.authToken}` }
    //   }),
    //   fetch('http://post-service.local/api/posts')
    // ]);

    // if (!userRes.ok || !postsRes.ok) throw new Error('Service fetch failed');

    // const user = await userRes.json();
    // const posts = await postsRes.json();

    // Render page with data
    res.render('dashboard', { user, posts });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend service listening on port ${PORT}`));
