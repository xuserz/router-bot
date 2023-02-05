'use strict';

var events = require('events');
var r = require('redis');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var r__namespace = /*#__PURE__*/_interopNamespaceDefault(r);

const getCustomViews = ({ routers, view_id }) => {
  if (devMode)
    !view_id && console.error(`\x1B[34m[DEVMODE] -`, `\x1B[31mview_id`, `\x1B[33m\u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F, \u043D\u043E \u0436\u0435\u043B\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0435\u0433\u043E \u043F\u0440\u0438\u043F\u0438\u0441\u044B\u0432\u0430\u0442\u044C`);
  if (!view_id)
    return `view_start`;
  if (routers) {
    if (routers[view_id])
      return routers[view_id];
  }
  return view_id;
};

const getViewById = async ({
  view_id,
  routers,
  user_id,
  redis,
  history
}) => {
  const view = await getViewId({
    view_id,
    user_id,
    history,
    routers,
    redis
  });
  return view.pages;
};

const activePage = async ({
  user_id,
  history,
  redis,
  routers
}) => {
  const view = await getView({
    redis,
    user_id,
    history
  });
  if (view) {
    if (view.pages[view.pages.length - 1]) {
      view.pages[view.pages.length - 1].page_id = getCustomViews({
        routers,
        view_id: view.pages[view.pages.length - 1].page_id
      });
      return view.pages[view.pages.length - 1];
    }
  }
};

const getLocation = ({
  open_page_id,
  page_id,
  routers
}) => {
  if (devMode)
    !open_page_id && console.error(`\x1B[34m[DEVMODE] -`, `\x1B[31mopen_page_id`, `\x1B[31m\u043D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u043D, \u0445\u043E\u0442\u044F \u043D\u0443\u0436\u0435\u043D`);
  if (devMode)
    !page_id && console.error(`\x1B[34m[DEVMODE] -`, `\x1B[31mopen_page_id`, `\x1B[31m\u043D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u043D, \u0445\u043E\u0442\u044F \u043D\u0443\u0436\u0435\u043D`);
  if (!open_page_id || !page_id)
    return false;
  if (typeof open_page_id === "string" && typeof page_id === "string") {
    return getCustomViews({ routers, view_id: open_page_id }) == getCustomViews({ routers, view_id: page_id });
  } else if (typeof open_page_id !== "string" && typeof page_id !== "string") {
    return getCustomViews({ routers, view_id: open_page_id.page_id }) == getCustomViews({ routers, view_id: page_id.page_id });
  } else if (typeof open_page_id !== "string" && typeof page_id === "string") {
    return getCustomViews({ routers, view_id: open_page_id.page_id }) == getCustomViews({ routers, view_id: page_id });
  } else if (typeof open_page_id === "string" && typeof page_id !== "string") {
    return getCustomViews({ routers, view_id: open_page_id }) == getCustomViews({ routers, view_id: page_id.page_id });
  }
  return false;
};

const activeViewId = async ({
  user_id,
  redis,
  routers,
  history
}) => {
  const view = await getView({
    redis,
    user_id,
    history
  });
  if (devMode)
    !view && console.error(`\x1B[34m[DEVMODE] | {activeViewId} -`, `\x1B[33m\u0423 ${user_id} \u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043D\u0435\u0442 \u0440\u043E\u0443\u0442\u0435\u0440\u0430`);
  if (!view)
    return void 0;
  return getCustomViews({
    routers,
    view_id: view.view_id
  });
};

const pushPage = async (page_id, user_id = 0, {
  view_id,
  params,
  redis,
  routers,
  history,
  sendEvents
}) => {
  if (devMode)
    !user_id && console.error(`\x1B[34m[DEVMODE] -`, `\x1B[31muser_id`, `\x1B[33m\u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F, \u043D\u043E \u0436\u0435\u043B\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0435\u0433\u043E \u043F\u0440\u0438\u043F\u0438\u0441\u044B\u0432\u0430\u0442\u044C`);
  view_id = getCustomViews({ routers, view_id });
  if (!view_id) {
    const old_view_id = await activeViewId({ user_id, redis, routers, history });
    if (typeof old_view_id === `string`)
      view_id = old_view_id;
  }
  if (!view_id) {
    if (devMode)
      console.error(`\x1B[34m[DEVMODE] -`, `\x1B[31mview_id`, `\x1B[33m\u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
    return;
  }
  const _isRedis = redisGetReady(redis);
  var old_page_id = ``;
  if (_isRedis) {
    var views = await redisGetViews({ redis, user_id });
    if (views.find((x) => x.view_id == view_id && x.user_id === user_id)) {
      var pages = views.find((x) => x.view_id == view_id && x.user_id === user_id).pages;
      old_page_id = pages[pages.length - 1].page_id;
      pages.push({ page_id, params });
    } else {
      old_page_id = page_id;
      views.push({ view_id, user_id, pages: [] });
      var pages = views.find((x) => x.view_id == view_id && x.user_id === user_id).pages;
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
    old_page_id = view.pages[view.pages.length - 1].page_id;
    view.pages.push({ page_id, params });
  }
  sendEvents(`NEW_PAGE`, {
    page_id,
    old_page_id,
    user_id,
    params
  });
};

const popPage = async ({
  user_id,
  redis,
  history,
  sendEvents
}) => {
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    var redis_views = await redisGetViews({ redis, user_id });
    const view2 = redis_views[redis_views.length - 1];
    if (view2) {
      if (view2.pages.length <= 1) {
        redis_views.pop();
      } else {
        view2.pages.pop();
      }
      sendEvents(`BACK_PAGE`, {
        user_id,
        page_id: view2.pages[view2.pages.length - 1] && view2.pages[view2.pages.length - 1].page_id,
        old_page_id: view2.pages[view2.pages.length - 1].page_id,
        params: view2.pages[view2.pages.length - 1] && view2.pages[view2.pages.length - 1].params
      });
    }
    await redisSetViews({ redis, user_id, views: redis_views });
  } else {
    var view = await getView({ redis, history, user_id });
    if (view) {
      if (view.pages.length <= 1) {
        history.pop();
      } else {
        view.pages.pop();
      }
      sendEvents(`BACK_PAGE`, {
        user_id,
        page_id: view.pages[view.pages.length - 1].page_id,
        old_page_id: view.pages[view.pages.length - 1].page_id,
        params: view.pages[view.pages.length - 1].params
      });
    }
  }
};

const backPage = async ({
  page_id,
  user_id,
  redis,
  history,
  sendEvents
}) => {
  if (devMode)
    !page_id && console.error(`\x1B[34m[DEVMODE] | {backPage} -`, `\x1B[31mpage_id`, `\x1B[33m\u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F, \u043D\u043E \u0436\u0435\u043B\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0435\u0433\u043E \u043F\u0440\u0438\u043F\u0438\u0441\u044B\u0432\u0430\u0442\u044C`);
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    var last_page_id = ``;
    var params = {};
    var countAllPages = 0;
    var redis_views = await redisGetViews({ redis, user_id });
    for (var itemRedis of redis_views)
      countAllPages += itemRedis.pages.length;
    for (var i = 0; i < countAllPages; i++) {
      if (redis_views[redis_views.length - 1]) {
        var page = redis_views[redis_views.length - 1].pages;
        if (page.length <= 1) {
          redis_views.pop();
          last_page_id = page[page.length - 1].page_id;
        } else {
          page.pop();
          last_page_id = page[page.length - 1].page_id;
        }
      }
      if (last_page_id === page_id) {
        params = page[page.length - 1].params;
        i = countAllPages;
      }
    }
    sendEvents(`BACK_PAGE`, {
      user_id,
      page_id: last_page_id,
      old_page_id: page_id,
      params
    });
    await redisSetViews({ redis, user_id, views: redis_views });
    if (last_page_id === page_id)
      return true;
    return false;
  } else {
    var view = await getView({ redis, history, user_id });
    if (view) {
      var last_page_id = ``;
      var params = {};
      var redis_views = await redisGetViews({ redis, user_id });
      var countAllPages = 0;
      for (var item of history)
        countAllPages += item.pages.length;
      for (var i = 0; i < countAllPages; i++) {
        var page = view.pages;
        if (page.length <= 1) {
          history.pop();
          params = page[page.length - 1].params;
        } else {
          page.pop();
          params = page[page.length - 1].params;
        }
        if (last_page_id === page_id) {
          last_page_id = page[page.length - 1].page_id;
          i = countAllPages;
        }
      }
      sendEvents(`BACK_PAGE`, {
        user_id,
        page_id: last_page_id,
        old_page_id: page_id,
        params
      });
      if (last_page_id === page_id)
        return true;
    }
    return false;
  }
};

const getViewId = async ({
  view_id,
  user_id = 0,
  history,
  routers,
  redis
}) => {
  view_id = getCustomViews({ routers, view_id });
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    var view = await redisGetViews({ redis, user_id });
    if (!view.find((x) => x.view_id == view_id && x.user_id === user_id)) {
      view.push({ view_id, pages: [], user_id });
      await redisSetViews({
        redis,
        user_id,
        views: view.filter((x) => x.user_id === user_id)
      });
    }
    return view.find((x) => x.view_id == view_id && x.user_id === user_id);
  } else {
    if (!history.find((x) => x.view_id == view_id && x.user_id === user_id)) {
      history.push({ view_id, pages: [], user_id });
    }
    return history.find((x) => x.view_id == view_id && x.user_id === user_id) || { view_id, pages: [], user_id };
  }
};

const getView = async ({
  redis,
  user_id,
  history
}) => {
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    const view = await redisGetViews({ redis, user_id });
    return view[view.length - 1];
  }
  var get_history = history.filter((x) => x.user_id === user_id);
  return get_history[get_history.length - 1];
};

const redisGetReady = (redis) => redis && redis._redis.isReady;

const redisGetViews = async ({
  redis,
  user_id
}) => {
  const status = redisGetReady(redis);
  if (status) {
    var view = await redis.get(`views_${user_id}`);
    if (!view)
      return [];
    return JSON.parse(view);
  }
};

const redisSetViews = ({
  redis,
  views,
  user_id
}) => {
  const _isRedis = redisGetReady(redis);
  if (_isRedis) {
    redis.set(`views_${user_id}`, views);
  }
};

class Router extends events.EventEmitter {
  listPages;
  redis;
  routers;
  constructor({ history, redis, routers, devMode = false }) {
    super();
    this.redis = redis;
    this.listPages = history || [];
    this.routers = routers;
    globalThis.devMode = devMode;
  }
  sendEvents = (event_name, data) => this.emit(event_name, data);
  //Отправка запроса по идентификатору
  listen = (callback_name, callback) => {
    const eventData = (data) => callback(data);
    this.on(callback_name, eventData);
  };
  // Инициализация подключения
  getCustomViews = (view_id) => getCustomViews({
    routers: this.routers,
    view_id
  });
  getViewById = async (view_id, user_id = 0) => getViewById({
    view_id,
    user_id,
    routers: this.routers,
    history: this.listPages,
    redis: this.redis
  });
  activePage = async (user_id = 0) => await activePage({
    user_id,
    history: this.listPages,
    redis: this.redis,
    routers: this.routers
  });
  getLocation = (open_page_id, page_id) => getLocation({
    routers: this.routers,
    open_page_id,
    page_id
  });
  activeViewId = async (user_id = 0) => await activeViewId({
    user_id,
    redis: this.redis,
    routers: this.routers,
    history: this.listPages
  });
  pushPage = async (page_id, user_id = 0, {
    view_id,
    params
  }) => {
    await pushPage(page_id, user_id, {
      view_id,
      params,
      redis: this.redis,
      routers: this.routers,
      history: this.listPages,
      sendEvents: this.sendEvents
    });
  };
  popPage = async (user_id = 0) => {
    await popPage({
      user_id,
      redis: this.redis,
      history: this.listPages,
      sendEvents: this.sendEvents
    });
  };
  backPage = async (page_id, user_id = 0) => await backPage({
    page_id,
    user_id,
    redis: this.redis,
    history: this.listPages,
    sendEvents: this.sendEvents
  });
}

class Redis {
  _redis;
  constructor(url) {
    this._redis = r__namespace.createClient({ url });
    globalThis.redis = this;
  }
  get = (key) => new Promise(async (resolve) => {
    try {
      if (this._redis.isReady) {
        const result = await this._redis.get("router:" + key);
        resolve(result || void 0);
      }
      resolve(void 0);
    } catch {
      resolve(void 0);
    }
  });
  set = (key, value) => new Promise(async (resolve) => {
    try {
      if (this._redis.isReady) {
        const data = typeof value === "string" ? value : JSON.stringify(value);
        await this._redis.set("router:" + key, data);
        resolve(true);
      }
      resolve(false);
    } catch {
      resolve(false);
    }
  });
  keys = (key) => new Promise(async (resolve) => {
    try {
      if (this._redis.isReady) {
        const result = await this._redis.keys("router:" + key);
        resolve(result);
      }
      resolve([]);
    } catch {
      resolve([]);
    }
  });
  setex = (key, seconds, value) => new Promise(async (resolve) => {
    try {
      if (this._redis.isReady) {
        const data = typeof value === "string" ? value : JSON.stringify(value);
        await this._redis.setEx("router:" + key, seconds, data);
        resolve(true);
      }
    } catch {
      resolve(false);
    }
  });
  init = async () => await this._redis.connect();
}

exports.Redis = Redis;
exports.Router = Router;
