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

import Config from "./config.mjs";
import {Authentication} from "./authentication.mjs";
import fs from "fs";
import FormData from 'form-data';
import cliProgress from "cli-progress";
import axios from "axios";


export class Upload {
    // ━━━━━━━━━━━━━━━━━━━━━━ Build & Upload to Selldone ━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Upload ZIP file to Selldone.
     * @return {Promise<void>}
     */
    static async uploadZipFile() {


        console.log('▶  Uploading ZIP file...');


        // Check if the file exists
        if (!fs.existsSync(Config.BUILD_ZIP_PATH)) {
            throw `❌  Error: ${Config.BUILD_ZIP_PATH} does not exist.`
        }
        if (!fs.existsSync(Config.MANIFEST_PATH)) {
            throw `❌  Error: ${Config.MANIFEST_PATH} does not exist.`
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(Config.BUILD_ZIP_PATH));
        formData.append('manifest', fs.readFileSync(Config.MANIFEST_PATH, 'utf8'));

        const totalSize = fs.statSync(Config.BUILD_ZIP_PATH).size; // Get total size of the file

        // create a new progress bar instance and use shades_classic theme
        const bar1 = new cliProgress.SingleBar({ barIncompleteChar: '.'}, cliProgress.Presets.rect);
        // start the progress bar with a total value of 200 and start value of 0
        bar1.start(totalSize, 0);

        try {
            const response = await axios.post(Config.SELLDONE_API_UPLOAD_URL, formData, {
                headers: {
                    'Authorization': `Bearer ${Authentication.ACCESS_TOKEN}`,
                    'Accept': 'application/json',
                    ...formData.getHeaders() // Include the multipart headers
                },
                onUploadProgress: progressEvent => {
                    // update the current value in your application..
                    bar1.update(progressEvent.loaded);
                }
            });

            // stop the progress bar
            bar1.stop();


            const data = response.data;

            if (response.status !== 200) {
                throw `🛑 HTTP error! status: ${response.status}  ${await response.data}`;
            }


            if (data.error) {
                console.error('Error:', data);
                throw `🛑 Failed to upload file. Reasone: ${data.error_msg}`;
            } else {
                console.log('✅  Upload successful.', `${data.message}`);
                console.log('');
                console.table('▼ Layout');
                console.tableWithReadableHeaders(data.layout);
                console.table('▼ Deploy');
                console.tableWithReadableHeaders(data.deploy);
                console.log('');

                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("🎉  DONE!  🎉");
                console.log("✨  Your project is now live on Selldone.");
                console.log(`Please visit: ${Config.SELLDONE_SERVICE_URL}/developer/layouts/${data.deploy?.layout_id}`);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            }


        } catch (error) {
            console.error('❌  Upload error:', error);
        }


    }
}