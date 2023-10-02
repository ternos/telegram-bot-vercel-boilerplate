import { Context } from 'telegraf';
import createDebug from 'debug';

import { author, name, version } from '../../package.json';

const debug = createDebug('bot:newApp_command');

let App = {
    appName: '',
    appStoreUrl: '',
}

const newApp = () => async (ctx: Context) => {
    let i = 0;
    const msg0 = `Напишите название приложения`;
    const msg1 = `Записал: ${App.appName}.\nТеперь пришлите ссылку в *AppStore*`;
    const msg2 = `Приложение: *${App.appName}*.\n${App.appStoreUrl}.\nСпасибо!}`;
    switch (i) {
        case 0:
            await ctx.reply(msg0);
            i++;
            await ctx.reply(i.toString());
            break;
        case 1:
            await ctx.reply(msg1);
            i++;
            break;
        default:
            break;
    }
  const message = `*${name} ${version}*\n${author}`;
  debug(`Triggered "about" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
};

export { newApp };
