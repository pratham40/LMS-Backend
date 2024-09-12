import { config as configDotenv } from 'dotenv';
import app from './app.js';
import connectionToDB from './config/dbConnection.js';

configDotenv();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async() => {
    await connectionToDB();
    console.log(`Server is listening on http://localhost:${PORT}`);
});
