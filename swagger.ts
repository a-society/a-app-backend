const swaggerAutogen = require('swagger-autogen')();
const PORT = 4000;

const doc = {
	info: {
		title: 'ą-app API',
		description: 'Documentation for the immaculate ą-app API',
	},
	host: `localhost:${PORT}`,
	schemes: ['http'],
};

const outputFile = 'swagger-output.json';
const endpointsFiles = [
	'common/common.routes.config.ts',
	'users/users.routes.config.ts',
	'auth/auth.routes.config.ts',
];
swaggerAutogen(outputFile, endpointsFiles, doc);
