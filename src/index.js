import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.route.js';
import protectedRouter from './routes/protected.route.js';
import blogpostRouter from './routes/blogpost.route.js'

import { connectToDb } from './service/db.service.js';
import { seedRoles } from './model/role.model.js';
import { startMailService } from './service/mailVerification.js';


// Lade Umgebungsvariablen (engl. enviroment variables) aus der .env Datei
dotenv.config();

// Initialisiere express
const app = express();

// Middleware fuer das body-Parsing
app.use(express.json());

// Middleware fuer CROSS-ORIGIN-REQUEST
app.use(cors({
    origin: 'http://localhost:5173',
    // credentials: true
}));

// --------------------- ROUTES -------------------------

app.use('/auth', authRouter);

app.use('/protected', protectedRouter);

app.use('/blogposts', blogpostRouter);

// Einmalig Verbindung ueber default Connection aufbauen
// Uebergebe Seeding-Funktion zum Einfuegen von Userrollen
await connectToDb(seedRoles);

await startMailService();


// ----------------------------------------------------------
// Starte Server auf in der Config hinterlegtem Port
app.listen(process.env.PORT, () => {
    console.log(`Server is listening on http://localhost:${process.env.PORT}`);
});