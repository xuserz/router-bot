import { IEventData, IEventNames, IListPage, IUserId } from "../../types";
import { getView, redisGetReady, redisGetViews, redisSetViews } from "..";
import Redis from '../../Redis/Redis';

type IAddParamsActivePage = {
  user_id: IUserId;
  redis: Redis;
  history: Array<IListPage>;
  params: any;
  sendEvents: (event_name: IEventNames, { page_id, old_params, params }: IEventData) => void;
}

const addParamsActivePage = async ({
  user_id,
  redis,
  history,
  params,
  sendEvents
}: IAddParamsActivePage) => {
  const view = await getView({
    redis, user_id, history
  });
  if (view) {
    const _isRedis = redisGetReady(redis);
    var old_params = {}; // sendEvents(`NEW_PARAMS`)
    if (_isRedis) {
      var views = await redisGetViews({ redis, user_id });
      if (views.find((x: IListPage) => x.view_id == view.view_id && x.user_id === user_id)) {
        var pages = views.find((x: IListPage) => x.view_id == view.view_id && x.user_id === user_id).pages
        old_params = pages[pages.length - 1].params;
        pages[pages.length - 1].params = { ...pages[pages.length - 1].params, ...params }
        await redisSetViews({ redis, user_id, views });

        sendEvents(`NEW_PARAMS`, {
          page_id: pages[pages.length - 1].page_id,
          old_params: old_params,
          params: pages[pages.length - 1].params,
          user_id: user_id
        });
        return true;
      }
    } else {
      old_params = view.pages[view.pages.length - 1].params;
      view.pages[view.pages.length - 1].params = { ...view.pages[view.pages.length - 1].params, ...params };

      sendEvents(`NEW_PARAMS`, {
        page_id: view.pages[view.pages.length - 1].page_id,
        old_params: old_params,
        params: view.pages[view.pages.length - 1].params,
        user_id: user_id
      });
      return true;
    }
  }
  return false;
}

export default addParamsActivePage;