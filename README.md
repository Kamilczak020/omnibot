# Omnibot
[![Maintainability](https://api.codeclimate.com/v1/badges/0fcafb95938e9b246ab1/maintainability)](https://codeclimate.com/github/Kamilczak020/omnibot/maintainability)
[![pipeline status](https://gitlab.com/Kamilczak020/omnibot/badges/master/pipeline.svg)](https://gitlab.com/Kamilczak020/omnibot/commits/master)
[![coverage report](https://gitlab.com/Kamilczak020/omnibot/badges/master/coverage.svg)](https://gitlab.com/Kamilczak020/omnibot/commits/master)

###### The official Alaska Server bot, for all things utility.

This bot utilizes the following pattern for handling incomming messages and commands:

1. A discord listener captures a message, parses it and puts it in the incomming queue.
2. Messages from the incomming queue are ran through filters, then parsers.
If it gets captured by a parser, it gets saved in the database, then the parser does its job and produces a command,
which gets put in the command queue.
3. Commands from the queue get ran through handlers. If a handler captures it, it executes appropriate work and,
in a case where it is applicable, creates a message and puts it in the outgoing queue.
4. Messages in the outgoing queue are sent by the bot to the server.


## How to develop

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
DISCORD_TOKEN=your discord bot token
DB_NAME=database name
DB_HOST=database host (without port, assuming default 5432)
DB_USERNAME=database username
DB_PASSWORD=database password
OXFORD_APP_ID=oxford API app id
OXFORD_APP_KEY=oxford API app key
```

## Docker

This project features Docker containerization, if one would like to make use of it.
For local deployments, it is best that you use the included `docker-compose.yml` file, which will attach the `.env` file for you.
All you need to run is:
```
docker-compose build
docker-compose up
```

For non-local deployments, do not forget to pass the environiment variables to the container!

## Kubernetes

This project also features a Kubernetes deployment manifest. If this is your desired path of deployment, I suggest you look through `deployment.yaml`
and adjust the values accordingly to match your cluster.

## Roadmap
- [x] Implement base bot skeleton
- [x] Attach CodeClimate
- [x] Implement handlers and parsers for bot functions and commands
- [x] Write tests
- [x] Introduce a CI pipeline
- [x] Move config secrets to .env file for development
- [x] Move build into a docker container
- [x] Introduce a CD pipeline
- [x] Implement bad word filter
- [x] Implement role-based command handling
- [x] Introduce a remindme command
- [x] Implement custom command handling and execution
- [x] Implement a math command
- [ ] Refactor how command data is passed between parsers / handlers

## Current list of commands
1. **```!announce <type> <message>```** -- [Staff only] Posts an announcement of the given type (regular / twitch) with a given message in an appropriate channel.
2. **```!addcommand <name> <data>```** -- [Staff only] Adds a custom command of a given name.
3. **```!addreminder <time query> "<message>"```** -- Adds a personal reminder. The time query is a very flexible parameter, and does lexical parsing. Ex. !addreminder next Friday at 4:30pm "go to the dentist". Time is calculated in UTC.
4. **```!ban @username```** -- [Staff only] Bans a given user from the server.
5. **```!choose option1 option2 "multi word option" option4```** -- Given multiple options to choose from, one is returned at random. All have equal probablity.
6. **```!confess <message>```** -- Submits an anonymous confession, that supports full discord formatting. This can be only used in DMs with the bot. Sending confessions is throttled to one per 2 minutes.
7. **```!customcommands```** -- [Staff only] Sends a list of custom commands in DM.
8. **```!delete <channel name> <count>```** -- [Staff only] Deletes the last x messages from given channel.
9. **```!define [word-class] query```** -- Returns a dictionary definition for a given query. Word class (noun, verb, etc.) is an optional parameter and is used to narrow down the results.
10. **```!kick @username```** -- [Staff only] Kicks a given user from the server.
11. **```!listcommands```** -- Sends a list of available bot commands in DM.
12. **```!listwarnings @username```** -- [Staff only] Sends a list of warnings that have been submitted for a given user in DM.
13. **```!listwarnings @username```** -- [Staff only] Sends a list of warnings that have been submitted for a given user in DM.
14. **```!math <expression>```** -- Evaluates a given expression.
15. **```!mute @username```** -- [Staff only] Mutes a given user (if in voice chat).
16. **```!listreminders```** -- Sends a list of personal reminders in DM.
17. **```!removecommand <name>```** -- [Staff only] Removes a command of a given name.
19. **```!removereminder <index>```** -- Removes a reminder with a given index. You can see them by using !listreminders.
19. **```!restart```** -- [Staff only] Forces the bot to stop and restart itself.
20. **```!stats```** -- [Staff only] Displays server statistics.
21. **```!unmute @username```** -- [Staff only] Unmutes a given user (if in voice chat).
22. **```!warn @username reason```** -- [Staff only] Submits a warning for a user with a given reason. The user is sent the warning in DM.

## How to contribute
If you would like to contribute to this project, please do so by submitting PRs to the gitlab repository:
https://gitlab.com/Kamilczak020/omnibot

They will undergo a review process, pass an automatic pipeline, and if all is good, will be then merged into the master branch.