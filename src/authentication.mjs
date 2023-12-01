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

import path from "path";
import os from "os";
import fs from "fs";
import fetch from "node-fetch";
import open from "open";
import express from "express";
import crypto from "crypto";
import Config from "./config.mjs";
import VueBuild from "./vue_build.mjs";
import {Server} from "./server.mjs";


// ━━━━━━━━━━━━━━━━━━━━━━ Keep access token ━━━━━━━━━━━━━━━━━━━━━━

const tokenFileName = '.persist';
const secureDirectoryPath = path.join(os.homedir(), '.selldone-dev'); // Example: /home/user/.selldone-dev


// Ensure the directory exists and has appropriate permissions
if (!fs.existsSync(secureDirectoryPath)) {
    fs.mkdirSync(secureDirectoryPath, {mode: 0o700}); // Only the owner can access
}
const tokenFilePath = path.join(secureDirectoryPath, tokenFileName);


/**
 * Generate a random string for use in the OAuth2 PKCE flow.
 * @return {string}
 */
function generateCodeVerifier() {
    const randomBuffer = crypto.randomBytes(48);
    return randomBuffer.toString('base64')
        .replace(/\+/g, '-') // Replace + with -
        .replace(/\//g, '_') // Replace / with _
        .replace(/=/g, '')  // Remove = as it's not URL safe
        .slice(0, 64);      // Trim to 64 characters
}


const app = express();
const state = generateCodeVerifier();


export class Authentication {

    static ACCESS_TOKEN = null;
    static USER = null;


    /**
     * Save access token.
     * @param {string|null} token
     */
    static setAccessToken(token) {
        if (!token) token = '';
        this.ACCESS_TOKEN = token;
        fs.writeFileSync(tokenFilePath, token, {encoding: 'utf8', mode: 0o600});
    }

    /**
     * Get access token.
     * @return {null|string}
     */
    static getAccessToken() {
        if (fs.existsSync(tokenFilePath)) {
            return this.ACCESS_TOKEN= fs.readFileSync(tokenFilePath, 'utf8');
        }
        return null;
    }


// ━━━━━━━━━━━━━━━━━━━━━━ Authentication ━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Start OAuth2 Authentication Process
     */
    static auth() {

        // Step 1: Start OAuth2 Authentication Process
        console.log('▶  Starting OAuth2 Authentication...');


        // Start a server to listen for the OAuth callback
        app.get('/callback', async (req, res) => {

            server.close();


            const code = req.query.code;

            if (code) {
                try {
                    const response = await fetch(`${Config.SELLDONE_SERVICE_URL}/oauth/token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({
                            grant_type: 'authorization_code',
                            client_id: Config.CLIENT_ID,
                            redirect_uri: Config.REDIRECT_URI,
                            code: code,
                            // Include the code_verifier if PKCE was used in the authorization request
                            code_verifier: state // We use state as code verified
                        }),
                    });

                    const data = await response.json();

                    if (data.access_token) {
                        console.log('✅  Authentication successful.');
                        Authentication.setAccessToken(data.access_token)
                        res.send('Authentication successful, you can close this window.');
                        await VueBuild.execBuild()
                    } else {
                        console.error('❌  Error getting access token:', data);
                        res.send(data);
                        res.send('Failed to obtain access token.');
                    }
                } catch (error) {
                    console.error('❌  Error:', error);
                    res.send('An error occurred.');
                }
            } else {
                console.error('❌  No code received in the callback.');
                res.send('Authentication failed - no code received.');
            }
        });

        const server = app.listen(Config.LOCAL_AUTH_SERVER_PORT, () => {
            console.log(`▶  Listening for OAuth callback on http://localhost:${Config.LOCAL_AUTH_SERVER_PORT}`);
            // Open the Selldone login page [redirect back to http://localhost:3777/callback]
            open(`${Config.SELLDONE_SERVICE_URL}/developers/login?state=${state}`);
        });

    }



    /**
     * Check 2FA status.
     * @return {Promise<void>}
     */

  static  async  check2FAStatus() {
        console.log('▶  Checking 2FA status...');

        try {
            const data = await Server.GetRequest(Config.SELLDONE_2FA_CHECK_URL);
            if (data.has_2fa) {
                console.log('✅  2FA is enabled.');
            } else {
                console.log('❎  2FA is disabled.');
            }

            if (data.user) {
                this.USER = data.user;
                // Everything is ok!
            } else {
                await this.verify2FACode();// Request user enter 2fa code
            }
        } catch (data) {
            console.error('❌  Error:', data);
            this.logout();
            Authentication.auth(); //Request login again!
        }
    }

    /**
     * Verify 2FA code.
     * @return {Promise<void>}
     */
    static verify2FACode() {

        async function send3FACode(twoFactorCode) {

            const response = await fetch(Config.SELLDONE_2FA_VERIFY_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Authentication.ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    code: twoFactorCode
                })
            });

            const data = await response.json();

            if (response.ok) {

                if (data.success) {
                    console.log('✅ 2FA verification successful.');
                    Authentication.USER = data.user;

                } else {
                    console.log('⚠️ 2FA verification failed.');
                    throw '🛑 2FA verification failed.';
                }
            } else {
                console.error('❌  Error:', data);
                throw `🛑 Failed to verify 2FA code. Status Code: ${response.status}`;
            }
        }

        // Create readline interface for user input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the 6-digit 2FA code: ', async (twoFactorCode) => {
            // Ensure the code is 6 digits
            if (twoFactorCode.length === 6 && /^\d+$/.test(twoFactorCode)) {
                await send3FACode(twoFactorCode);
            } else {
                console.error('❌  Invalid code. Please enter a 6-digit number.');
                rl.close();
            }
        });


    }



    /**
     * Logout user.
     * @return {boolean}
     */
    static logout() {
        this.USER = null;
        Authentication.setAccessToken(null);
        return true;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━

    static IsPremium(){
        return !!Authentication.USER?.premium
    }
}

