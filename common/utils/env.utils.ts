import dotenv from 'dotenv';

const dotenvResult = dotenv.config();
if (dotenvResult.error) {
	throw dotenvResult.error;
}

export const PORT = process.env.PORT || 3000;
export const MONGO_URI =
	process.env.MONGO_URI || 'mongodb://localhost:27017/db-api';
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600';
