import express from 'express';
import usersService from '../../users/services/users.service';
import * as argon2 from 'argon2';
import { STATUS } from '../../common/constants/response.constants';

class AuthMiddleware {
	async verifyUserPassword(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const user: any = await usersService.getUserByEmailWithPassword(
			req.body.email
		);
		if (user) {
			const passwordHash = user.password;
			if (await argon2.verify(passwordHash, req.body.password)) {
				req.body = {
					userId: user._id,
					email: user.email,
					permissionFlags: user.permissionFlags,
				};
				return next();
			}
		}
		res
			.status(STATUS.BAD_REQUEST)
			.send({ errors: ['Invalid email and/or password'] });
	}
}

export default new AuthMiddleware();
