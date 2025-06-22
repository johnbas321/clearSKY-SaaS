import { createClient } from 'redis';

export const client = createClient({ url: 'redis://redis:6379' });

client.on("error", (err) => console.error("Redis error:", err));

await client.connect();
console.log("Frontend connected to Redis");