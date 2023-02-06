import { IEventData, IEventNames, IListPage, IUserId } from "../../types";
import { getView, redisGetReady, redisGetViews, redisSetViews } from "..";
import Redis from '../../Redis/Redis';

type IReplacePage = {
  user_id: IUserId;
  redis: Redis;
  history: Array<IListPage>;
  page_id: string;
  params?: any;
  sendEvents: (event_name: IEventNames, { user_id, page_id, old_page_id, params }: IEventData) => void;
}

const replacePage = async ({
  user_id,
  redis,
  history,
  page_id,
  params,
  sendEvents
}: IReplacePage) => {
  const view = await getView({
    redis, user_id, history
  });

  var old_page_id = ``;
  if (view) {
    const _isRedis = redisGetReady(redis);
    if (_isRedis) {
      var views = await redisGetViews({ redis, user_id });
      if (views.find((x: IListPage) => x.view_id == view.view_id && x.user_id === user_id)) {
        var pages = views.find((x: IListPage) => x.view_id == view.view_id && x.user_id === user_id).pages
        old_page_id = pages[pages.length - 1].page_id;
        pages[pages.length - 1].page_id = page_id;
        pages[pages.length - 1].params = params;
        await redisSetViews({ redis, user_id, views });
        sendEvents(`REPLACE_PAGE`, {
          page_id: page_id,
          old_page_id: old_page_id,
          user_id: user_id,
          params: pages[pages.length - 1].params
        });
        return true;
      }
    } else {
      old_page_id = view.pages[view.pages.length - 1].page_id;
      view.pages[view.pages.length - 1].page_id = page_id;
      view.pages[view.pages.length - 1].params = params;
      sendEvents(`REPLACE_PAGE`, {
        page_id: page_id,
        old_page_id: old_page_id,
        user_id: user_id,
        params: view.pages[view.pages.length - 1].params
      });
      return true;
    }
  }
  return false;
}

export default replacePage;