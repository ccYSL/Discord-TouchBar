/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RendererSettings } from "@main/settings";
import { app, BrowserWindow, IpcMainInvokeEvent, nativeImage, TouchBar, TouchBarButton } from "electron";
const { TouchBarLabel, TouchBarButton, TouchBarGroup, TouchBarScrubber } = TouchBar;

async function setGuilds(guilds: Array<Object>) {
    const guildBtnArray = await Promise.all(guilds.map(async g => {
        // @ts-ignore
        const gIcon = await fetch(`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`)
            .then(res => res.arrayBuffer());
        const guildButton = new TouchBarButton({
            // @ts-ignore
            accessibilityLabel: g.id,
            icon: nativeImage.createFromBuffer(Buffer.from(gIcon)).resize({ height: 30 }),
            backgroundColor: "#000"
        });
        return guildButton;
    }));
    return guildBtnArray;
}

export async function initTouchBar(_ev: IpcMainInvokeEvent, guilds: Array<Object>) {
    // @ts-ignore
    const { addGuilds, addFriends, includedGuilds } = RendererSettings.store.plugins.DiscordTouchBar;
    console.log(addGuilds, addFriends, includedGuilds);
    let touchBarItems;
    if (addGuilds) {
        includedGuilds.length === 0 ? touchBarItems = await setGuilds(guilds.slice(0, 5)) : touchBarItems = await setGuilds(guilds.filter(i => includedGuilds.split(",").includes(i.id)));
    }
    const discTouchBar = new TouchBar({
        items: [new TouchBarScrubber({
            items: touchBarItems,
            highlight: i => {
                _ev.sender.executeJavaScript(`Vencord.Webpack.Common.NavigationRouter.transitionToGuild("${touchBarItems[i].accessibilityLabel}")`);
            },
            mode: "fixed"
        })]
    });
    window.setTouchBar(discTouchBar);

    // const guildBtnArray: Array<TouchBarButton> = [];
    // const guildButtonPromises = guilds.map(async g => {
    //     // @ts-ignore
    //     const gIcon = await fetch(`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`).then(res => res.arrayBuffer());
    //     const guildButton = new TouchBarButton({
    //         // @ts-ignore
    //         accessibilityLabel: g.id,
    //         icon: nativeImage.createFromBuffer(Buffer.from(gIcon)).resize({ height: 30 }),
    //         backgroundColor: "#000"
    //     });
    //     return guildButton;
    // });

    // Promise.all(guildButtonPromises).then(buttons => {
    //     guildBtnArray.push(...buttons);
    //     console.log(guildBtnArray);
    //     window.setTouchBar(new TouchBar({
    //         items: [
    //             new TouchBarScrubber(
    //                 {
    //                     items: guildBtnArray,
    //                     selectedStyle: "outline",
    //                     highlight: i => {
    //                         _ev.sender.executeJavaScript(`Vencord.Webpack.Common.NavigationRouter.transitionToGuild("${guildBtnArray[i].accessibilityLabel}")`);
    //                     },
    //                     mode: "fixed"
    //                 }
    //             ),
    //             new TouchBarButton({
    //                 icon: nativeImage.createFromDataURL(settingsImg).resize({ width: 25 }),
    //                 click: () => {
    //                     console.log("click settings");
    //                 },
    //             })
    //         ]
    //     }));
    // });
}


let window: BrowserWindow;
let i = 0;
app.on("browser-window-created", (_, win: BrowserWindow) => {
    if (i === 1) { window = win; }
    i++;
});

const settingsImg = `
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAyKADAAQAAAABAAAAyAAAAACbWz2VAAAc7ElEQVR4Ae2de7BV1X3HQ30hPiI+wESFC0lGJ6NJNBHt1JT4IA0ZB+WhsbYaAkSgY1XIjE41M7WDmv9EM7FqYhG1vg2NhkFqFXWSNBLUVJPJaCcDl1cD+GrFoJgo/XzJ3rDvuXuf/Vi/vc86h/Wb+d2979rr9/qu39rPtdb5yEcCBQQCAgGBgEBAICAQEAgIBAQCAgGBgEBAICAQEAgIBAQCAgGBgEBAICAQEAgIBAQCAgGBgEBAICAQEAgIBAQCAgGBgEBAICAQEAgIBAQCAgGBgEBAICAQEAgIdBMCQ7rJ2V70dceOHYcT12h4BHxAFOPv2W6B+4cMGfJGVBY2HUAgdJCGQadDqDOcDZ8OnwIfDbejDRxcCT8NL6XDrG1XORwLCHQlAnSMafDjsCtJx7SuBCE4HRBoRYBkngKvcu0VKfLSOaXVXvg/INAVCJC8I+H7Eon9YWLfdTepSzZGdgUowcmAgBAgYSfCG1t6QTKpWw6V/rdVl2xNDOgHBLxHgESdWTrdywm0do6k9EzvAQoO7rkIkKmzk9mast8uuVOqpxbl6Zi957ZAiNxbBEjlqanpbFuY1zlia1O9BarLHAvfQQwajKw8DjWr4AMN1LVTsYODRdrsHeqdzDeTV9opC8fyEfiz/CqhRgEEvkcdXzqH3JUv8imQIwKhgzgCyNXjMlSc6aimDvEzI9/q0L3H6Cxyud5jwCgbKAk4DBkN/Ti8rGxD9V/HzmhutbY1ZK/nzIQriFuTzkPc186hyOSbfAxUEYFwBakInMS4gqxjc4yDiiZE13MFGdWEoV60Ea4gFVuVzjEZUd87h6I7JvK1YqR7tljoINXb/9zqoo1LdpOvjYPTzmC4xWqHTptjnJU3c1iTnCzoVZQ8BMffLfRd5Xz4WNiCtnCbFQY0VkCy5zoIiXsiOHwW/iT8MfggWKQ3OZqltxr+FfwcSfMB29KEjS8j9O+lBdMF5uPHwrRD2NED9o1pxyqUXYGdmyvI7RTBl1PZ+Qw8FtaJQbMf9eFyK7wJ/i38Ejb+i20gnxCg8c6D74ffhIvS+1RcCs+C46muhcKi/n/CFnRBnkGMXGBhSDrybCWPU30oPAN+DH4PLkpvUPFeOAx3SQLa9D4NoAa8Bt4Au9K7KLgZHpMXB3X+wdVYJL8sz1Z8nPrLjGyuiHVmbbEzCr4RfsfA5np0XA0PzbIXymtAAMDnwpvhOug7KN0vzW3KbzE0OCHNRloZNicY2tWr6UGE/n3hBYZ2kqo28c/cQUa7oKCrnkEAWWd4jTH6agPYPouNn8N/hE+CLW3+AX3DuF+X7lwi7r2ppGeofXIrl6vwU6oPgxVfE6Sr5qXEvaYJYxY2uqaDkCRnE/Bi+DCLwDus4zGS5JwyPhD/C9RvKpGzXCs6mjhLXuVaxmg68S9tV8mXY13xHYTk+AaA/Rjuhc6htv+h/pSkm0rWr6O6xQlVbfjjqE3r8NFUp0XApg61KouAXNRa3sX/6wx6BGfQUm+VFC9YvMbG57FfcrMMzQCHO8sINF3X6ysICaHbql7qHGrfW6p0jigxbom2vbJZFLWxt/F4ewUBuDGgpll6lrdVFvfQLo35FsJ9dJC3qygBk4OR2whrQlSvkK6omv24xseAfL6C6G2VVeeIb2eqnBBiWYv2+8eqnUPGI9nrLBxx0GGJh9xQG6utvaQqCVN7IJwp9c78n2s3VMyAEsICp+UkuMnaVeCjD36nF3O/a2r9Hfjc6pu3Fg1vGhONr6+u/XAvDa7Tw/UpJMAats4ERqNQ8gu4lzDaQjya/fieM0CGCny8xZrfYw2v5rrYqnNIGbrWsblI+z1EI4jlW77F4+MVZD0g5f0kQBUcrW6Vytr+axL6gbJCRepzJTmfeg8WqdsldTaCVR1tXzl8r64gNPhUIvEKoMrI/mmIytS6Oof8QvdDbKY4+Oib6FHkwHk+OeVVB6m5sZu6WupK9Wv4NBJ4Sd2NjY1/w8afw1vrttWQfq86vG8d5CuGjaDE+StYcz002G8c3MRHR719O5HEXcm2EcLWcxg6FL6zAYOLsaHJUxrxfBCsN3OPwVakNgvUigCX1s/BVjSnVX/8PwaOgzWhx5qeQOGXYjud2uLDGbB8SaOia/umyWpC2vFZcXFMUxCsSLNCAyURANmvG6E7N6k3ax9bJ8K3wlsd7T6A/FlZdjpVLp/gRx1j2478XfAXisRBvTmO9mLx6UXs7VF1QMZiss6jZUHD7l6wfiZNneUlOI9epcJi+GJ4eFl7TdfHx0PhS2AluhI+jzQRTVhoqm/p+SfILIFdqdOjBXY1U1MPrrsMZu2A6A84NivreMHyidyPLy9YN7Uafuh5ZSysj3Aa8ySMtsH6kNWPfu13LRHfMJzvg4+AFd+HsH52+nfwGuIrNImLuqmEfosFLRbhhxc/BqRk8IX0wOdKP3VVECXIf6NH3HMUdfDf1BiYcxvgm0UumITo01ssi6vZ+yaoBCUuCGxvI6xX4F1FPnUQXeZdKbz9cEXQXf6kSIU6Q2uHKHoS9OY21qcOonv8ItQKelIm8/VuslLYrxWBuA3UGdI6RLv2ix0rmgtx/dq2PnWQ1SlRpoGZBnosOp2HxMx39XGlsK0HAbD/NJpn5Ghv136xaFouxMca3frUQV5OibwImK1i17QWhP8bQ+BqI0u/MtLjrKZKAjobzVLAGUhzATSEwZU0hfN5VyVBvjgCtJ2e/14sLpFZU2uG7U/7VVo3OVNrxQM+XUEUwhMV42gV+/vWgvB/7QhcamThCV86h+LxrYP8yAjkSl+BjWzvcWq4eiiPLjQK3CoHjNzxSA1AD4UtFk1GzY4LPAqtp10Ba62ub0FaRFyjr70hn76kawKQltn/PujMM0BoPDoeMNBTmwpi3R/lo+AR8CFw/Pylj23/C+t15zpweZetzySsLej7xGrxPczCl506vHpIl0ckjRJm7U7v3P5496tKxKZE+iJ8Mqwfo+mDi1A/lfSWT+uE/YQkepatN0RcGsd1pIFDY4ltjYGe3lYB4BYje1Gzc+BhR8HCh0nw3fBbsBVJl3RO6mhwGMeHIfAHsCvd0OlYusY+SOu3KizoU50IGseHw9+G18Bp5DJxqVVfPwWy1ZGh99j9RKtDFf/36tmjE3lTymZFkFvF/rKUUcfKGN8f1tVPD5tNk2xeB+u5pjHC3l9YBNqYwyUN+faaN+m+xUenxs5KJMksnNcQiW/DQ5OBZOzvyCivWiybGkWwOvKlqp6ycsPKCqTU9+bLeatvPncQixGdtcdHMvbBenevCV8WD6qtbVT2f/nwA/kk38oKV6hvgbG3b+ksgquAaSGR0wrVal/pnfaH3Y6SgNPQoCtdqV+LcrNaWFo+vRj5WFioQkWL17LjKthtRMTnDmIBwGsWStJ0kHgamPcw3JGH4zSfUsrk28ORrymHTYpqw9jEO0clXnYQGnSdY1yxeH+8Y7nFv5vRd72jzia/QV0f+ezocqp4f2ppyUL80++eeEfedRCAWgFKxzggFT/8vs9HJ4vnmAGu4N/tFFw2oLA7/rks8t3UWzDWV38LnD+Of8+YOmegzJsOAjiXw0ru0x3jis/M5sNMcE9Xjksc/eukuJb/UQzW9JCRwvH4J7rCSJ+zmo52EICYDGu9ps1EcpNzNAMV/Gzgv27/4aOeObrxytEauK4kisWSLFYySfqzUDkBKzcmJw80vR+fbRuzS8B6bz4Png273Erl+XwYl/838yoVOY7PelulB/JeovPA5xGLgMDno+jR4Mq6SD+JoVvbhXXcNtfldGm9AKmz12tw3fRoaecyBHBU3znerNvhDuhXTH0ZYZcuRteSBmJQ7vTCVXwgvgSlBaOfbADA2MRZAz2o/h8K9cGtV0kfOE0IgLRodlOkXDrOxPFOKyGQqbDrAtFlgH/CKmaMzipjuEvraoiMCRH/8gYxUE7pB5dqpVqfQQhAzxm31RrBYOVncp+qV8VOhO8a9LcarnP4iJ6R9ICrsUj69vN/sEj39KPgE2CNKDgUros2oVjzMJyHe4DZeHQ9U5ejGXrn4LueT7qLAGsm3DQtskIJxzUyti7SXA4t8lyIVBeWTB5VHUa/oJAjBSrh4B15TtZw3IuFrgvA86cqADCxBhDyVL5Nhb0LO9mmIno0n6OOIetK8sr3zpKF74HTqGrnkC7FOrwNJIUPoUcTqDrxUmNiYSc7WRFwRsIb4abpVKu4cVwTkCxJ98sXGvp3IfqSz3UunSOOU8P0TQiF42KlDW6Vc/rJCr8JJ+9rEJTY1GRLVFCqWXpWpB/lqXzVyIpLOmHptugcqNmxJstWlXL0nSOlDdN9VXxtTAYw9EtNTdP5lgHi/CTDAJTAH7P0L6lLumHZsKJJSf2u+zhltRxQmfimuPpdmzxRrCoTiWPdTchPsA4GnUUehou4rlsg8ytHa7yyASdvt4r4llXn7lb9rv9jSL+V+D9ZBmsoX+Xqcy3yBDotClaXfKvLfhZ+Kzig16DmhF6tGGJBZs8ceUHirJ5JLOitPFtVjuPYMfBTFg620ZHMOw0N8otw/PEW55MOtxyq/K/OlFfVFTm6x1f2bKDgPXX5mKUX81ZXPn3LqIXw8UpYbxstKe1k/HgtAVRVSrSj20Rs0VE0Buda+OCqPhaRQ7/V26vab61a48F33WpZkNnbrFYf9T8OHgSrLbdYONtGx+g0+2XLrIa7n93GsL7WV/lir2XwX4Qv5kvpEfC18Ntt7Fgc0oqHrnQPfr7iqqSsfGTT5cq1I7JpgUGm+/i5FVZbjqDSxfALsNramtrlpLWt9vroxY+06cllDy1DYAJs8tGvvecDj2JzDexKhb+QD7Tu/h+O64t7EYqv6vE2KWP6urdIVBjfG1abq+2tyGQofxH/c+sQ0XqjqC7INVZTBfzXom+u9EZN7hVWSwBvuAaBfKOLzyWDw7Z+usKC1if1Vt13vsUiksMwfnRVBxJy87nsPpD4v+ldi7diGnjYabLwwQKLSjhEOTC/kvBAoaPJzcMHFpX/z7mDYLKvvNlBEq8CzMJBpc0W6J7YlXxYIdDCBwssKmMZ5cKrlRXsFnR+ULfoIBZgWk363w1N+b1DyosMklg3qKT5AgsfLLBwjdwiJ5xz06KDHOCKBPKNv/VJ8Tn+8ZqUQ4WL4vkchQVqqGjhgwUWrqFZ5IRzblp0EFcggnxAwFsELDqIxdqsjX9YS2mR7SllZYs0E7DTZOGDBRauOFjkhHNuWnSQLa5IIH++gQ5XFRbL1nTs7U8ieAsfLLBIuFRp1yInnHPTooOsrRT+QKFjeSU3b2BR4/85g4nHmkPeabLwwQKLyjhEuXBsZQW7Bft373Zwj4DCh0JAgMKHQsc8BMPe+lAY4bHSEZdY/H4A6shQE969a1WP/tiRittD8b+jQ03w23UFlP4Ii4oQlBcDs11DTZC+v7yGVAmTnLS4xZJ3T6e6WK1Qk++1ttU2gHsevqiamkpSL0dS8cC9Kkr+toqQkYyF7RgDI5ey1aht4ReosQ1Wm6vt80htU6R9LHMyz6f2xwlyNFwnaWi0hkgf1N4Tt6PoD8PdwcANxfbSYHxw1JauS9CmDbRE9S4a3d6Tho/iVuuEKXmqICxJk22urCs0dI83cvbuunzM0ovfWcsBlQ1pfJYN13IcuQq2mh4cx5XWUfyaMCXg8LbJKbeavlnLyvDoDVNuXXtCizyYjoJXwHVSsqP4N+U26iRNLtqghQDOamkL53/RaTV1NSzaQGuAp+Z5aIGNpsh00Qarh/Q4Mb8T7zSw1XI6/wHq5xnbsppocyB+PYh/8rMWinQ/iHLZsiCr2Hf6gn/62KeH75EWzhXU0WQOFnQpUQ1QOrFw3DkJF5x3iWENbEXdsnBcvzNwCQWAN9kKwBJ6/F44TvgQTKeWHh2XaB+nXWKwepsVt61ut8yWAZIuOPmwq/tvVzJ7e4Ujp7o6U0G+O5YejTpJJxav1oLJVRaHGNSZ0DMcfrdCI+WJ6E1T5UF4koWznpFcOoliHT4IiAoF6NFHP+ulfVCZS0W+oVSIqCYRwpmZG5J9hTuswsG1Bfbu7dKoJC/8xV114ayOsUspO1U7yXWGuC1KOtTQfm0/f2Byxs0CF3Bmc+y2rOM1lX+JoRLPuurG9/3RsRo+0lVXG/le+wGdM4j1qTbx1nGoO39AJ0aCRJsKJ++X+bdWWh7bdt3i5axaPfVD+SxXnGJ5wnmiwZCUU1Nj2129JRDdOz/ZIHg6k5kQPocf8SyAJDid1WD7KpcqP8sVCKczVQjqMth1DE6RdlhiFSHG+mC9AOg1Ukx9hjg92gBAyp3LrHwuoqfWZ5A0BwhwGOWaHKXnk1qGi0R2D+FZxGIBg53DaND5cKS3VzbngY/Jh0HaVEPs65wLo0XgbocX4rNG/u4ZBLD6mHQXvBm2JtM3Gzh3tbWDHdR3tWWGEcclNcSinFBuTLb0tWt1AcQVxiDfaQ0G/t1s7GMn1N1cAy5KZEu63NrHntEHys8YIe28okUaqPh2u5F/nVCj2xRzIpDtUTBVv8PEWKwwd85RYePPIEX8Ba2N1Pt4kbo5dYZyz7o9p07pw/ins3CjD4ulnRws8F2wMD8zg4WeKS1ORuvxz2JFlsGRO5RYj+Z1cGW3KEAdtfs/p70+J+kM4SjRrsk4XEfxDkel19TROSKf+hx92ynuY+eQY152EAvAIx1HGOoaoIoGvYECDbV/a8ABv/6Rb3pbJV/rotowrsvhMnp97iArywSSUdd5bdYMvTuLSTy9Jj0JfrRdvQ4dk08nRT7W6YLFXBSLn2yoJUafO4hFcn9YC2oJpSSglsk5l6JvwpsShzq1Kx++KZ/kWwNOWGCs5xgvyecOcrwBYo19VCIZNZJ4LHw9/J6B70kVRV6myKZG5Y6NfEnK17lv8YCuq3CgogjwZuQA2II+UdSmZT0c13wSTbrqtwgi0pH1CnUNx2VruGUMRXVh91OwBe1b1OYeXw+0bzBA/AN0FDnz1oo3PkyCNZfDarUUVO3UJZ2TanW+gHJ80AQpC1pQwFzjVTqeQK0Rg/QYyla3llf4fxO3GrUtmFDBH43p0ppTX4RPhj8D98FFqJ9KWvFQK3b8hLieZesNEddmnBlh4NBoYltnoMdMxd5mmuwUXWGk6odGeszURIm9K7lJLE3K0scxJdch8H6wSB839RMEWmV9HXJaN9hnWoJzcwwcVNvPN9DTmypIGD17WM0F1zeKQA0gQJtZrcj+DrqGNuByd5oAHKsZfOpkPr+h684GyvAarPeB4/FY7DrRjAwzHSn2LYnONULhPm5LLN7PG7nT22rA+g9E+IBRlFY5YOLOEBMtBko45+yFGt1r72OgTl+Qf2mgJ6goiADt9wWq6iWCK22n7by5zfLpCnIqyFp0jntD53DN0fLyYP48UhZXkf3obMoFL8inDnKCESJ1DswzcrFn1WgUQVlKG6msV+BekE8dZGwBRNLATIot4kz2m2RB2G8OAbD/NdYWt7GY1n5pt/lFcqGNGbtDPnWQIh+a0sAU6DHwt9lBEzRVRKBdG6S1X5qZIrmQJmde5lMHKTqiM+4MMRgCPQb+xbgwbDuGgMXLEYuR3CYA+NRBigYUd4a0+vGX6LRjoawZBCwGHbaeBJvxPMWKT0NNtqb4V7boNAT0gy2ViTcowmQMrHFcOpPpJPIO/BqsuR/b2HYtEZ9OIn2wZgIqPn0vUkyb4NXE55qcagNXssgFVx92yvvUQX5nENEcdJTqICSMXi1rjdfx8BS47f0v9d+njl5n/gx+hIR6k623hL8fxTn9Zp8S93y43a2shtRr/JfGsT2rLfGV/eA6FzlXUmcNlESAhpkOW5A6SS5h6POw1nNyHSKhJTfPyjXYcAV8OgNeAruQhuz8C3xiEfepN9fFWEL260Xs7VF11AgJgFx3M89iKD4evt/BQNbEJa1sfkanGw0fxsPLYWv6VxR+Ois+js0xNPi5LDt7dDkAWy4SrTP7V+AD4X3hU+A74bppEQYav3XF5hD4jrqDQ7+uKCfDe8HDYP24j+uVChW7qM41fkv3r3ZvhEorcxUAovvRcYGrHg/k9ZD5Ze7fn2vCF3Abh53lcEem3RrHqIGmf2Oss7I6317zauJNL9BBBPFzEndy3cFg4xxsrISb7Byub7raweJVDnh1BRFqNPgGNlYrK7ZriKaOfY0z4kN1GAMrTQqrRXeOv+ogdeTOBrCq8ycxcsIafNi3K4g8vHWwm11d8iCJPME6AnTqzVknOodCqaNzSK93bV9XoAq2EtHwQxFcC7f9HlFJeeeENmN6HGfHdRYugJHOsrqt8mpRCsfYhFEfGL3nqMdU3LsrSATQtaZRdl7ZSFxYbOiGdPVS5xA0/+Rb55BT3nUQOQVQutQu074x1flwmefq6Zz5r8qrlHccHVdS54y8eg0ct8RyWdTmDbhdzoR3t1ix+yTCGPZXwYfFZT2w1Ziuo0iGt6vEAiZ6O7YR1rZTZP2Aru8eJ4PJmk4F1M6ul1cQORwBNr2d8114TCuhu6z79C3kO9k5BLn1SXW6r52jjmCl05Q4a34DhYtMlXZW2eskhEbSliaw2IJQJdnSxpoRmAEWdzZjqpoVb68gcTgRgDPi/3tgeziJflHZOCKZ0DnKAudY3/py6ehOtjgJcjZHF8OuzyTW99DZTmcfeZGO//nsw4OPEL9WDSklM1iLFyV65tBt1VIvvMlxoms6iOIgScaw+R78Vf3fAGkK7zbYYhJQ0l0ttDaMJPljsjBrn7g1+FF+7JNVp2L5L5DbHz6honxZMb2ZvJS4vXwgLxuMt/VJGM072ATXQQtQmjptlPJ1hgYnFAUYmxMM7eot2CBCv9ZFtvjZiTRXN1M4d5DRUFAfAgA+FL4aXg+7khZNvhEelecxdVa4GovkdTYtRNRfZmTzmTyD2BkD3wxbLCK+AT3XwBodEahTCNAAU+F74TfgovQeFR+DZ8ClGrCogQL1cof2o8Nq5XQ9exUm7OqKosXEl8Lvw0VJc3o0IU0DKbueuuoZpAjaNIxmo30W/iR8JKzvBorz97Bek66GX+Y+uPJcDWxcjo6bYAuajy8L0xRhZx7lN6Ydq1A2DzuVfMYPrZt8KqxnlbHwCHgYLNoKaz2B38IvYeOXbHuGeq6DNNUyJI0G1ylRLOhVlDwEvxIpO5bt12BtLWgLiavxYIECAs0gQAfRgg/dQnc1g0rvWfH+Q6HHkP/IY99aXesmX1t97+j/4RbLAX4uH+sQ92oGXEo467m9yn07lyIXikAgXEHc0uB2N/FGpLvBx0aAqGIkXEGqoBbJcAXRm5y18OEOauoUfR3l+mnlbXUa6WXd4Qri0LpR4i2ooKLUN4kK+mORBaFzxFBU24YrSDXcBkhxJXmSgjMHFLb/p4kBk0/RObSwQyAHBEIHcQAvFqWDHMe+Zj9qQlQeNdE5NHNRs/Ti7yp5PoXjGQiEW6wMYMoUR4k4vYxMzXU1nDx0jppBDupLIsCVZDbcjrIWvm4n03osT8fskm6H6gGB5hAgm2e2ZnTi/7zkTlSttDuzuUiDpYBARQRI7YnwxpYUt+wcrbpka2JFd4NYQKB5BEjYkfB9iU7SmtSJQ6V3k7pkIwxEbL6Jg0ULBEjeKfCq0l0gX0A69ZNxgQIC3Y8AyTwNfjw/73NrSMe07kekOyII30EabieSezQmtULL6fAp8NFwO9rAwZXw0/BSXt+ubVc5HLNFIHQQWzxLa6PDaBmjPliTr/SzzKJ49uNaOoTGUwUKCAQEAgIBgYBAQCAgEBAICAQEAgIBgYBAQCAgEBAICAQEAgIBgYBAQCAgEBAICAQEAgIBgYBAQCAgEBAICAQEAgIBgYBAQCAgEBAICAQEAgIBgYBAQCAgEBAICAQECiDw/77HB7wCWNpBAAAAAElFTkSuQmCC`;

