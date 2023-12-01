#!/usr/bin/env node

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


import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import inquirer from 'inquirer';
import Config from "./src/config.mjs";
import {Authentication} from "./src/authentication.mjs";


const COMMAND_DEPLOY = 'deploy';
const COMMAND_LOGOUT = 'logout';
const COMMAND_EXIT = 'exit';

async function promptForCommand() {
    const response = await inquirer.prompt([
        {
            type: 'list',
            name: 'commandToRun',
            message: 'Please select a command:',
            choices: [
                {value: COMMAND_DEPLOY, name: "Deploy | Build and upload your Vue storefront layout to selldone."},
                ...(Authentication.getAccessToken() ? [{
                    value: COMMAND_LOGOUT,
                    name: "Logout | Remove access token from your computer."
                }] : []),
                {value: COMMAND_EXIT, name: "Exit"}],
            default: COMMAND_DEPLOY
        }
    ]);

    console.log(`You selected: ${response.commandToRun}`);
    return response.commandToRun;
}

async function runCommand(command) {
    switch (command) {
        case COMMAND_DEPLOY:
            const deploy = await import('./deploy.mjs');
            await deploy.default();
            break;
        case COMMAND_LOGOUT:
            Authentication.logout()
            process.exit(0);
            break;
        case COMMAND_EXIT:
            process.exit(0);
            break;
        // Handle other commands here
        default:
            console.log(`Command '${command}' is not recognized.`);
            break;
    }
}

console.log("");
console.log("▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆");
console.log("🪅  Selldone® Business OS™ Storefront Project");
console.log("The #1 operating system for fast-growing companies.");
console.log("Visit: https://selldone.com");
console.log("▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆");
console.log("");

// Set up yargs
const argv = yargs(hideBin(process.argv))
    .command('deploy', 'Build and deploy your Vue storefront project [Layout].', async () => {
        await runCommand('deploy');
    })
    .parse();

let DEBUG = argv.debug;
if (DEBUG) {
    Config.InitDebugMode();
    console.log("DEBUG MODE ENABLED!\n");
}


// If no command provided, show the prompt
if (argv._ && !argv._.length) {
    const commandToRun = await promptForCommand();
    await runCommand(commandToRun);
}
