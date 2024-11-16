/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RendererSettings } from "@main/settings";
import { app, BrowserWindow, IpcMainInvokeEvent, NativeImage, nativeImage, TouchBar, TouchBarButton } from "electron";
const { TouchBarLabel, TouchBarButton, TouchBarGroup, TouchBarScrubber } = TouchBar;

interface Icon {
    path: string;
    id: string;
    iconId: string;
}

async function createTbIcon({ path, id, iconId }: Icon) {
    console.log(`https://cdn.discordapp.com/${path}/${id}/${iconId}.png`);
    const iconNew = await fetch(`https://cdn.discordapp.com/${path}/${id}/${iconId}.png`)
        .then(res => res.arrayBuffer()).then(arrayBuffer => nativeImage.createFromBuffer(Buffer.from(arrayBuffer)).resize({ height: 30 }));
    return iconNew;
}

async function buildChannelButtons(guildsOrChannels: Array<Object>, path: string) {
    console.log("path:   ", path);
    return await Promise.all(guildsOrChannels.map(async i => {
        let icon: NativeImage;
        // @ts-ignore
        if (i.icon === undefined) {
            // @ts-ignore
            icon = await createTbIcon({ path: path, id: i.rawRecipients[0].id, iconId: i.rawRecipients[0].avatar });
        } else {
            // @ts-ignore
            icon = await createTbIcon({ path: path, id: i.id, iconId: i.icon });
        }
        const channelButton = new TouchBarButton({
            // @ts-ignore
            accessibilityLabel: i.id,
            icon: icon,
            backgroundColor: "#000"
        });
        return channelButton;
    }));
}

export async function initTouchBar(_ev: IpcMainInvokeEvent, users: Array<Object>, guilds: Array<Object>) {
    // @ts-ignore
    const { addGuilds, addFriends, includedGuilds } = RendererSettings.store.plugins.DiscordTouchBar;
    const touchBarItems = [];
    console.log(addGuilds, addFriends, includedGuilds);
    if (addGuilds) {
        // @ts-ignore
        const guildBtnArray = await buildChannelButtons(includedGuilds.length === 0 ? guilds.slice(0, 7) : guilds.filter(i => includedGuilds.split(",").includes(i.id)), "icons");
        const guildScrubber = new TouchBarScrubber({
            items: guildBtnArray,
            highlight: i => {
                _ev.sender.executeJavaScript(`Vencord.Webpack.Common.NavigationRouter.transitionToGuild("${guildBtnArray[i].accessibilityLabel}")`);
            },
            mode: "fixed"
        });
        // @ts-ignore
        touchBarItems.push(guildScrubber);
    }
    const userBtnArray = await buildChannelButtons(users, "avatars");
    const userScrubber = new TouchBarScrubber({
        items: userBtnArray,
        select: i => {
            console.log("werror: ", i, userBtnArray[i].accessibilityLabel);
            _ev.sender.executeJavaScript(`Vencord.Webpack.Common.ChannelRouter.transitionToChannel("${userBtnArray[i].accessibilityLabel}")`);
        },
        mode: "fixed"
    });
    // @ts-ignore
    touchBarItems.push(userScrubber);
    const discTouchBar = new TouchBar({
        items: touchBarItems
    });
    window.setTouchBar(discTouchBar);
}


let window: BrowserWindow;
let i = 0;
app.on("browser-window-created", (_, win: BrowserWindow) => {
    if (i === 1) { window = win; }
    i++;
});
