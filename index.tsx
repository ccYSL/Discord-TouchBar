/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { ChannelStore, FluxDispatcher, GuildStore } from "@webpack/common";


const Native = VencordNative.pluginHelpers.DiscordTouchBar as PluginNative<typeof import("./native")>;

const settings = definePluginSettings({
    addFriends: {
        type: OptionType.BOOLEAN,
        description: "Add Friends to Touch Bar",
        default: true
    },
    addGuilds: {
        type: OptionType.BOOLEAN,
        description: "Add Servers to Touch Bar",
        default: true
    },
    includedGuilds: {
        type: OptionType.STRING,
        description: "Choose guilds by adding the Server ID followed by a comma. ex: 1629,1400,999 (If left empty & guilds are enabled will use first 10 guilds.",
    }
});

export default definePlugin({
    name: "DiscordTouchBar",
    description: "description",
    authors: [{ name: "Ce", id: 615999706836893720n }],

    settings,

    async start() {
        console.log("started");
        const guilds = Object.entries(GuildStore.getGuilds()).map(i => (i[1]));
        const users = Object.entries(ChannelStore.getSortedPrivateChannels().filter(channel => channel.ownerId === undefined).slice(0, 7)).map(i => (i[1]));
        console.log("users: ", users);
        ["CALL_CREATE", "CALL_DELETE"].forEach(action => {
            // @ts-ignore
            FluxDispatcher.subscribe(action, () => {
                Native.initTouchBar(users, guilds);
            });
        });
        await Native.initTouchBar(users, guilds);
    },

    stop() {
        console.log("exiting");
    },

});


