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

import {Authentication} from "./authentication.mjs";
import Config from "./config.mjs";
import {execSync} from "child_process";
import {Package} from "./package.mjs";
import Manifest from "./manifest.mjs";
import Zip from "./zip.mjs";

export default class VueBuild {
    /**
     * Build Vue project.
     * @return {Promise<void>}
     */
    static async execBuild() {
        await Authentication.check2FAStatus(async () => {
            await VueBuild.execBuild()
        })
        if (!Authentication.USER) return; // User should be logged in

        if (!Authentication.IsPremium()) {
            console.log(`🔐  You are logged in as: ${Authentication.USER.name} (${Authentication.USER.email})`);

            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`❌   Only premium users can deploy layouts. Please upgrade your account to premium. It costs only $8 per month or $84 per year.`);
            console.log(`Subscribe here: ${Config.SELLDONE_SERVICE_URL}/shuttle/wallet/subscriptions`);
            console.log(`🎈  If you're unable to subscribe as a premium user, simply send us an email once you've completed your layout design. We'll offer free premium badges to the most outstanding designers.`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            process.exit();

        } else {
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`🔐  You are logged in as: 🦋 ${Authentication.USER.name} (${Authentication.USER.email})`);
            console.log(`You're a premium user. You can deploy layouts for free.`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        }


        await Manifest.checkManifest()


        // TEST!
        await Zip.makeZipFile();  return;


        try {
            console.log('▶  Building Vue project...');

            const stdout = execSync(`${await Package.GetPackageManager()} run build-production`, {encoding: 'utf-8'});
            console.log('Build stdout:', stdout);
            console.log('✅  Vue project built successfully.');

            // Proceed to make zip output
            await Zip.makeZipFile();
        } catch (error) {
            console.error(`❌  Build error: ${error.message}`);
            if (error.stderr) {
                console.error(`❌  Build stderr: ${error.stderr}`);
            }
        }


    }

}