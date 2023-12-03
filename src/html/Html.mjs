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

export class Html {

    static HtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selldone | Business OS</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: lightgray;
            font-size: 24px;
        }

        .message-container {
            background-color: white;
            border-left: 10px solid {{color}};
            padding: 20px;
            max-width: 90vw;
            width: 860px;
            box-sizing: border-box;
        }
    </style>
</head>
<body>
<div class="message-container">
    <h1>Selldone</h1>
    <br>
    {{message}}
</div>
</body>
</html>
`;


    static HtmlOut(message, color) {

        // Replace the placeholder
        return this.HtmlContent
            .replace('{{message}}', message)
            .replace('{{color}}', color ? color : '#1976D2');
    }


}