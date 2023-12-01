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

import {Server} from "./server.mjs";
import Config from "./config.mjs";

export class Api{
    /**
     * Check version in manifest is unique
     * @return {Promise<void>}
     */
   static async checkVersion(_package, _version) {
        console.log(`▶  Checking layout version [${_version}] in the manifest...`);

        try {
            const data = await Server.PostRequest(Config.SELLDONE_API_CHECK_VERSION_URL, {package: _package, version: _version});
            if (data.error) {
                console.error('❌  Error:', data.error_msg);
                if (data.layout) console.log(`Please visit: ${Config.SELLDONE_SERVICE_URL}/developer/layouts/${data.layout.id}`);
                process.exit()
            } else {
                console.log('❎  Version is valid!');
            }
        } catch (data) {
            console.error('❌  Error:', data);
            process.exit()

        }
    }



}