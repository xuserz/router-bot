import { IListPage, IPage, IUserId, IRoutering, IEventData, IEventNames } from "./types";

import Redis from './Redis/Redis';

import { getCustomViews, backPage, getViewById, activePage, addParamsActivePage, getLocation, activeViewId, pushPage, popPage, replacePage } from './constollers';

import { EventEmitter } from "events";

declare global {
  var devMode: boolean;
}

class Router extends EventEmitter {
  private listPages: Array<IListPage>;
  private redis?: any;
  private routers?: IRoutering;

  constructor({ history, redis, routers, devMode = false }: {
    history?: Array<IListPage>;
    redis?: Redis;
    routers?: IRoutering;
    devMode?: boolean
  }) {
    super();
    this.redis = redis;
    this.listPages = history || [];
    this.routers = routers;
    globalThis.devMode = devMode;
  }

  private sendEvents = (event_name: IEventNames, data: Object) => this.emit(event_name, data, event_name); //Отправка запроса по идентификатору


  listen = (callback_name: IEventNames | Array<IEventNames>, callback: (data: IEventData, event_name: IEventNames) => void) => {
    const eventData = (data: IEventData, event_name: IEventNames) => callback(data, event_name);

    if (Array.isArray(callback_name)) {
      for (var item of callback_name) this.on(item, eventData);
    } else this.on(callback_name, eventData);
  } // Инициализация подключения

  addParamsActivePage = async (params: any, user_id: IUserId) => await addParamsActivePage({
    user_id,
    history: this.listPages,
    redis: this.redis,
    params,
    sendEvents: this.sendEvents
  })

  replacePage = async (page_id: any, user_id: IUserId, params?: any) => await replacePage({
    user_id,
    history: this.listPages,
    redis: this.redis,
    page_id,
    params,
    sendEvents: this.sendEvents
  })

  getCustomViews = (view_id: string) => getCustomViews({
    routers: this.routers,
    view_id
  });

  getViewById = async (view_id: string, user_id: IUserId = 0) => await getViewById({
    view_id,
    user_id,
    routers: this.routers,
    history: this.listPages,
    redis: this.redis
  })

  activePage = async (user_id: IUserId = 0) => await activePage({
    user_id,
    history: this.listPages,
    redis: this.redis,
    routers: this.routers
  })

  getLocation = (open_page_id: string | IPage, page_id: string | IPage) => getLocation({
    routers: this.routers,
    open_page_id,
    page_id
  })

  activeViewId = async (user_id: IUserId = 0) => await activeViewId({
    user_id,
    redis: this.redis,
    routers: this.routers,
    history: this.listPages
  })

  pushPage = async (page_id: string, user_id: IUserId = 0, {
    view_id,
    params
  }: {
    view_id?: string,
    params?: any
  }) => {
    await pushPage(page_id, user_id, {
      view_id,
      params,
      redis: this.redis,
      routers: this.routers,
      history: this.listPages,
      sendEvents: this.sendEvents
    })
  }

  popPage = async (user_id: IUserId = 0, params?: any) => {
    await popPage({
      user_id, params, redis: this.redis, history: this.listPages, sendEvents: this.sendEvents
    })
  }

  backPage = async (page_id: string, user_id: IUserId = 0) => await backPage({
    page_id,
    user_id,
    redis: this.redis,
    history: this.listPages,
    sendEvents: this.sendEvents
  })
}

export default Router;