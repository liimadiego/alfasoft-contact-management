const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/jwt.js');
const { contactValidation } = require('../middleware/validation.js');
const { upload } = require('../config/file_upload.js');
const { createContact,
    deleteContact,
    editContact,
    listAllContacts,
    getContactDetails
} = require('../controller/contacts.controller.js');

router.get('/', listAllContacts);

router.get('/:id', getContactDetails);

router.post('/', authenticateToken, upload.single('picture'), contactValidation, createContact);

router.put('/:id', authenticateToken, upload.single('picture'), contactValidation, editContact);

router.delete('/:id', authenticateToken, deleteContact);
module.exports = router;