import { getView, redisGetReady, redisGetViews, redisSetViews } from "..";
import Redis from "../../Redis/Redis";
import { IEventData, IEventNames, IListPage, IUserId } from "../../types";

type IBackPage = {
  page_id: string,
  user_id: IUserId,
  redis: Redis,
  history: Array<IListPage>;
  sendEvents: (event_name: IEventNames, { user_id, page_id, old_page_id, params }: IEventData) => void;
}

const backPage = async ({
  page_id,
  user_id,
  redis,
  history,
  sendEvents
}: IBackPage) => {
  if (devMode) !page_id && console.error(`\x1b[34m[DEVMODE] | {backPage} -`, `\x1b[31mpage_id`, `\x1b[33mне используется, но желательно его приписывать`);
  //redis
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    var last_page_id = ``;
    var params = {};
    var countAllPages = 0;
    var redis_views = await redisGetViews({ redis, user_id });

    for (var itemRedis of redis_views) countAllPages += itemRedis.pages.length;

    for (var i = 0; i < countAllPages; i++) {
      if (redis_views[redis_views.length - 1]) {
        var page = redis_views[redis_views.length - 1].pages;
        if (page.length <= 1) {
          redis_views.pop();
          last_page_id = page[page.length - 1].page_id;
        } else {
          page.pop();
          last_page_id = page[page.length - 1].page_id;
        }
      }
      if (last_page_id === page_id) {
        params = page[page.length - 1].params
        i = countAllPages;
      }
    }

    sendEvents(`BACK_PAGE`, {
      user_id,
      page_id: last_page_id,
      old_page_id: page_id,
      params: params
    })

    await redisSetViews({ redis, user_id, views: redis_views });
    if (last_page_id === page_id) return true;
    return false;
  } else {
    var view = await getView({ redis, history, user_id });
    if (view) {
      var last_page_id = ``;
      var params = {};
      var redis_views = await redisGetViews({ redis, user_id });

      var countAllPages = 0;
      for (var item of history) countAllPages += item.pages.length;
      for (var i = 0; i < countAllPages; i++) {
        var page = view.pages;
        if (page.length <= 1) {
          history.pop();
          params = page[page.length - 1].params
        } else {
          page.pop();
          params = page[page.length - 1].params
        }
        if (last_page_id === page_id) {
          last_page_id = page[page.length - 1].page_id;
          i = countAllPages;
        }
      }

      sendEvents(`BACK_PAGE`, {
        user_id,
        page_id: last_page_id,
        old_page_id: page_id,
        params: params
      })
      if (last_page_id === page_id) return true
    };
    return false
  }
}

export default backPage