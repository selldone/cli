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

import {execSync} from 'child_process';
import {readdir, stat, writeFile} from 'fs/promises';
import inquirer from 'inquirer';
import Config from "../config.mjs";
import Manifest from "../manifest.mjs";
import {Package} from "../package.mjs";
import os from 'os';

// Function to check if directory is empty
async function isDirectoryEmpty(directory) {
    const files = await readdir(directory);
    return files.length === 0;
}

// Function to update manifest.json
async function updateManifest(packageName, name) {

    // Read the file
    const manifest = Manifest.ReadManifestFile();

    manifest.package = packageName ? packageName : manifest.package;
    manifest.name = name ? name : manifest.name;
    manifest.version = "0.0.1";


    await writeFile(Config.MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

// Main function
export async function run() {
    if (await checkIfFolderExists('storefront')) {
        console.log("❌  The '/storefront' directory is exist in the current directory.");
        process.exit(0)
    }

    console.log(`▶  Start creating new project...`);

    const yarn_npm = await Package.GetPackageManager()

    if (!isGhInstalled()) {
        installGh();
    }
    if (!isGhLoggedIn()) {
        ghLogin();
    } else {
        console.log('Already logged in to GitHub CLI.');
    }

    // Clone the repository and install dependencies
    execSync('gh repo clone selldone/storefront', {stdio: 'inherit'});
    // Change directory to 'storefront'
    process.chdir('./storefront');
    execSync(`${yarn_npm} install`, {stdio: 'inherit'});
    execSync(`${yarn_npm} setup`, {stdio: 'inherit'});

    // Ask user for package and name
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'package',
            message: 'Please enter the unique package name for the Layout. Do not change the package after first publish to Selldone. The name should consist only of lowercase alphanumeric characters and can include dashes (-) or dots (.):',
            validate: function (value) {
                if (value.length < 12 || value.length > 64) {
                    return 'The package must be between 12 and 64 characters.';
                } else if (!/^[a-z0-9\-.]+$/.test(value)) {
                    return 'The package must be lowercase alphanumeric and can contain dashes, or dots.';
                } else {
                    return true;
                }
            }
        },
        {
            type: 'input',
            name: 'name',
            message: 'Enter the name of the Layout:',
            validate: function (value) {
                if (value.length < 8 || value.length > 255) {
                    return 'The name must be between 8 and 255 characters.';
                } else {
                    return true;
                }
            }
        }
    ]);

    // Update manifest.json
    await updateManifest(answers.package, answers.name);

    console.log('✅  Setup completed successfully.');

}


// Function to check if 'gh' is installed
function isGhInstalled() {
    try {
        execSync('gh --version', {stdio: 'ignore'});
        return true;
    } catch (error) {
        return false;
    }
}

// Function to install 'gh'
function installGh() {
    console.log('▶  Installing GitHub CLI...');
    // For Unix-based systems (Linux, macOS)
    // This will vary based on the OS and might require different commands
    const platform = os.platform();
    console.log('▶  Installing GitHub CLI...', platform);

    try {
        if (platform === 'linux') {
            // For Linux: This example uses apt-get, may vary based on the distro
            execSync('sudo apt-get update && sudo apt-get install gh', {stdio: 'inherit'});
        } else if (platform === 'darwin') {
            // For macOS
            execSync('brew install gh', {stdio: 'inherit'});
        } else if (platform === 'win32') {
            // For Windows: This uses winget, Windows' package manager
            execSync('winget install --id GitHub.cli -e --source winget', {stdio: 'inherit'});
        } else {
            console.error('Unsupported platform for automatic installation');
            process.exit(1);
        }

        console.log('ℹ️  Please close the terminal and run the command again.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to install GitHub CLI:', error);
        process.exit(1);
    }
}


// Function to check if the user is logged in to GitHub CLI
function isGhLoggedIn() {
    try {
        // The command 'gh auth status' returns a non-zero exit code if not logged in
        execSync('gh auth status', {stdio: 'pipe'});
        return true;
    } catch {
        return false;
    }
}

// Function to trigger GitHub CLI login process
function ghLogin() {
    console.log('Initiating GitHub CLI login...');
    execSync('gh auth login', {stdio: 'inherit'});
}


async function checkIfFolderExists(folderPath) {
    try {
        const stats = await stat(folderPath);
        return stats.isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT') {
            // The folder does not exist
            return false;
        }
        // Other errors (e.g., permission issues)
        throw error;
    }
}


