import { redisGetReady, redisGetViews } from '../..'
import Redis from '../../../Redis/Redis';

import { IListPage, IUserId } from '../../../types';

type IGetView = {
  redis: Redis;
  user_id: IUserId;
  history: Array<IListPage>;
}

const getView = async ({
  redis,
  user_id,
  history
}: IGetView) => {
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    const view = await redisGetViews({ redis, user_id })
    return view[view.length - 1];
  }

  var get_history = history.filter((x: IListPage) => x.user_id === user_id);
  return get_history[get_history.length - 1];
}

export default getView;