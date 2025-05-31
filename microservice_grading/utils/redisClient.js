import { createClient } from 'redis';

export const client = createClient({ url: 'redis://localhost:6379' });

client.on("error", (err) => console.error("Redis error:", err));

await client.connect();
console.log("Connected to Redis");