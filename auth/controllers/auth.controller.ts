import express from 'express';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { STATUS } from '../../common/constants/response.constants';
import { JWT_SECRET } from '../../common/utils/env.utils';

const log: debug.IDebugger = debug('app:auth-controller');
const tokenExpirationInSeconds = 36000;

class AuthController {
	async createJWT(req: express.Request, res: express.Response) {
		try {
			const refreshId = req.body.userId + JWT_SECRET;
			const salt = crypto.createSecretKey(crypto.randomBytes(16));
			const hash = crypto
				.createHmac('sha512', salt)
				.update(refreshId)
				.digest('base64');
			req.body.refreshKey = salt.export();
			const token = jwt.sign(req.body, JWT_SECRET, {
				expiresIn: tokenExpirationInSeconds,
			});
			return res
				.status(STATUS.CREATED)
				.send({ accessToken: token, refreshToken: hash });
		} catch (err) {
			log(STATUS.INTERNAL_SERVER_ERROR, err);
			return res.status(STATUS.INTERNAL_SERVER_ERROR).send();
		}
	}
}

export default new AuthController();
