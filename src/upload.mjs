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

export class Upload {
    // ━━━━━━━━━━━━━━━━━━━━━━ Build & Upload to Selldone ━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Upload ZIP file to Selldone.
     * @return {Promise<void>}
     */
    static async uploadZipFile() {


        console.log('▶  Uploading ZIP file...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream('dist.zip'));
        formData.append('manifest', fs.readFileSync('manifest.json', 'utf8'));

        try {
            const response = await fetch(`${Config.SELLDONE_API_UPLOAD_URL}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${Authentication.ACCESS_TOKEN}`,
                    'Accept': 'application/json',
                    ...formData.getHeaders() // Include the multipart headers
                }
            });

            if (!response.ok) {
                throw `🛑 HTTP error! status: ${response.status}  ${await response.text()}`;
            }

            const data = await response.json();


            if (data?.success) {
                console.log('✅  Upload successful.', `${data.message}`);
                console.log('');
                console.log(`Package: ${data.layout?.package} ┃ Version: ${data.deploy?.version} ┃ Live Path: ${data.deploy?.path}`);
                console.log('');

                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("🎉  DONE!  🎉");
                console.log("✨  Your project is now live on Selldone.");
                console.log(`Please visit: ${Config.SELLDONE_SERVICE_URL}/developer/layouts/${data.deploy?.layout_id}`);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            } else {
                console.error('Error:', data);
                throw `🛑 Failed to upload file. Status Code: ${response.status}`;
            }


        } catch (error) {
            console.error('❌  Upload error:', error);
        }


    }
}