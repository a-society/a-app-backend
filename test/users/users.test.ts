import app from '../../app';
import supertest from 'supertest';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

let firstUserIdTest = '';
const firstUserBody = {
	email: `test+${uuidv4()}@email.com`,
	password: 'test1!',
};

let accessToken = '';
let refreshToken = '';
const newFirstName = 'Milosz';
const newFirstName2 = 'Bartek';
const newLastName2 = 'Bro';

describe('users and auth endpoints', function () {
	let request: supertest.SuperTest<supertest.Test>;
	before(async function () {
		request = supertest(app);
	});
	after(async function () {
		await mongoose.connection.close();
		app.close();
	});

	it('should allow a POST to /users', async function () {
		const res = await request.post('/users').send(firstUserBody);
		expect(res.status).to.equal(201);
		expect(res.body).to.have.property('id');
		expect(res.body).to.be.an('object');
		expect(res.body.id).to.be.a('string');
		firstUserIdTest = res.body.id;
	});

	it('should allow a POST to /auth', async function () {
		const res = await request.post('/auth').send(firstUserBody);
		expect(res.status).to.equal(201);
		expect(res.body).to.have.property('accessToken');
		expect(res.body).to.have.property('refreshToken');
		expect(res.body).to.be.an('object');
		expect(res.body.accessToken).to.be.a('string');
		expect(res.body.refreshToken).to.be.a('string');
		accessToken = res.body.accessToken;
		refreshToken = res.body.refreshToken;
	});

	it('should allow a GET to /users/:userId with an access token', async function () {
		const res = await request
			.get(`/users/${firstUserIdTest}`)
			.set('Authorization', `Bearer ${accessToken}`);
		expect(res.status).to.equal(200);
		expect(res.body).not.to.be.empty;
		expect(res.body).to.be.an('object');
		expect(res.body._id).to.be.a('string');
		expect(res.body._id).to.equal(firstUserIdTest);
		expect(res.body.email).to.equal(firstUserBody.email);
	});

	describe('with a valid access token', function () {
		it('should allow a GET from /users', async function () {
			const res = await request
				.get(`/users`)
				.set({ Authorization: `Bearer ${accessToken}` })
				.send();
			expect(res.status).to.equal(403);
		});

		it('should disallow a PUT to /users/:userId with nonexistent ID', async function () {
			const res = await request
				.put(`/users/nonexistentID`)
				.set({ Authorization: `Bearer ${accessToken}` })
				.send({
					email: firstUserBody.email,
					password: firstUserBody.password,
					firstName: 'John',
					lastName: 'Doe',
					permissionFlags: 2,
				});
			expect(res.status).to.equal(404);
		});

		it('should disallow a PUT to /users/:userId trying to change permissionFlags', async function () {
			const res = await request
				.put(`/users/${firstUserIdTest}`)
				.set({ Authorization: `Bearer ${accessToken}` })
				.send({
					email: firstUserBody.email,
					password: firstUserBody.password,
					firstName: 'John',
					lastName: 'Doe',
					permissionFlags: 2,
				});
			expect(res.status).to.equal(400);
			expect(res.body.errors).to.be.an('array');
			expect(res.body.errors).to.have.length(1);
			expect(res.body.errors[0]).to.equal(
				'User cannot change permission flags'
			);
		});

		it('should allow a PUT to /users/:userId/permissionFlags/2 for testing', async function () {
			const res = await request
				.put(`/users/${firstUserIdTest}/permissionFlags/2`)
				.set({ Authorization: `Bearer ${accessToken}` })
				.send();
			expect(res.status).to.equal(204);
		});

		describe('with a new set of permission flags', function () {
			it('should allow a POST to /auth/refresh-token', async function () {
				const res = await request
					.post('/auth/refresh-token')
					.set({ Authorization: `Bearer ${accessToken}` })
					.send({ refreshToken });
				expect(res.status).to.equal(201);
				expect(res.body).not.to.be.empty;
				expect(res.body).to.be.an('object');
				expect(res.body.accessToken).to.be.a('string');
				accessToken = res.body.accessToken;
				refreshToken = res.body.refreshToken;
			});

			it('should allow a PUT to /users/:userId to change first and last names', async function () {
				const res = await request
					.put(`/users/${firstUserIdTest}`)
					.set({ Authorization: `Bearer ${accessToken}` })
					.send({
						email: firstUserBody.email,
						password: firstUserBody.password,
						firstName: newFirstName2,
						lastName: newLastName2,
						permissionFlags: 2,
					});
				expect(res.status).to.equal(204);
			});

			it('should allow a GET to /users/:userId to see the new first and last names', async function () {
				const res = await request
					.get(`/users/${firstUserIdTest}`)
					.set({ Authorization: `Bearer ${accessToken}` })
					.send();
				expect(res.status).to.equal(200);
				expect(res.body).not.to.be.empty;
				expect(res.body).to.be.an('object');
				expect(res.body._id).to.be.a('string');
				expect(res.body.firstName).to.equal(newFirstName2);
				expect(res.body.lastName).to.equal(newLastName2);
				expect(res.body.email).to.equal(firstUserBody.email);
				expect(res.body._id).to.equal(firstUserIdTest);
			});

			it('should allow a DELETE from /users/:userId', async function () {
				const res = await request
					.delete(`/users/${firstUserIdTest}`)
					.set({ Authorization: `Bearer ${accessToken}` })
					.send();
				expect(res.status).to.equal(204);
			});
		});
	});
});
