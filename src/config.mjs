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

export default class Config {




    static DEBUG_MODE = false;
    static MANIFEST_PATH = './manifest.json';
    static BUILD_ZIP_PATH = 'dist.zip';




    static CLIENT_ID = 6663;
    static LOCAL_AUTH_SERVER_PORT = 3777; // Port for the local server. Do not change!
    static REDIRECT_URI = `http://localhost:${Config.LOCAL_AUTH_SERVER_PORT}/callback`;

    static SELLDONE_SERVICE_URL = "https://selldone.com";
    static SELLDONE_API_UPLOAD_URL = "https://api.selldone.com/developer/layouts/deploy";
    static SELLDONE_2FA_CHECK_URL = "https://api.selldone.com/security/2fa/check";
    static SELLDONE_2FA_VERIFY_URL = "https://api.selldone.com/auth/2fa";
    static SELLDONE_API_CHECK_VERSION_URL = "https://api.selldone.com/developer/layouts/check-version";
    static SELLDONE_API_GET_LAYOUTS_URL = "https://api.selldone.com/developer/layouts";

    static InitDebugMode() {
        if (fs.existsSync("./manifest-debug.json")) {
            this.MANIFEST_PATH="./manifest-debug.json"
            console.log("🚧  Debug mode enabled. Using manifest-debug.json");
        }
        Config.DEBUG_MODE = true;

        Config.CLIENT_ID = 200;
        Config.LOCAL_AUTH_SERVER_PORT = 3777; // Port for the local server. Do not change!
        Config.REDIRECT_URI = `http://localhost:${Config.LOCAL_AUTH_SERVER_PORT}/callback`;

        Config.SELLDONE_SERVICE_URL = "http://127.0.0.1:9000";
        Config.SELLDONE_API_UPLOAD_URL = "http://api.localhost:9000/developer/layouts/deploy";
        Config.SELLDONE_2FA_CHECK_URL = "http://api.localhost:9000/security/2fa/check";
        Config.SELLDONE_2FA_VERIFY_URL = "http://api.localhost:9000/auth/2fa";
        Config.SELLDONE_API_CHECK_VERSION_URL = "http://api.localhost:9000/developer/layouts/check-version";
        Config.SELLDONE_API_GET_LAYOUTS_URL = "http://api.localhost:9000/developer/layouts";

    }

}
