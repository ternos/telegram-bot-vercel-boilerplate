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

async function addAppToDB() {
  const { data: applications } = await supabase
    .from("applications")
    .insert([
      { appName: App.appName, appStoreUrl: App.appStoreUrl }
    ])
    .select()

    console.log(applications, 98764);
}

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
  сtx.reply(`Название: *${App.appName}*,\nApp Store: ${App.appStoreUrl}`, { parse_mode: 'Markdown' })
})

bot.command('sb', async () => {
  await addAppToDB();
  // do something else if needed
  return;
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
