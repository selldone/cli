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

import inquirer from 'inquirer';

export class Package {
    // ━━━━━━━━━━━━━━━━━━━━━━ Detect yarn / npm ━━━━━━━━━━━━━━━━━━━━━━

     static SCRIPT_AGENT = null;
    static async GetPackageManager() {
        if(this.SCRIPT_AGENT) return this.SCRIPT_AGENT;
        return this.SCRIPT_AGENT=await Package.getPackageManagerAsync();
    }

// ━━━━━━━━━━━━━━━━━━━━━━ Detect yarn / npm ━━━━━━━━━━━━━━━━━━━━━━

    static  getPackageManagerAsync() {
        return new Promise(async (resolve, reject) => {
            const userAgent = process.env.npm_config_user_agent;

            if (userAgent) {
                if (userAgent.startsWith('yarn')) {
                    return resolve('yarn');
                } else if (userAgent.startsWith('npm')) {
                    return resolve('npm');
                }
            }
            // Prompt the user to choose between npm and yarn

            const response = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'packageManager',
                    message: 'Unable to detect package manager. Please choose (npm/yarn):',
                    choices: ['npm','yarn' ],
                    default:'yarn'
                }
            ]);

            console.log(`You selected: ${response.packageManager}`);
            resolve(response.packageManager);
        });


    }
}
