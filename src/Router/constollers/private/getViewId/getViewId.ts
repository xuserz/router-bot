import { IRoutering, IUserId, IListPage } from "../../../types";
import { getCustomViews, redisGetReady, redisGetViews, redisSetViews } from '../../'

import Redis from '../../../Redis/Redis';

type IGetViewId = {
  view_id: string;
  user_id?: IUserId;
  routers: IRoutering;
  history: Array<IListPage>;
  redis: Redis;
}

const getViewId = async ({
  view_id,
  user_id = 0,
  history,
  routers,
  redis,
}: IGetViewId) => {
  view_id = getCustomViews({ routers, view_id });

  //redis
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    var view = await redisGetViews({ redis, user_id });
    if (!view.find((x: IListPage) => x.view_id == view_id && x.user_id === user_id)) {
      view.push({ view_id: view_id, pages: [], user_id: user_id });
      await redisSetViews({
        redis,
        user_id,
        views: view.filter((x: IListPage) => x.user_id === user_id)
      })
    }
    return view.find((x: IListPage) => x.view_id == view_id && x.user_id === user_id)
  } else {
    if (!history.find((x: IListPage) => x.view_id == view_id && x.user_id === user_id)) {
      history.push({ view_id: view_id, pages: [], user_id: user_id });
    }
    return history.find((x: IListPage) => x.view_id == view_id && x.user_id === user_id) || { view_id: view_id, pages: [], user_id: user_id };
  }
}

export default getViewId