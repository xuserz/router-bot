
import Redis from "../../../../Redis/Redis";

const redisGetReady = (redis: Redis) => redis && redis._redis.isReady;
export default redisGetReady;