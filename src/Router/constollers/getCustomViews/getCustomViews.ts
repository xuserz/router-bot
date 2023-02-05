import { IRoutering } from '../../types';

type IGetCustomViews = {
  routers: IRoutering;
  view_id?: string;
}

const getCustomViews = ({ routers, view_id }: IGetCustomViews) => {
  if (devMode) !view_id && console.error(`\x1b[34m[DEVMODE] -`, `\x1b[31mview_id`, `\x1b[33mне используется, но желательно его приписывать`);

  if(!view_id) return `view_start`;
  if (routers) {
    if (routers[view_id]) return routers[view_id];
  }
  return view_id;
}

export default getCustomViews;