# Discord Rich Presence for iTunes on macos

- [Preview](#preview)
- [Usage](#usage)
- [Caution](#caution)
- [Require](#require)
- [Remove All Asset](#remove-all-asset)
- [Use launchctl](#use-launchctl)

## Preview

![View Small Profile](https://imgur.com/0ZCMf2k.png)

![View Big Profile](https://imgur.com/35Ro6zw.png)

## Caution

- auto run the iTunes

## Require

- NodeJS >= 10.15.3 (Not Recommend 12)

## Usage

1. create `.env` file

```
USER_TOKEN=YOUR DISCORD TOKEN HERE
APP_CLIENT_ID=YOUR DISCORD APPLICATION CLIENT ID HERE
```

2. `npm install`

3. `npm run build`

4. `npm run start`

## Remove All Asset

just `npm run removeAssets`

## Use launchctl

1. `npm run pkg`

2. `vim itunes-rpc.sh`

```sh
cd $YOUR_ITUNESRPC_DIRECOTRY
./build/itunes-rpc/itunes-rpc
```

3. `chmod +x itunes-rpc.sh`

4. `vim ~/Library/LaunchAgents/local.itunesrpc.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>local.itunesrpc</string>
    <key>ProgramArguments</key>
    <array>
        <string>$YOUR_ITUNESRPC_DIRECOTRY/itunes-rpc.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
```

5. `launchctl load ~/Library/local.itunesrpc.plist`

if you want unload launchctl, input `launchctl unload ~/Library/local.itunesrpc.plist`
