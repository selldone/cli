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
import {ApiLayoutsList} from "./src/apis/api-layouts-list.mjs";
import './src/console/console-extend.mjs';


const COMMAND_DEPLOY = 'deploy';
const COMMAND_LOGIN = 'login';
const COMMAND_LOGOUT = 'logout';
const COMMAND_SHOW_LAYOUTS = 'show:layouts';
const COMMAND_EXIT = 'exit';

async function promptForCommand() {

    const IS_LOGIN = Authentication.getAccessToken();

    function fix(text){
        const _arr=text.split('|')
  return _arr[0].padEnd(20)+(_arr.length>1?_arr[1]:'')
    }


    const response = await inquirer.prompt([
        {
            type: 'list',
            name: 'commandToRun',
            message: 'Please select an action:',
            choices: [
                {value: COMMAND_DEPLOY, name: fix("Deploy | Build and upload your Vue storefront layout.")},

                ...(IS_LOGIN ?
                    // --------- Login User ---------
                    [

                        {value: COMMAND_SHOW_LAYOUTS, name: fix("Layouts | Show all layouts in your account.")},

                        {
                            value: COMMAND_LOGOUT,
                            name: fix("Logout | Remove access token from your computer.")
                        },


                    ] :
                    // --------- Guest ---------
                    [
                        {value: COMMAND_LOGIN, name: fix("Login | Login to your Selldone account.")}

                    ]),

                {value: COMMAND_EXIT, name: fix("Exit")}
            ],
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
        case COMMAND_LOGIN:
            await Authentication.auth(()=>{
                console.log("🔐  You are logged in as: 🦋 "+Authentication.USER.name+" ("+Authentication.USER.email+")");
                process.exit(0);
            })
            break;
        case COMMAND_SHOW_LAYOUTS:
            await ApiLayoutsList.getLayoutsList()
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
    console.log("🐞  DEBUG MODE ENABLED!\n");
}


// If no command provided, show the prompt
if (argv._ && !argv._.length) {



    const commandToRun = await promptForCommand();
    await runCommand(commandToRun);
}
