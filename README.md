# RLDuelsBot
[![Maintainability](https://api.codeclimate.com/v1/badges/67c0a3ae434c3fb8f0b7/maintainability)](https://codeclimate.com/github/Kamilczak020/RLDuelsBot/maintainability)
[![pipeline status](https://gitlab.com/Kamilczak020/rlduelsbot/badges/master/pipeline.svg)](https://gitlab.com/Kamilczak020/rlduelsbot/commits/master)
[![coverage report](https://gitlab.com/Kamilczak020/rlduelsbot/badges/master/coverage.svg)](https://gitlab.com/Kamilczak020/rlduelsbot/commits/master)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Kamilczak020/RLDuelsBot.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Kamilczak020/RLDuelsBot/alerts/)

###### The official RL Duels Discord Server bot, for all things utility.

This bot utilizes the following pattern for handling incomming messages and commands:

1. A discord listener captures a message, parses it and puts it in the incomming queue.
2. Messages from the incomming queue are ran through filters, then parsers.
If it gets captured by a parser, it gets saved in the database, then the parser does its job and produces a command,
which gets put in the command queue.
3. Commands from the queue get ran through handlers. If a handler captures it, it executes appropriate work and,
in a case where it is applicable, creates a message and puts it in the outgoing queue.
4. Messages in the outgoing queue are sent by the bot to the server.


## How to develop (subject to change in the future)

After cloning the repo, you need to run:
```
yarn
gulp
```

This should install all dependencies and build the bot into the `./build` folder.
You can then start the bot using either:
```
yarn run start
yarn run sync-start
```
The latter will allow you to sync the database before running the bot, in case you have not created it before.
You also have access to 
```
gulp watch
```
which will keep track of all file changes in the source directory and dynamically build the files in the background.

Before you launch your application, you will also need to initialize the database with appropriate tables.
To do that, you can execute the included `init-db.sql` file (Postgres), by running
```
psql -h database_host -U database_username -d database_name -a -f init-db.sql
```

Besides all of that, you also need an `.env` file, that is to be placed in the project root directory.
Env variables required to run the bot are as following:
```
DISCORD_TOKEN="your discord bot token"
DB_NAME="database name"
DB_HOST="database host"
DB_USERNAME="database username"
DB_PASSWORD="database password"
```

## Roadmap
- [x] Implement base bot skeleton
- [x] Attach CodeClimate
- [x] Implement handlers and parsers for bot functions and commands
- [x] Write tests
- [x] Introduce a CI pipeline
- [x] Move config secrets to .env file for development
- [x] Move build into a docker container
- [x] Introduce a CD pipeline
- [ ] Implement bad word filter
- [ ] Implement role-based command handling
- [ ] Implement custom command handling and execution

## How to contribute
IF you choose to contribute to the repository, you can do so by posting issues and sending in PRs, 
which will get reviewed and then accepted / rejected based on code quality and relevance.