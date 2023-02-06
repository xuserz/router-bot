import { IUserId } from "..";

export type IEventData = {
  page_id: string;
  old_page_id?: string;
  old_params?: any;
  user_id: IUserId;
  params?: any
}