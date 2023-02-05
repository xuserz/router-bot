import { getCustomViews, getViewId } from '../'
import Redis from '../../Redis/Redis';

import { IListPage, IRoutering, IUserId } from "../../types";

type IGetViewById = {
  view_id: string,
  routers: IRoutering;
  user_id?: IUserId;
  redis: Redis;
  history: Array<IListPage>;
}

const getViewById = async ({
  view_id,
  routers,
  user_id,
  redis,
  history
}: IGetViewById) => {
  const view = await getViewId({
    view_id,
    user_id,
    history,
    routers,
    redis
  });
  return view.pages
}

export default getViewById