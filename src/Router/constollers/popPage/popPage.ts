import { getView, redisGetReady, redisGetViews, redisSetViews } from "..";
import Redis from "../../Redis/Redis";
import { IListPage, IUserId, IEventData, IEventNames } from "../../types";


type IPopPage = {
  user_id: IUserId
  redis: Redis;
  history: Array<IListPage>;
  sendEvents: (event_name: IEventNames, { user_id, page_id, old_page_id, params }: IEventData) => void;
  params?: any;
}

const popPage = async ({
  user_id,
  redis,
  history,
  sendEvents,
  params
}: IPopPage) => {
  //redis
  var old_page_id = ``;
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    var redis_views = await redisGetViews({ redis, user_id });
    const view = redis_views[redis_views.length - 1];
    if (view) {
      if (view.pages.length <= 1) {
        redis_views.pop();
      } else {
        view.pages.pop();
      }
      sendEvents(`BACK_PAGE`, {
        user_id,
        page_id: view.pages[view.pages.length - 1] && view.pages[view.pages.length - 1].page_id,
        old_page_id: view.pages[view.pages.length - 1].page_id,
        params: params || view.pages[view.pages.length - 1] && view.pages[view.pages.length - 1].params
      })
    }

    await redisSetViews({ redis, user_id, views: redis_views });
  } else {
    var view = await getView({ redis, history, user_id });
    if (view) {
      if (view.pages.length <= 1) {
        history.pop();
      } else {
        view.pages.pop();
      }
      view = await getView({ redis, history, user_id });
      if (view) {
        sendEvents(`BACK_PAGE`, {
          user_id,
          page_id: view.pages[view.pages.length - 1].page_id,
          old_page_id: view.pages[view.pages.length - 1].page_id,
          params: params || view.pages[view.pages.length - 1].params
        })
      }
    };
  }
}

export default popPage;