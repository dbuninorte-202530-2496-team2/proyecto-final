import 'reflect-metadata';
import express, { type Application } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import createError from 'http-errors';
import type { Server } from "http";

//import { connectDB, initDB } from "./config/db.js";
import { errorHandler } from './middleware/error-handler.middleware.js';
import apiRouter from './routes/api.router.js';

dotenv.config();
const app = express();

app.use(cors());


app.use(express.json());
app.use('/api', apiRouter);

app.use(function(req, res, next) { next(createError(404)); });
app.use(errorHandler)


// RELATIVO AL SERVIDOR
const PORT = process.env.PORT || 3000;

let server: Server | null;

// Apagar
const shutdown = async () => {
	console.log('Apagando servidor...');
	try {
		if (server)
			server.close(() => console.log('Servidor HTTP cerrado.'));
		console.log('Conexión cerrada.');
		process.exit(0);
	} catch (err) {
		console.error('Error al apagar:', err);
		process.exit(1);
	}
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Inicialización
const startServer = async () => {
	try {
		console.log('Iniciando servidor...');
		//await connectDB();
		//await initDB();
		server = app.listen(PORT, () => {
			console.log(`Servidor escuchando en http://localhost:${PORT}/api`);
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error al iniciar servidor: ${error.message}`);
			await shutdown();
		}
	}
};

startServer();
