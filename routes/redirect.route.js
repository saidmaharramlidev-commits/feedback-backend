import { Router } from "express";

const redirectRouter = Router();

redirectRouter.get("/:username", (req, res) => {
    const { username } = req.params;
    const userAgent = req.headers['user-agent'] || '';

    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);

    const appScheme = `whispame://user/${username}`;
    const playStore = `https://play.google.com/store/apps/details?id=com.saidovery.whispame`;
    const appStore = `https://apps.apple.com/app/whispame/id123456789`; // update when iOS published

    const storeUrl = isIOS ? appStore : playStore;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>@${username} on WhispaMe</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta property="og:title" content="@${username} on WhispaMe" />
            <meta property="og:description" content="Send me an anonymous whispa 👻" />
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    background: #000;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    gap: 16px;
                    padding: 24px;
                    text-align: center;
                }
                .emoji { font-size: 64px; }
                h1 { font-size: 24px; font-weight: 700; }
                p { color: #888; font-size: 15px; }
                .btn {
                    background: #1DB954;
                    color: black;
                    font-weight: 700;
                    padding: 14px 32px;
                    border-radius: 999px;
                    text-decoration: none;
                    font-size: 16px;
                    margin-top: 8px;
                }
            </style>
        </head>
        <body>
            <div class="emoji">💬</div>
            <h1>@${username}</h1>
            <p>Send an anonymous whispa on WhispaMe</p>
            <a class="btn" href="${storeUrl}">Download WhispaMe</a>
            <script>
                // try to open app first
                window.location.href = "${appScheme}";
                // if not installed, page stays visible with download button
            </script>
        </body>
        </html>
    `);
});

export default redirectRouter;