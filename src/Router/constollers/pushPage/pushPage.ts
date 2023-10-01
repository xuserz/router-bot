import { activeViewId, getCustomViews, getViewId, redisGetReady, redisGetViews, redisSetViews } from "..";
import Redis from "../../Redis/Redis";
import { IEventData, IEventNames, IListPage, IRoutering, IUserId } from "../../types";

type IParams = {
  view_id?: string,
  params?: any

  redis: Redis
  routers: IRoutering;
  history: Array<IListPage>;
  sendEvents: (event_name: IEventNames, { user_id, page_id, old_page_id, params }: IEventData) => void;
}

const pushPage = async (page_id: string, user_id: IUserId = 0, {
  view_id,
  params,
  redis,
  routers,
  history,
  sendEvents
}: IParams) => {
  if (devMode) !user_id && console.error(`\x1b[34m[DEVMODE] -`, `\x1b[31muser_id`, `\x1b[33mне используется, но желательно его приписывать`);

  view_id = getCustomViews({ routers, view_id });

  if (!view_id) {
    const old_view_id = await activeViewId({ user_id, redis, routers, history })
    if (typeof old_view_id === `string`) view_id = old_view_id;
  }

  if (!view_id) {
    if (devMode) console.error(`\x1b[34m[DEVMODE] -`, `\x1b[31mview_id`, `\x1b[33mне найден`);
    return
  }
  //redis
  const _isRedis = redisGetReady(redis)
  var old_page_id = ``;
  if (_isRedis) {
    var views = await redisGetViews({ redis, user_id });

    if (views.find((x: IListPage) => x.view_id == view_id && x.user_id === user_id)) {
      var pages = views.find((x: IListPage) => x.view_id == view_id && x.user_id === user_id).pages
      old_page_id = pages[pages.length - 1].page_id;
      pages.push({ page_id, params });
    } else {
      old_page_id = page_id;
      views.push({ view_id, user_id, pages: [] });
      var pages = views.find((x: IListPage) => x.view_id == view_id && x.user_id === user_id).pages
      pages.push({ page_id, params });
    }

    await redisSetViews({ redis, user_id, views });
  } else {
    var view = await getViewId({
      history,
      routers,
      redis,
      view_id,
      user_id
    });
    if(view.pages[view.pages.length - 1]) old_page_id = view.pages[view.pages.length - 1].page_id;
    view.pages.push({ page_id, params });
  }
  sendEvents(`NEW_PAGE`, {
    page_id: page_id,
    old_page_id: old_page_id,
    user_id: user_id,
    params: params
  });
}

export default pushPage;