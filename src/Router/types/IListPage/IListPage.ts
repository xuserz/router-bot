import { IPage, IUserId } from '../'

export type IListPage = {
  view_id: string;
  user_id?: IUserId;
  pages: Array<IPage>;
}
