import { getCustomViews } from "..";
import { IPage, IRoutering } from "../../types";

type IGetLocation = {
  open_page_id: string | IPage,
  page_id: string | IPage;
  routers: IRoutering
}
const getLocation = ({
  open_page_id,
  page_id,
  routers
}: IGetLocation) => {
  if (devMode) !open_page_id && console.error(`\x1b[34m[DEVMODE] -`, `\x1b[31mopen_page_id`, `\x1b[31mне передан, хотя нужен`);
  if (devMode) !page_id && console.error(`\x1b[34m[DEVMODE] -`, `\x1b[31mopen_page_id`, `\x1b[31mне передан, хотя нужен`);

  if (!open_page_id || !page_id) return false

  if (typeof open_page_id === 'string' && typeof page_id === 'string') {
    return getCustomViews({ routers, view_id: open_page_id }) == getCustomViews({ routers, view_id: page_id });
  } else if (typeof open_page_id !== 'string' && typeof page_id !== 'string') {
    return getCustomViews({ routers, view_id: open_page_id.page_id }) == getCustomViews({ routers, view_id: page_id.page_id });
  } else if (typeof open_page_id !== 'string' && typeof page_id === 'string') {
    return getCustomViews({ routers, view_id: open_page_id.page_id }) == getCustomViews({ routers, view_id: page_id });
  } else if (typeof open_page_id === 'string' && typeof page_id !== 'string') {
    return getCustomViews({ routers, view_id: open_page_id }) == getCustomViews({ routers, view_id: page_id.page_id });
  }
  return false;
}

export default getLocation;