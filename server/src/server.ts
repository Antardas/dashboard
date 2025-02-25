import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import app from './app';
import connectDB from './shared/services/db/connect-db';

const PORT = process.env.PORT || 5002;

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log('Shutting Down the Server due to unhandled Promise Rejection');
});

connectDB();
const server = app.listen(PORT, () => {
	console.log('Application is running of port: ', PORT);
});

process.on('uncaughtException', (error: Error) => {
	console.error(`There was an uncaught error: ${error}`);
	shutDownProperly(1);
});
process.on('unhandledRejection', (error: Error) => {
	console.error(`There was an Promise Rejection error: ${error}`);
	shutDownProperly(2);
});

process.on('SIGTERM', () => {
	console.error('caught SIGTERM');
	shutDownProperly(2);
});

process.on('SIGINT', () => {
	console.error('caught SIGINT');
	shutDownProperly(2);
});

process.on('exit', () => {
	console.error('Exiting');
	shutDownProperly(2);
});

function shutDownProperly(exitCode: number): void {
	Promise.resolve()
		.then(() => {
			console.info('Shutdown Complete');
			server.close(() => {
				process.exit(2);
			});
		})
		.catch((error: Error) => {
			console.error(`Error During shut down:: ${error}`);
			server.close(() => {
				process.exit(1);
			});
		});
}
