const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());
// Paths to JSON files
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ADMIN_FILE = path.join(__dirname, 'data', 'admin.json');
const EVENTS_FILE = path.join(__dirname, 'data', 'events.json');

// ----------- ROUTES -----------

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/admindashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admindashboard.html')));

// ---------- USER ----------

// Register user
app.post('/register', (req, res) => {
    const newUser = req.body;

    fs.readFile(USERS_FILE, (err, data) => {
        if (err) return res.status(500).send('Error reading users file');

        const users = JSON.parse(data);
        users.push(newUser);

        fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), err => {
            if (err) return res.status(500).send('Error saving user');
            res.redirect('/login');
        });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Read the users data from users.json
    fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('Error reading users data');
      }
  
      const users = JSON.parse(data);
      // Find the user based on the email and password
      const user = users.find(u => u.email === email && u.password === password);
  
      if (user) {
        // Return user details if credentials match
        res.json(user);
      } else {
        // Send error if login credentials are incorrect
        res.status(401).send('Invalid credentials');
      }
    });
  });

// ---------- ADMIN ----------

// Admin login
app.post('/admin', (req, res) => {
    const { email, password } = req.body;

    fs.readFile(ADMIN_FILE, (err, data) => {
        if (err) return res.status(500).send('Error reading admin file');

        const admins = JSON.parse(data);
        const admin = admins.find(a => a.email === email && a.password === password);

        if (admin) {
            res.redirect('/admindashboard');
        } else {
            res.send('Invalid admin credentials');
        }
    });
});

// ---------- EVENTS ----------

// Get upcoming events
app.get('/events', (req, res) => {
    fs.readFile(EVENTS_FILE, (err, data) => {
        if (err) return res.status(500).send('Error reading events file');

        const events = JSON.parse(data);
        const today = new Date().toISOString().split('T')[0];

        const upcomingEvents = events.filter(e => e.date >= today);
        res.json(upcomingEvents);
    });
});

// Add event (Admin)
app.post('/add-event', (req, res) => {
    const { name, location, date, time, info } = req.body;
  
    if (!name || !location || !date || !time || !info) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    const newEvent = {
      id: Date.now(),
      name,
      location,
      date,
      time,
      info
    };
  
    fs.readFile(EVENTS_FILE, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading events file:', err);
        return res.status(500).json({ message: 'Error reading events file' });
      }
  
      let events = [];
      try {
        events = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing events file:', parseErr);
      }
  
      events.push(newEvent);
  
      fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), err => {
        if (err) {
          console.error('Error writing events file:', err);
          return res.status(500).json({ message: 'Error saving event' });
        }
  
        res.json({ message: 'Event added successfully' });
      });
    });
  });
  

// Delete event (Admin)
app.delete('/delete-event/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
  
    fs.readFile(EVENTS_FILE, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading events file:', err);
        return res.status(500).json({ message: 'Error reading events' });
      }
  
      let events = JSON.parse(data);
      const updatedEvents = events.filter(e => e.id !== eventId);
  
      fs.writeFile(EVENTS_FILE, JSON.stringify(updatedEvents, null, 2), err => {
        if (err) {
          console.error('Error writing events file:', err);
          return res.status(500).json({ message: 'Error deleting event' });
        }
  
        res.json({ message: 'Event deleted successfully' });
      });
    });
  });
  

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
