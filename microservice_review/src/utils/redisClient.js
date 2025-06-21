import { createClient } from 'redis';
import { redisConfig} from '../config.js';

export const client = createClient({ url: redisConfig.url });

client.on("error", (err) => console.error("Redis error:", err));

await client.connect();
console.log("Connected to Redis");