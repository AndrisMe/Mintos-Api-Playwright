import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080/api';
const USER_ENDPOINT = `${BASE_URL}/users`;

interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    personalIdDocument: {
        documentId: string;
        countryOfIssue: string;
        validUntil: string;
    };
}

interface ProblemDetails {
    type?: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
}

test.describe('User Account API Tests', () => {
    let userId: string;

    test('1. Create User - Successful creation with valid data', async ({ request }) => {
        const userData: User = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            dateOfBirth: '1985-10-01',
            personalIdDocument: {
                documentId: 'AB123456',
                countryOfIssue: 'US',
                validUntil: '2030-12-31'
            }
        };

        const response = await request.post(USER_ENDPOINT, {
            data: userData,
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(response.status()).toBe(201);
        const responseBody: User = await response.json();
        expect(responseBody.id).toBeDefined();
        userId = responseBody.id; // Store the user ID for later tests
    });

    test('2. Get User by ID - Retrieve an existing user', async ({ request }) => {
        const response = await request.get(`${USER_ENDPOINT}/${userId}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(response.status()).toBe(200);
        const responseBody: User = await response.json();
        expect(responseBody.id).toBe(userId);
    });

    test('3. Invalid User Creation - Handle missing required fields', async ({ request }) => {
        const invalidUserData: Partial<User> = {
            lastName: 'Doe',
            email: 'john.doe@example.com',
            dateOfBirth: '1985-10-01',
            personalIdDocument: {
                documentId: 'AB123456',
                countryOfIssue: 'US',
                validUntil: '2030-12-31'
            }
        };

        const response = await request.post(USER_ENDPOINT, {
            data: invalidUserData,
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(response.status()).toBe(400);
        const responseBody: ProblemDetails = await response.json();
        expect(responseBody.title).toBe('Invalid Input');
    });

    test('4. Update User - Update user details and verify changes', async ({ request }) => {
        const updatedUserData: User = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            dateOfBirth: '1990-05-15',
            personalIdDocument: {
                documentId: 'AB123456',
                countryOfIssue: 'US',
                validUntil: '2030-12-31'
            }
        };

        const response = await request.put(`${USER_ENDPOINT}/${userId}`, {
            data: updatedUserData,
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(response.status()).toBe(200);
        const responseBody: User = await response.json();
        expect(responseBody.firstName).toBe('Jane');
    });

    test('5. Delete User - Delete an existing user and validate', async ({ request }) => {
        const response = await request.delete(`${USER_ENDPOINT}/${userId}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(response.status()).toBe(204);

        // Verify the user is no longer retrievable
        const getResponse = await request.get(`${USER_ENDPOINT}/${userId}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(getResponse.status()).toBe(404);
    });

    test('6. Edge Cases - Retrieve, update, or delete a non-existing user', async ({ request }) => {
        const nonExistingUserId = 'non-existing-id';

        // Try to get a non-existing user
        const getResponse = await request.get(`${USER_ENDPOINT}/${nonExistingUserId}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(getResponse.status()).toBe(404);

        // Try to update a non-existing user
        const updateResponse = await request.put(`${USER_ENDPOINT}/${nonExistingUserId}`, {
            data: {
                firstName: 'Jane',
                lastName: 'Doe'
            },
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(updateResponse.status()).toBe(404);

        // Try to delete a non-existing user
        const deleteResponse = await request.delete(`${USER_ENDPOINT}/${nonExistingUserId}`, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
            }
        });

        expect(deleteResponse.status()).toBe(404);
    });
});
