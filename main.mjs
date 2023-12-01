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

// Define your commands using yargs
yargs(hideBin(process.argv))
    .command('deploy', 'Build and deploy your VUe storefront project [Layout].', async () => {
        // Dynamically import the xxx.mjs module and execute it
        const deploy = await import('./deploy.mjs');
        await deploy.default(); // Assuming the xxx.mjs exports a default function

    })
    .demandCommand(1, 'You need at least one command before moving on!')
    .parse();

