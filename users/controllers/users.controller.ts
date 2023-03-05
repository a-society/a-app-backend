import express from 'express';
import usersService from '../services/users.service';
import argon2 from 'argon2';
import debug from 'debug';
import { STATUS } from '../../common/constants/response.constants';

const log: debug.IDebugger = debug('app:users-controller');
class UsersController {
	async listUsers(req: express.Request, res: express.Response) {
		const users = await usersService.list(100, 0);
		res.status(STATUS.OK).send(users);
	}

	async getUserById(req: express.Request, res: express.Response) {
		const user = await usersService.readById(req.body.id);
		res.status(STATUS.OK).send(user);
	}

	async createUser(req: express.Request, res: express.Response) {
		req.body.password = await argon2.hash(req.body.password);
		const userId = await usersService.create(req.body);
		res.status(STATUS.CREATED).send({ id: userId });
	}

	async patch(req: express.Request, res: express.Response) {
		if (req.body.password) {
			req.body.password = await argon2.hash(req.body.password);
		}
		log(await usersService.patchById(req.body.id, req.body));
		res.status(STATUS.NO_CONTENT).send();
	}

	async put(req: express.Request, res: express.Response) {
		req.body.password = await argon2.hash(req.body.password);
		log(await usersService.putById(req.body.id, req.body));
		res.status(STATUS.NO_CONTENT).send();
	}

	async removeUser(req: express.Request, res: express.Response) {
		log(await usersService.deleteById(req.body.id));
		res.status(STATUS.NO_CONTENT).send();
	}
}

export default new UsersController();
