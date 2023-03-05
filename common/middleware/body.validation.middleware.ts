import express from 'express';
import { validationResult } from 'express-validator';
import { STATUS, MESSAGE } from '../../common/constants/response.constants';

class BodyValidationMiddleware {
	verifyBodyFieldsErrors(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(STATUS.BAD_REQUEST)
				.send({ errors: [MESSAGE.BAD_REQUEST] });
		}
		next();
	}
}

export default new BodyValidationMiddleware();
