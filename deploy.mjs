#!/usr/bin/env node

import open from 'open';
import fs from 'fs';
import archiver from 'archiver';
import fetch from 'node-fetch';
import FormData from 'form-data';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import os from 'os';
import {execSync} from 'child_process';
import readline from 'readline';

console.log("▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆");
console.log("🪅  Build Selldone® Business OS™ Storefront Project");
console.log("The #1 operating system for fast-growing companies. ");
console.log("▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆");
console.log("");


// ━━━━━━━━━━━━━━━━━━━━━━ Detect yarn / npm ━━━━━━━━━━━━━━━━━━━━━━
function getPackageManager() {
    const userAgent = process.env.npm_config_user_agent;

    if (userAgent) {
        if (userAgent.startsWith('yarn')) {
            return 'yarn';
        } else if (userAgent.startsWith('npm')) {
            return 'npm';
        }
    }

    // Default or unable to detect
    throw "🛑 Unable to detect package manager. Please use npm or yarn.";
}

const SCRIPT_AGENT = getPackageManager();


// ━━━━━━━━━━━━━━━━━━━━━━ Keep access token ━━━━━━━━━━━━━━━━━━━━━━

const tokenFileName = '.persist';
const secureDirectoryPath = path.join(os.homedir(), '.selldone-dev'); // Example: /home/user/.selldone-dev

// Ensure the directory exists and has appropriate permissions
if (!fs.existsSync(secureDirectoryPath)) {
    fs.mkdirSync(secureDirectoryPath, {mode: 0o700}); // Only the owner can access
}
const tokenFilePath = path.join(secureDirectoryPath, tokenFileName);

/**
 * Save access token.
 * @param {string} token
 */
function setAccessToken(token) {
    if (!token) token = '';
    ACCESS_TOKEN = token;
    fs.writeFileSync(tokenFilePath, token, {encoding: 'utf8', mode: 0o600});
}

/**
 * Get access token.
 * @return {null|string}
 */
function getAccessToken() {
    if (fs.existsSync(tokenFilePath)) {
        return fs.readFileSync(tokenFilePath, 'utf8');
    }
    return null;
}

/**
 * Logout user.
 * @return {boolean}
 */
function logout() {
    USER = null;
    setAccessToken(null);
    return true;
}

// ━━━━━━━━━━━━━━━━━━━━━━ Authentication ━━━━━━━━━━━━━━━━━━━━━━

const SELLDONE_SERVICE_URL = "http://127.0.0.1:9000";
const SELLDONE_API_UPLOAD_URL = "http://api.localhost:9000/developer/layouts/deploy";
const SELLDONE_2FA_CHECK_URL = "http://api.localhost:9000/security/2fa/check";
const SELLDONE_2FA_VERIFY_URL = "http://api.localhost:9000/auth/2fa";
const SELLDONE_API_CHECK_VERSION_URL = "http://api.localhost:9000/developer/layouts/check-version";


const CLIENT_ID = 200;
const LOCAL_AUTH_SERVER_PORT = 3777; // Port for the local server. Do not change!
const REDIRECT_URI = `http://localhost:${LOCAL_AUTH_SERVER_PORT}/callback`;


// Step 1: Start OAuth2 Authentication Process
console.log('▶  Starting OAuth2 Authentication...');

const app = express();
const state = generateCodeVerifier();
let USER = null; // Logged in user

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


let ACCESS_TOKEN = getAccessToken();

if (ACCESS_TOKEN) {
    console.log('✅  You are already authenticated.');
    await execBuild()
} else {
    auth()
}

/**
 * Start OAuth2 Authentication Process
 */
function auth() {
// Start a server to listen for the OAuth callback
    app.get('/callback', async (req, res) => {

        server.close();


        const code = req.query.code;

        if (code) {
            try {
                const response = await fetch(`${SELLDONE_SERVICE_URL}/oauth/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        grant_type: 'authorization_code',
                        client_id: CLIENT_ID,
                        redirect_uri: REDIRECT_URI,
                        code: code,
                        // Include the code_verifier if PKCE was used in the authorization request
                        code_verifier: state // We use state as code verified
                    }),
                });

                const data = await response.json();

                if (data.access_token) {
                    console.log('✅  Authentication successful.');
                    setAccessToken(data.access_token)
                    res.send('Authentication successful, you can close this window.');
                    await execBuild()
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

    const server = app.listen(LOCAL_AUTH_SERVER_PORT, () => {
        console.log(`▶  Listening for OAuth callback on http://localhost:${LOCAL_AUTH_SERVER_PORT}`);
        // Open the Selldone login page [redirect back to http://localhost:3777/callback]
        open(`${SELLDONE_SERVICE_URL}/developers/login?state=${state}`);
    });

}


// ━━━━━━━━━━━━━━━━━━━━━━ Build & Upload to Selldone ━━━━━━━━━━━━━━━━━━━━━━

/**
 * Upload ZIP file to Selldone.
 * @return {Promise<void>}
 */
async function uploadZipFile() {


    console.log('▶  Uploading ZIP file...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('dist.zip'));
    formData.append('manifest', fs.readFileSync('manifest.json', 'utf8'));

    try {
        const response = await fetch(`${SELLDONE_API_UPLOAD_URL}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
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
            console.log(`Please visit: ${SELLDONE_SERVICE_URL}/developer/layouts/${data.deploy?.layout_id}`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        } else {
            console.error('Error:', data);
            throw `🛑 Failed to upload file. Status Code: ${response.status}`;
        }


    } catch (error) {
        console.error('❌  Upload error:', error);
    }


}

/**
 * Create ZIP file of the build output.
 * @return {Promise<void>}
 */
async function makeZipFile() {
    console.log('▶  Creating ZIP file of the build output...');
    const output = fs.createWriteStream('dist.zip');
    const archive = archiver('zip', {
        zlib: {level: 9}
    });

    output.on('close', () => {
        console.log(`✅  Zip file created (${archive.pointer()} total bytes).`);
        // Proceed to upload the file
        uploadZipFile();
    });

    archive.on('error', err => {
        throw err;
    });

    archive.pipe(output);
    archive.directory('dist/', false);
    archive.finalize();
}

/**
 *
 * @param url
 * @return {Promise<unknown>}
 * @constructor
 */
async function GetRequest(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Accept': 'application/json'
        }
    });

    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        throw data;
    }
}

async function PostRequest(url, params) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(params)
    });

    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        throw data;
    }
}

/**
 * Check version in manifest is unique
 * @return {Promise<void>}
 */
async function checkVersion(_package, _version) {
    console.log(`▶  Checking layout version [${_version}] in the manifest...`);

    try {
        const data = await PostRequest(SELLDONE_API_CHECK_VERSION_URL, {package: _package, version: _version});
        if (data.error) {
            console.error('❌  Error:', data.error_msg);
            if (data.layout) console.log(`Please visit: ${SELLDONE_SERVICE_URL}/developer/layouts/${data.layout.id}`);
            process.exit()
        } else {
            console.log('❎  Version is valid!');
        }
    } catch (data) {
        console.error('❌  Error:', data);
        process.exit()

    }
}


/**
 * Check 2FA status.
 * @return {Promise<void>}
 */

async function check2FAStatus() {
    console.log('▶  Checking 2FA status...');

    try {
        const data = await GetRequest(SELLDONE_2FA_CHECK_URL);
        if (data.has_2fa) {
            console.log('✅  2FA is enabled.');
        } else {
            console.log('❎  2FA is disabled.');
        }

        if (data.user) {
            USER = data.user;
            // Everything is ok!
        } else {
            await verify2FACode();// Request user enter 2fa code
        }
    } catch (data) {
        console.error('❌  Error:', data);
        logout();
        auth(); //Request login again!
    }
}


/**
 * Verify 2FA code.
 * @return {Promise<void>}
 */
async function verify2FACode() {

    async function send3FACode(twoFactorCode) {

        const response = await fetch(SELLDONE_2FA_VERIFY_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
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
                USER = data.user;

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
 * Verify with user.
 * @param message
 * @return {Promise<unknown>}
 */
function verifyWithUser(message) {
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

/**
 * Check manifest.json file.
 * @return {Promise<void>}
 */
async function checkManifest() {

    const manifestPath = './manifest.json'; // Path to the manifest.json file
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
            await checkVersion(manifest.package, manifest.version);


            console.log(`✅  Layout name: ${manifest.name} ┃ version: ${manifest.version} ┃ package: ${manifest.package} ┃ support: ${manifest.storefront ? '🛍️ Storefront' : ''} ${manifest.backoffice ? '🏮Backoffice' : ''}`);

            const isVerified = await verifyWithUser(`Is the name "${manifest.name}" and version "${manifest.version}" correct? (yes/no): `);
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
 * Build Vue project.
 * @return {Promise<void>}
 */
async function execBuild() {
    await check2FAStatus()
    if (!USER) return; // User should be logged in

    if (!USER.premium) {
        console.log(`🔐  You are logged in as: ${USER.name} (${USER.email})`);

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`❌   Only premium users can deploy layouts. Please upgrade your account to premium. It costs only $8 per month or $84 per year.`);
        console.log(`Subscribe here: ${SELLDONE_SERVICE_URL}/shuttle/wallet/subscriptions`);
        console.log(`🎈  If you're unable to subscribe as a premium user, simply send us an email once you've completed your layout design. We'll offer free premium badges to the most outstanding designers.`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        process.exit();

    } else {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`🔐  You are logged in as: 🦋 ${USER.name} (${USER.email})`);
        console.log(`You're a premium user. You can deploy layouts for free.`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    }


    await checkManifest()


   // TEST! await makeZipFile();  return;


    try {
        console.log('▶  Building Vue project...');

        const stdout = execSync(`${SCRIPT_AGENT} run build-production`, {encoding: 'utf-8'});
        console.log('Build stdout:', stdout);
        console.log('✅  Vue project built successfully.');

        // Proceed to make zip output
        makeZipFile();
    } catch (error) {
        console.error(`❌  Build error: ${error.message}`);
        if (error.stderr) {
            console.error(`❌  Build stderr: ${error.stderr}`);
        }
    }


}


