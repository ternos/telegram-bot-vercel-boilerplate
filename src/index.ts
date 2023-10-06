import { Telegraf } from 'telegraf';

import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

let App = {
  appName: '',
  appStoreUrl: ''
}

let Push = {
  pushTitle: '',
  pushBody: '',
  appName: '',
  pushTime: ''
}

// создание пуша
bot.command('ptitle', (сtx) => {
  Push.pushTitle = сtx.payload
  сtx.reply(`Заголовок: *${Push.pushTitle}*,\nСообщение: ${Push.pushBody}\nПриложение: ${Push.appName}\nВремя: ${Push.pushTime}`, { parse_mode: 'Markdown' })
})

bot.command('pbody', (сtx) => {
  Push.pushBody = сtx.payload
  сtx.reply(`Заголовок: *${Push.pushTitle}*,\nСообщение: ${Push.pushBody}\nПриложение: ${Push.appName}\nВремя: ${Push.pushTime}`, { parse_mode: 'Markdown' })
})

bot.command('pname', (сtx) => {
  Push.appName = сtx.payload
  сtx.reply(`Заголовок: *${Push.pushTitle}*,\nСообщение: ${Push.pushBody}\nПриложение: ${Push.appName}\nВремя: ${Push.pushTime}`, { parse_mode: 'Markdown' })
})

bot.command('ptime', (сtx) => {
  Push.pushTime = сtx.payload
  сtx.reply(`Заголовок: *${Push.pushTitle}*,\nСообщение: ${Push.pushBody}\nПриложение: ${Push.appName}\nВремя: ${Push.pushTime}`, { parse_mode: 'Markdown' })
})

bot.command('sendpush', async (ctx) => {
  if (Push.pushTitle) {
    if (Push.pushBody) {
      if (Push.appName) {
        if (Push.pushTime) {
          await addPushToDB();
          ctx.reply(`✅ *${Push.pushTitle}*\n${Push.pushBody}\n${Push.appName}\n${Push.pushTime}`, { parse_mode: 'Markdown' });
          return;
        } else {
          ctx.reply(`Не указано время`);
        }        
      } else {
        ctx.reply(`Не указано приложение`);
      }
    } else {
      ctx.reply(`Не указано тело пуша`);
    }
  } else {
    ctx.reply(`Не указан заголовок пуша`);
  }
});

bot.command('app', (сtx) => { // Добавляем название приложения
  App.appName = сtx.payload
  сtx.reply(`Название: *${App.appName}*,\nApp Store: ${App.appStoreUrl}`, { parse_mode: 'Markdown' })
})

bot.command('url', (сtx) => { // Добавляем ссылку на App Store
  App.appStoreUrl = сtx.payload
  сtx.reply(`Название: *${App.appName}*,\nApp Store: ${App.appStoreUrl}`, { parse_mode: 'Markdown' })
})

bot.command('clear', (сtx) => { // Добавляем ссылку на App Store
  App.appName = '';
  App.appStoreUrl = '';
  Push.pushTitle = '';
  Push.pushBody = ''; 
  Push.appName = '';
  Push.pushTime = '';
  сtx.reply(`Название: *${App.appName}*,\nApp Store: ${App.appStoreUrl},\nЗаголовок: *${Push.pushTitle}*,\nСообщение: ${Push.pushBody}\nПриложение: ${Push.appName}\Время: ${Push.pushTime}`, { parse_mode: 'Markdown' })
})

bot.command('sb', async (ctx) => {
  App.appName ? await addAppToDB() : ctx.reply('Нет приложения');
  // do something else if needed
  return;
});

bot.command('applist', async (ctx) => {
  const { data: applications, error } = await supabase
    .from("applications")
    .select("appName")
    .order("appName", { ascending: true })

  const appList = JSON.stringify(applications?.map((item) => `${item.appName}`))
    .replace(/[\[\]"]+/g, '').replace(/,/g, '\n');
  

  if (error) {
    console.log(error);
  } else {
    console.log(applications);
    ctx.reply(appList, { parse_mode: 'Markdown' });
  }
})

bot.command('pushlist', async (ctx) => {
  const appName = ctx.payload;

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("pushTitle, pushBody, pushTime, created_at")
    .filter("appName", "eq", appName)
    .order("created_at", { ascending: false });

  const pushList = JSON.stringify(notifications?.map((item) => `${item.pushTime},---${item.pushTitle},---${item.pushBody}`))
    .replace(/[\[\]"]+/g, '').replace(/,/g, '\n');
  

  if (error) {
    console.log(error);
  } else {
    console.log(notifications);
    ctx.reply(pushList, { parse_mode: 'Markdown' });
  }
})


//MARK: ФУНКЦИИ
async function addPushToDB() {
  const { data: notifications, error } = await supabase
    .from("notifications")
    .insert([
      { pushTitle: Push.pushTitle, pushBody: Push.pushBody, appName: Push.appName, pushTime: Push.pushTime }
    ])
    .select()

    console.log(notifications);
}

async function addAppToDB() {
  const { data: applications } = await supabase
    .from("applications")
    .insert([
      { appName: App.appName, appStoreUrl: App.appStoreUrl }
    ])
    .select()

    console.log(applications);
}

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
