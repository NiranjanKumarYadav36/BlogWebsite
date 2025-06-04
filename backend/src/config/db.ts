import { Client } from "pg";
import { config } from "dotenv";

config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not set in .env file!");
    process.exit(1);
}

let client: Client | null = null;
let isConnected = false;

// Function to get or create a single database client instance
const getDBClient = () => {
    if (!client) {
        client = new Client({
            connectionString,
            ssl: { rejectUnauthorized: false },
        });
    }
    return client;
};

const connectDB = async () => {
    try {
        const dbClient = getDBClient();
        if (!isConnected) {
            await dbClient.connect();
            isConnected = true;
            console.log("Connected to PostgreSQL successfully!");
        }
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

const queryDB = async (query: string, values?: any[]) => {
    try {
        const dbClient = getDBClient();
        const result = await dbClient.query(query, values);
        return result.rows;
    } catch (error) {
        console.error("Query error:", error);
        throw error;
    }
};

export { connectDB, getDBClient, queryDB };