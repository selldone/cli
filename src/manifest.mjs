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

import {Api} from "./api.mjs";
import readline from "readline";
import fs from "fs";
import Config from "./config.mjs";


export default class Manifest{
    /**
     * Check manifest.json file.
     * @return {Promise<void>}
     */
    static async checkManifest() {

        const manifestPath = Config.MANIFEST_PATH; // Path to the manifest.json file
        // Check if the file exists
        if (!fs.existsSync(manifestPath)) {
            console.error('❌  Error: manifest.json does not exist.');
            return;
        }

        try {
            // Read the file
            const manifestData = fs.readFileSync(manifestPath, 'utf8');
            // Parse the JSON
            const manifest = JSON.parse(manifestData);

            // Check for 'name' and 'version' fields
            if (!manifest.name || !manifest.version) {
                console.error('❌  Error: The manifest.json file is missing either the name or the version field.');
                process.exit();
            } else if (!manifest.storefront && !manifest.backoffice) {
                console.error('❌  Error: One of the storefront or backoffice field is required in the manifest.json to be true. It cannot be false for both.');
                process.exit();
            } else if (manifest.name.lenght < 8 || manifest.name.lenght > 255) {
                console.error('❌  Error: The name field in the manifest.json must be between 8 and 255 characters.');
                process.exit();
            } else if (!manifest.package || manifest.package.lenght < 12 || manifest.package.lenght > 64) {
                console.error("❌  Error: The package field in the manifest.json must be between 12 and 64 characters. It's the unique identifier for your layout.");
                process.exit();
            } else if (!/^[a-zA-Z0-9\-._]+$/.test(manifest.package)) {
                console.error("❌  Error: The package field in the manifest.json must be alphanumeric and can contain dashes, dots, or underscores.");
                process.exit();
            } else if (!/^[a-zA-Z0-9\-._]+$/.test(manifest.version)) {
                console.error("❌  Error: The version field in the manifest.json must be alphanumeric and can contain dashes, dots, or underscores.");
                process.exit();
            } else {
                await Api.checkVersion(manifest.package, manifest.version);


                console.log(`✅  Layout name: ${manifest.name} ┃ version: ${manifest.version} ┃ package: ${manifest.package} ┃ support: ${manifest.storefront ? '🛍️ Storefront' : ''} ${manifest.backoffice ? '🏮Backoffice' : ''}`);

                const isVerified = await this.verifyWithUser(`Is the name "${manifest.name}" and version "${manifest.version}" correct? (yes/no): `);
                if (isVerified) {
                    console.log('✅  User verified the information.');
                } else {
                    console.log('❌  User did not verify the information.');
                    process.exit();
                }

            }
        } catch (error) {
            console.error('❌  Error reading or parsing manifest.json:', error);
            process.exit();
        }
    }


    /**
     * Verify with user.
     * @param message
     * @return {Promise<unknown>}
     */
    static verifyWithUser(message) {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            console.log('');

            rl.question('❓  ' + message, (answer) => {
                console.log('');
                rl.close();
                resolve(answer.toLowerCase() === 'yes');
            });
        });
    }


}