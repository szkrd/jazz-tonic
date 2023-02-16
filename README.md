A quick intro to node/npm/vscdoe/git (in Hungarian) can be found in the [docs dir](./docs/README.md).

## usage

1. place exported xlsx into the `data` folder as `main.xlsx`.
2. copy `parserConfig.template.json` to `parserConfig.json` and edit it
3. run the parser that will convert the xlsx to html

## scripts

- `npm run helloWorld` = runs the hello world script, to test your node setup
- `npm run test` = run tests
- `npm run parser` = processes **main.xlsx** and outputs json data files (don't forget to place the xlsx into the data dir)

## data format

1. try to avoid hidden columns, if possible (though the script tries hard to detect them)
2. do NOT hide rows, row indexing and handling is already complicated enough
3. preferred date is `YYYY-MM-DD`, or `M/D/YY` (in the events table)
4. do NOT change the name of existing columns (values in the `A` row)

## scraper

The scraper is unfinished.

1. to use it first copy the `config.template.json` to `config.json` and set the parameters there
2. it can log in, manage the session, open the event cards' page and collect the event urls
3. it is rather brittle and crawling the event pages themselves would pose further problems
