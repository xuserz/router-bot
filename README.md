# Роутер для ботов

**Импортирование**

```js
    const { Router } = requier('apiteam-router-bot'); //es5
OR
    import { Router } from 'apiteam-router-bot'; //es6
```
*Создание*

```js
    const route = new Router({
      devMode: true //стандартное заначение {false}
    })
```
**Использование**

 

```js
    import TelegramBot from "node-telegram-bot-api";
    const TOKEN = '5796185493:AAHXakbzP_8tqMbmJSXL0GMvcqyvOJ8EAy0';
    const bot = new TelegramBot(TOKEN, { polling: true });
    //Не обязательно использовать модули для телеграмма

    import { routing, PAGE_BACK, PAGE_END, PAGE_START, PAGE_START_UP, VIEW_START } from  './routers'
    
    const route = new Router({
      routers: routing, // Использовать не обязательно
      devMode: true // Стандартное заначение {false}
    })
    
    bot.on('message', async (msg) => {
      const userId = msg.from?.id ||msg.chat.id;
      const pageId = await router.activePage(userId);
    
      if (msg.text == `/start`) return await router.pushPage(PAGE_START, userId, {
        view_id: VIEW_START,
      })
      
      if (router.getLocation(pageId, PAGE_START)) return await router.pushPage(PAGE_START_UP, userId, {
        view_id: VIEW_START,
        params: {text: msg.text}
      })
    
      if (router.getLocation(pageId, PAGE_START_UP)) return  await router.pushPage(PAGE_END, userId, {
        view_id: VIEW_START,
        params: { text: msg.text, old_text: pageId.params.text }
      });
    });

    router.listen(`NEW_PAGE`, async (data) => {
      console.log(`NEW_PAGE`, data);
      const  userId  = data.user_id;
      if (router.getLocation(data.page_id, PAGE_START)) return bot.sendMessage(data.user_id, `Напишите текст`)
    
      if (router.getLocation(data.page_id, PAGE_START_UP)) return bot.sendMessage(data.user_id, `Еще раз напишите текст`)
    
      if (router.getLocation(data.page_id, PAGE_END)) {
        await router.pushPage(PAGE_BACK, userId, {});
        return bot.sendMessage(data.user_id, `Готово, вот: \n\n1 Текст:${data.params.old_text}\n2 Текст: ${data.params.text}`, {
          reply_markup: {
            inline_keyboard: [
              [{ text:  `Назад`, callback_data: router.getCustomViews(PAGE_BACK) }]
            ]
          }
        });
      }
    })


    router.listen(`BACK_PAGE`, async (data) => {
      console.log(`BACK`, data)
      if (router.getLocation(data.page_id, PAGE_END)) {
        router.backPage(``, data.user_id);
        return bot.sendMessage(data.user_id, `Отмена сработала`);
      }
    })


    bot.on(`callback_query`, async (msg) => {
      const { data, id } = msg;
      if (data) {
       if (router.getLocation(data, PAGE_BACK)) {
         bot.answerCallbackQuery(id);
         router.popPage(msg.from.id);
       }
      }
    })    
```

**./routers**

```js
    export const VIEW_START = `view_start`;
    
    export const PAGE_START =`PAGE_START`;
    export const PAGE_START_UP = `PAGE_START_UP`;
    export const PAGE_BACK = `PAGE_BACK`;
    export const PAGE_END = `PAGE_END`;
    
    export const routing = {
      PAGE_START: "page_starting",
      PAGE_START_UP: "page_start_up",
      PAGE_BACK: "page_back",
      PAGE_END: "page_end",
    }
```



**Использование Redis**

```js
     import { Router, Redis } from 'apiteam-router-bot';
     
     const redis = new Redis(`redis://127.0.0.1:6379/`);
     async function startRedis() {
      await redis.init();
     }
     start().catch((error) => console.log(error));

     const route = new Router({
      redis: redis,
      devMode: true, //стандартное заначение {false}
    })
```



