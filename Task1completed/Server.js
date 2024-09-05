const express = require('express');
const axios = require('axios');
const app = express();
const mysql = require('mysql2');

app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost', // or your MySQL host
    user: 'root',      // your MySQL user
    password: 'Harsh8237937540',      // your MySQL password
    database: 'contacts_db'    // your MySQL database name
});
//database connection...
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database');
    }
});


// FreshSales CRM API Configuration
const FRESHSALES_API_URL = 'https://mostlearns.myfreshworks.com/crm/sales/api/contacts';
const FRESHSALES_API_KEY = 'Y0';

const axiosInstance = axios.create({
    baseURL: FRESHSALES_API_URL,
    headers: {
        'Authorization': `Token token=${FRESHSALES_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// CRUD Operations with Freshsales CRM

// Create a Contact
app.post('/crm/contacts', (req, res) => {
    const { name, last_name, email, mobile_number } = req.body;

    axiosInstance.post('/', {
        contact: {
            first_name: name,
            last_name: last_name,
            email: email,
            mobile_number: mobile_number
        }
    }).then(response => {
        res.status(201).send(response.data);
    }).catch(err => {
        res.status(500).send(err.message);
        console.error(err);
    });
});

// Retrieve a Contact
app.get('/crm/contacts/:id', (req, res) => {
    const contactId = req.params.id;

    axiosInstance.get(`/${contactId}`)
        .then(response => {
            res.send(response.data);
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
});

// Update a Contact
app.put('/crm/contacts/:id', (req, res) => {
    const contactId = req.params.id;
    const { name, email, phone } = req.body;

    axiosInstance.put(`/${contactId}`, {
        contact: {
            first_name: name,
            email: email,
            phone: phone
        }
    }).then(response => {
        res.send(response.data);
    }).catch(err => {
        res.status(500).send(err.message);
    });
});

// Delete a Contact
app.delete('/crm/contacts/:id', (req, res) => {
    const contactId = req.params.id;

    axiosInstance.delete(`/${contactId}`)
        .then(response => {
            res.send({ message: 'Contact deleted successfully' });
        })
        .catch(err => {
            res.status(500).send(err.message);
        });
});

// CRUD Operations with MySQL Database

// Create a new contact
app.post('/contacts', (req, res) => {
    const { first_name, last_name, email, phone } = req.body;

    const query = 'INSERT INTO contacts (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)';
    db.query(query, [first_name, last_name, email, phone], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error creating contact', error: err.message });
        }
        res.status(201).json({ message: 'Contact created successfully', contactId: result.insertId });
    });
});

// Read all contacts
app.get('/contacts', (req, res) => {
    const query = 'SELECT * FROM contacts';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching contacts', error: err.message });
        }
        res.status(200).json(results);
    });
});

// Read a single contact by ID
app.get('/contacts/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM contacts WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching contact', error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json(result[0]);
    });
});

// Update a contact
app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone } = req.body;

    const query = 'UPDATE contacts SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?';
    db.query(query, [first_name, last_name, email, phone, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating contact', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json({ message: 'Contact updated successfully' });
    });
});

// Delete a contact
app.delete('/contacts/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM contacts WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting contact', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.status(200).json({ message: 'Contact deleted successfully' });
    });
});







// Server Setup
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
