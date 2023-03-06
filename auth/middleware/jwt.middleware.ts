import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Jwt } from '../../common/types/jwt';
import usersService from '../../users/services/users.service';
import { JWT_SECRET } from '../../common/utils/env.utils';
import { STATUS } from '../../common/constants/response.constants';

class JwtMiddleware {
	verifyRefreshBodyField(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		if (req.body && req.body.refreshToken) {
			return next();
		} else {
			return res
				.status(STATUS.BAD_REQUEST)
				.send({ errors: ['Missing required field: refreshToken'] });
		}
	}

	async validRefreshNeeded(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const user: any = await usersService.getUserByEmailWithPassword(
			res.locals.jwt.email
		);
		const salt = crypto.createSecretKey(
			Buffer.from(res.locals.jwt.refreshKey.data)
		);
		const hash = crypto
			.createHmac('sha512', salt)
			.update(res.locals.jwt.userId + JWT_SECRET)
			.digest('base64');
		if (hash === req.body.refreshToken) {
			req.body = {
				userId: user._id,
				email: user.email,
				permissionFlags: user.permissionFlags,
			};
			return next();
		} else {
			return res
				.status(STATUS.BAD_REQUEST)
				.send({ errors: ['Invalid refresh token'] });
		}
	}

	validJWTNeeded(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		if (req.headers['authorization']) {
			try {
				const authorization = req.headers['authorization'].split(' ');
				if (authorization[0] !== 'Bearer') {
					return res.status(STATUS.UNAUTHORIZED).send();
				} else {
					res.locals.jwt = jwt.verify(authorization[1], JWT_SECRET) as Jwt;
					console.log(`siema ${res.locals.jwt.userId} ${res.locals.jwt}`);
					next();
				}
			} catch (err) {
				console.log(err);
				return res.status(STATUS.FORBIDDEN).send();
			}
		} else {
			return res.status(STATUS.UNAUTHORIZED).send();
		}
	}
}

export default new JwtMiddleware();