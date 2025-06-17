import NodeCache from "@cacheable/node-cache";
import { cacheConfig } from '../config.js';

export const gradeCache = new NodeCache(cacheConfig);