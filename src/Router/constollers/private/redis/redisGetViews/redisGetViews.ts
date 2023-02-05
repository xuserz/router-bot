import { redisGetReady } from '../../../'

import { IUserId } from "../../../../types"
import Redis from '../../../../Redis/Redis';

type IRedisGetViews = {
  redis: Redis;
  user_id?: IUserId;
}

const redisGetViews = async ({
  redis,
  user_id
}: IRedisGetViews) => {
  const status = redisGetReady(redis);

  if (status) {
    var view = await redis.get(`views_${user_id}`);
    if (!view) return []
    return JSON.parse(view);
  }
}

export default redisGetViews;