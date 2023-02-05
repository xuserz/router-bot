import { getCustomViews, getView } from "..";
import Redis from "../../Redis/Redis";
import { IListPage, IUserId, IRoutering } from "../../types";

type IActiveViewId = {
  user_id: IUserId;
  redis: Redis;
  routers: IRoutering,
  history: Array<IListPage>;
}

const activeViewId = async ({
  user_id,
  redis,
  routers,
  history
}: IActiveViewId) => {
  const view = await getView({
    redis, user_id, history
  });
  
  if (devMode) !view && console.error(`\x1b[34m[DEVMODE] | {activeViewId} -`,`\x1b[33mУ ${user_id} у пользователя нет роутера`);
  if (!view) return undefined;
  return getCustomViews({
    routers, view_id: view.view_id
  });
}

export default activeViewId;