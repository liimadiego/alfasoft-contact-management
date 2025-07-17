const { createContact, editContact } = require('../controller/contacts.controller');
const { validationResult } = require('express-validator');
const pool = require('../config/database').pool;

jest.mock('express-validator');
jest.mock('../config/database', () => ({
    pool: {
        execute: jest.fn()
    }
}))
describe('Contact Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            body: {}, file: null, params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createContact', () => {
        describe('Validation Tests', () => {
            it('should return 400 when validation errors exist', async () => {
                const mockErrors = {
                    isEmpty: jest.fn().mockReturnValue(false),
                    array: jest.fn().mockReturnValue([{ msg: 'Name must be at least 6 characters long' }])
                };
                validationResult.mockReturnValue(mockErrors);

                await createContact(mockReq, mockRes)

                expect(mockRes.status).toHaveBeenCalledWith(400)
                expect(mockRes.json).toHaveBeenCalledWith({
                    errors: [{ msg: 'Name must be at least 6 characters long' }]
                });
            });

            it('should return 400 when no file is provided', async () => {
                validationResult.mockReturnValue({
                    isEmpty: jest.fn().mockReturnValue(true)
                });

                mockReq.file = null
                await createContact(mockReq, mockRes);
                expect(mockRes.status).toHaveBeenCalledWith(400);
                expect(mockRes.json).toHaveBeenCalledWith({ error: 'Picture is required' });
            });
        });

        describe('Database Tests', () => {
            beforeEach(() => {
                validationResult.mockReturnValue({
                    isEmpty: jest.fn().mockReturnValue(true)
                });
                mockReq.file = { filename: 'test-image.jpg' };
                mockReq.body = {
                    name: 'Diego Dev', contact: '123456789', email: 'diegodev@example.com'
                };
            });

            it('should return 409 when contact or email already exists', async () => {
                pool.execute.mockResolvedValueOnce([
                    [{ id: 1 }]
                ]);

                await createContact(mockReq, mockRes);

                expect(pool.execute).toHaveBeenCalledWith(
                    'SELECT id FROM contacts WHERE contact = ? OR email = ?',
                    ['123456789', 'diegodev@example.com']
                );
                expect(mockRes.status).toHaveBeenCalledWith(409);
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Contact or email already exists'
                });
            });

            it('should create contact successfully when no duplicates exist', async () => {
                const mockInsertResult = { insertId: 1 };

                const mockNewContact = {
                    id: 1,
                    name: 'Diego Dev',
                    contact: '123456789',
                    email: 'diegodev@example.com',
                    picture: 'test-image.jpg'
                };

                pool.execute.mockResolvedValueOnce([[]]).mockResolvedValueOnce([mockInsertResult]).mockResolvedValueOnce([[mockNewContact]]);
                await createContact(mockReq, mockRes);
                expect(pool.execute).toHaveBeenCalledTimes(3);
                expect(pool.execute).toHaveBeenNthCalledWith(1,
                    'SELECT id FROM contacts WHERE contact = ? OR email = ?',
                    ['123456789', 'diegodev@example.com']
                );

                expect(pool.execute).toHaveBeenNthCalledWith(2,
                    'INSERT INTO contacts (name, contact, email, picture) VALUES (?, ?, ?, ?)',
                    ['Diego Dev', '123456789', 'diegodev@example.com', 'test-image.jpg']
                );

                expect(pool.execute).toHaveBeenNthCalledWith(3,
                    'SELECT * FROM contacts WHERE id = ?',
                    [1]
                );
                expect(mockRes.status).toHaveBeenCalledWith(201);

                expect(mockRes.json).toHaveBeenCalledWith(mockNewContact);
            });

            it('should return 500 when database error occurs', async () => {
                pool.execute.mockRejectedValueOnce(new Error('Database connection failed'));

                console.error = jest.fn();

                await createContact(mockReq, mockRes);

                expect(console.error).toHaveBeenCalledWith('Create contact error:', expect.any(Error));
                expect(mockRes.status).toHaveBeenCalledWith(500);
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Internal server error'
                });
            });
        });
    });

    describe('editContact', () => {
        beforeEach(() => {
            mockReq.params = { id: '1' };
            mockReq.body = {
                name: 'Gabriella',
                contact: '987654321',
                email: 'gabriella@example.com'
            };
        });

        describe('Validation Tests', () => {
            it('should return 400 when validation errors exist', async () => {
                const mockErrors = {
                    isEmpty: jest.fn().mockReturnValue(false),
                    array: jest.fn().mockReturnValue([
                        { msg: 'Contact must be exactly 9 digits' }
                    ])
                };


                validationResult.mockReturnValue(mockErrors);

                await editContact(mockReq, mockRes);
                expect(mockRes.status).toHaveBeenCalledWith(400);
                expect(mockRes.json).toHaveBeenCalledWith({
                    errors: [{ msg: 'Contact must be exactly 9 digits' }]
                });
            });
        });

        describe('Database Tests', () => {
            beforeEach(() => {
                validationResult.mockReturnValue({
                    isEmpty: jest.fn().mockReturnValue(true)
                });
            });

            it('should return 404 when contact not found', async () => {
                pool.execute.mockResolvedValueOnce([[]]);
                await editContact(mockReq, mockRes)

                expect(pool.execute).toHaveBeenCalledWith(
                    'SELECT * FROM contacts WHERE id = ?',
                    ['1']
                );
                expect(mockRes.status).toHaveBeenCalledWith(404)
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Contact not found'
                });
            });

            it('should return 409 when contact or email already exists for another contact', async () => {
                const existingContact = {
                    id: 1,
                    name: 'Diego Dev',
                    contact: '123456789',
                    email: 'diegodev@example.com',
                    picture: 'old-image.jpg',
                };

                pool.execute
                    .mockResolvedValueOnce([[existingContact]])
                    .mockResolvedValueOnce([[{ id: 2 }]]);

                await editContact(mockReq, mockRes);

                expect(pool.execute).toHaveBeenCalledWith(
                    'SELECT id FROM contacts WHERE (contact = ? OR email = ?) AND id != ?',
                    ['987654321', 'gabriella@example.com', '1']
                );

                expect(mockRes.status).toHaveBeenCalledWith(409);
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Contact or email already exists'
                });
            });

            it('should update contact successfully without new picture', async () => {
                const existingContact = {
                    id: 1,
                    name: 'Diego Dev',
                    contact: '123456789',
                    email: 'diegodev@example.com',
                    picture: 'old-image.jpg'
                };
                const updatedContact = {
                    id: 1,
                    name: 'Gabriella',
                    contact: '987654321',
                    email: 'gabriella@example.com',
                    picture: 'old-image.jpg'
                };

                pool.execute
                    .mockResolvedValueOnce([[existingContact]])
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([])
                    .mockResolvedValueOnce([[updatedContact]]);
                await editContact(mockReq, mockRes);

                expect(pool.execute).toHaveBeenCalledWith(
                    'UPDATE contacts SET name = ?, contact = ?, email = ?, picture = ? WHERE id = ?',
                    ['Gabriella', '987654321', 'gabriella@example.com', 'old-image.jpg', '1']
                );
                expect(mockRes.json).toHaveBeenCalledWith(updatedContact);
            });

            it('should update contact successfully with new picture', async () => {
                const existingContact = {
                    id: 1,
                    name: 'Diego Dev',
                    contact: '123456789',
                    email: 'diegodev@example.com',
                    picture: 'old-image.jpg'
                };

                const updatedContact = {
                    id: 1,
                    name: 'Gabriella',
                    contact: '987654321',
                    email: 'gabriella@example.com',
                    picture: 'new-image.jpg'
                };

                mockReq.file = { filename: 'new-image.jpg' };

                pool.execute
                    .mockResolvedValueOnce([[existingContact]])
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([])
                    .mockResolvedValueOnce([[updatedContact]]);

                await editContact(mockReq, mockRes);

                expect(pool.execute).toHaveBeenCalledWith(
                    'UPDATE contacts SET name = ?, contact = ?, email = ?, picture = ? WHERE id = ?',
                    ['Gabriella', '987654321', 'gabriella@example.com', 'new-image.jpg', '1']);
                expect(mockRes.json).toHaveBeenCalledWith(updatedContact);
            });

            it('should return 500 when database error occurs', async () => {
                pool.execute.mockRejectedValueOnce(new Error('Database connection failed'));
                console.error = jest.fn()
                await editContact(mockReq, mockRes);

                expect(console.error).toHaveBeenCalledWith('Error on update:', expect.any(Error));
                expect(mockRes.status).toHaveBeenCalledWith(500);
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Internal server error'
                });
            });
        });
    });
});

describe('Contact Controller Integration', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            body: {},
            file: null,
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('Edge Cases', () => {
        it('should handle empty request body gracefully in createContact', async () => {
            validationResult.mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(true)
            });
            mockReq.file = { filename: 'test.jpg' };
            mockReq.body = {}

            pool.execute.mockResolvedValueOnce([[]]);

            await createContact(mockReq, mockRes);
            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT id FROM contacts WHERE contact = ? OR email = ?',
                [undefined, undefined]
            );
        });

        it('should handle string ID parameter in editContact', async () => {
            validationResult.mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(true)
            });
            mockReq.params.id = 'abc'
            mockReq.body = {
                name: 'Test User',
                contact: '123456789',
                email: 'test@example.com'
            };

            pool.execute.mockResolvedValueOnce([[]]);

            await editContact(mockReq, mockRes);

            expect(pool.execute).toHaveBeenCalledWith(
                'SELECT * FROM contacts WHERE id = ?',
                ['abc']
            );
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });
});