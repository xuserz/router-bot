import { getCustomViews, getView } from "..";
import Redis from "../../Redis/Redis";
import { IListPage, IRoutering, IUserId } from "../../types";

type IActivePage = {
  user_id: IUserId,
  redis: Redis;
  history: Array<IListPage>;
  routers: IRoutering;
}

const activePage = async ({
  user_id,
  history,
  redis,
  routers
}: IActivePage) => {
  const view = await getView({
    redis, user_id, history
  });
  if (view) {
    if (view.pages[view.pages.length - 1]) {
      view.pages[view.pages.length - 1].page_id = getCustomViews({
        routers, view_id: view.pages[view.pages.length - 1].page_id
      });

      return view.pages[view.pages.length - 1];
    }
  }
}

export default activePage;