/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

import Config from "../config.mjs";
import {Server} from "../server.mjs";

export class ApiLayoutsList {

    static async getLayoutsList() {


        console.log('▶  Fetch layouts list...');
        try {
            const data = await Server.GetRequest(Config.SELLDONE_API_GET_LAYOUTS_URL);
            if (data.error) {
                throw data.error_msg
            } else {
                console.tableWithReadableHeaders(data.layouts);

            }
        } catch (data) {
            console.error('❌  Error:', data);
            process.exit()
        }

    }
}