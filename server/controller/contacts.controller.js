
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

const listAllContacts = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(rows);

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getContactDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'contact not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createContact = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Picture is required' });
    }

    try {
        const { name, contact, email } = req.body;
        const picture = req.file.filename;

        const [existing] = await pool.execute(
            'SELECT id FROM contacts WHERE contact = ? OR email = ?', [contact, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Contact or email already exists' });
        }

        const [result] = await pool.execute(
            'INSERT INTO contacts (name, contact, email, picture) VALUES (?, ?, ?, ?)',
            [name, contact, email, picture]
        );

        const [newContact] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
        res.status(201).json(newContact[0]);
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const editContact = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { name, contact, email } = req.body;
        const [existingContact] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [id]);
        if (existingContact.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        const [duplicates] = await pool.execute(
            'SELECT id FROM contacts WHERE (contact = ? OR email = ?) AND id != ?',
            [contact, email, id]
        );

        if (duplicates.length > 0) {
            return res.status(409).json({ error: 'Contact or email already exists' });
        }

        let picture = existingContact[0].picture;
        if (req.file) {
            picture = req.file.filename;
        }

        await pool.execute(
            'UPDATE contacts SET name = ?, contact = ?, email = ?, picture = ? WHERE id = ?',
            [name, contact, email, picture, id]
        );

        const [updatedContact] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [id]);
        res.json(updatedContact[0]);
    } catch (error) {
        console.error('Error on update:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute('DELETE FROM contacts WHERE id = ?', [id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Contact not found' });

        res.status(204).send();
    } catch (error) {
        console.error('Delete contact error:', error);

        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    listAllContacts,
    deleteContact,
    createContact,
    editContact,
    getContactDetails
};