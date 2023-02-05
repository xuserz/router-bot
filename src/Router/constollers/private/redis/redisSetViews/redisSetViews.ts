import { redisGetReady } from '../../../';

import { IUserId, IListPage } from "../../../../types";
import Redis from "../../../../Redis/Redis";

type IRedisSetViews = {
  user_id: IUserId;
  views: IListPage | any[];
  redis: Redis;
}

const redisSetViews = ({
  redis,
  views,
  user_id
}: IRedisSetViews) => {
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    redis.set(`views_${user_id}`, views)
  }
}

export default redisSetViews;