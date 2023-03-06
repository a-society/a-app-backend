import express from 'express';
import userService from '../services/users.service';
import debug from 'debug';
import { STATUS } from '../../common/constants/response.constants';

const log: debug.IDebugger = debug('app:users-controller');
class UsersMiddleware {
	async validateSameEmailDoesntExist(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const user = await userService.getUserByEmail(req.body.email);
		if (user) {
			res
				.status(STATUS.BAD_REQUEST)
				.send({ error: `User email already exists` });
		} else {
			next();
		}
	}

	async validateSameEmailBelongToSameUser(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		if (res.locals.user._id === req.params.userId) {
			next();
		} else {
			res.status(STATUS.BAD_REQUEST).send({ error: `Invalid email` });
		}
	}

	async userCantChangePermission(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		if (
			'permissionFlags' in req.body &&
			req.body.permissionFlags !== res.locals.user.permissionFlags
		) {
			res.status(STATUS.BAD_REQUEST).send({
				errors: ['User cannot change permission flags'],
			});
		} else {
			next();
		}
	}

	validatePatchEmail = async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		if (req.body.email) {
			log('Validating email', req.body.email);

			this.validateSameEmailBelongToSameUser(req, res, next);
		} else {
			next();
		}
	};

	async validateUserExists(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const user = await userService.readById(req.params.userId);
		if (user) {
			res.locals.user = user;
			next();
		} else {
			res.status(STATUS.NOT_FOUND).send({
				error: `User ${req.params.userId} not found`,
			});
		}
	}

	async extractUserId(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		req.body.id = req.params.userId;
		next();
	}
}

export default new UsersMiddleware();
