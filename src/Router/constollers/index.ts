export { default as getCustomViews } from './getCustomViews/getCustomViews';
export { default as getViewById } from './getViewById/getViewById';
export { default as activePage } from './activePage/activePage';
export { default as getLocation } from './getLocation/getLocation';
export { default as activeViewId } from './activeViewId/activeViewId';
export { default as pushPage } from './pushPage/pushPage';
export { default as popPage } from './popPage/popPage';
export { default as backPage } from './backPage/backPage';
export { default as addParamsActivePage } from './addParamsActivePage/addParamsActivePage';
export { default as replacePage } from './replacePage/replacePage';


//private
export { default as getViewId } from './private/getViewId/getViewId'
export { default as getView } from './private/getView/getView'
//redis
export { default as redisGetReady } from './private/redis/redisGetReady/redisGetReady';
export { default as redisGetViews } from './private/redis/redisGetViews/redisGetViews';
export { default as redisSetViews } from './private/redis/redisSetViews/redisSetViews';