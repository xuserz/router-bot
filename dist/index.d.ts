import * as r from 'redis';
import { EventEmitter } from 'events';

type IPage = {
    page_id: string;
    params?: any;
};

type IListPage = {
    view_id: string;
    user_id?: IUserId;
    pages: Array<IPage>;
};

type IUserId = string | number;

type IRoutering = Record<string, string> | undefined;

type IEventData = {
    page_id: string;
    old_page_id: string;
    user_id: IUserId;
    params?: any;
};

type IEventNames = "NEW_PAGE" | "BACK_PAGE";

declare global {
    var redis: Redis;
}
declare class Redis {
    _redis: r.RedisClientType;
    constructor(url: string);
    get: (key: string) => Promise<string | undefined>;
    set: (key: string, value: object | string) => Promise<boolean>;
    keys: (key: string) => Promise<string[]>;
    setex: (key: string, seconds: number, value: object | string) => Promise<boolean>;
    init: () => Promise<void>;
}

declare global {
    var devMode: boolean;
}
declare class Router extends EventEmitter {
    private listPages;
    private redis?;
    private routers?;
    constructor({ history, redis, routers, devMode }: {
        history?: Array<IListPage>;
        redis?: Redis;
        routers?: IRoutering;
        devMode?: boolean;
    });
    private sendEvents;
    listen: (callback_name: IEventNames, callback: (data: IEventData) => void) => void;
    getCustomViews: (view_id: string) => string;
    getViewById: (view_id: string, user_id?: IUserId) => Promise<any>;
    activePage: (user_id?: IUserId) => Promise<any>;
    getLocation: (open_page_id: string | IPage, page_id: string | IPage) => boolean;
    activeViewId: (user_id?: IUserId) => Promise<string | undefined>;
    pushPage: (page_id: string, user_id: IUserId | undefined, { view_id, params }: {
        view_id?: string | undefined;
        params?: any;
    }) => Promise<void>;
    popPage: (user_id?: IUserId) => Promise<void>;
    backPage: (page_id: string, user_id?: IUserId) => Promise<boolean>;
}

export { Redis, Router };
