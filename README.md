# Discord Self-Role Bot

A simple Discord bot for managing and applying self-assignable roles.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/IliyaBadri/Discord-self-role
   cd Discord-self-role
   ```

2. Install dependencies using npm:

   ```bash
   npm install
   ```

   This will install the required dependencies listed in `package.json` and generate `package-lock.json`.

## Configuration

Edit the following content to the `config.json` file:

```json
{
    "token": "your-discord-bot-token-here",
    "clientId": "your-client-id-here"
}
```

Replace `"your-discord-bot-token-here"` and `"your-client-id-here"` with your actual Discord bot token and client ID.

## Running the Bot

Run the bot using the following command:

```bash
node .
```

This will start the bot, and it will be ready to respond to commands in your Discord server.

## Usage

1. Invite the bot to your Discord server using the following link:
   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=BOT_PERMISSIONS
   ```

   Replace `YOUR_CLIENT_ID` with your bot's client ID, and `BOT_PERMISSIONS` with the necessary permissions (Administrator is recommended).

2. Set up roles that users can assign to themselves. Users can use (`/role`) and (`remove-role`) commands to assign and remove roles to themselves.

3. You can also customize anything you want from this open-source discord bot.

## Support

If you encounter any issues or have questions, feel free to open an issue on the [GitHub repository](https://github.com/IliyaBadri/Discord-self-role/issues).
