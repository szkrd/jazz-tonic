Place exported xlsx into the `data` folder as `main.xlsx`.

A quick intro to node/npm/vscdoe/git (in Hungarian) can be found in the [docs dir](./docs/README.md).

## scripts

- `npm run helloWorld` = runs the hello world script, to test your node setup
- `npm run test` = run tests
- `npm run parseXlsx` = processes **main.xlsx** and outputs json data files (don't forget to place the xlsx into the data dir)

## scraper

The scraper is unfinished.

1. to use it first copy the `config.template.json` to `config.json` and set the parameters there
2. it can log in, manage the session, open the event cards' page and collect the event urls
3. it is rather brittle and crawling the event pages themselves would pose further problems
