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

import fs from "fs";
import archiver from "archiver";
import {Upload} from "./upload.mjs";

export default class Zip{
    /**
     * Create ZIP file of the build output.
     * @return {Promise<void>}
     */
    static async makeZipFile() {
        console.log('▶  Creating ZIP file of the build output...');
        const output = fs.createWriteStream('dist.zip');
        const archive = archiver('zip', {
            zlib: {level: 9}
        });

        output.on('close', () => {
            console.log(`✅  Zip file created (${archive.pointer()} total bytes).`);
            // Proceed to upload the file
            Upload.uploadZipFile();
        });

        archive.on('error', err => {
            throw err;
        });

        archive.pipe(output);
        archive.directory('dist/', false);
        archive.finalize();
    }
}