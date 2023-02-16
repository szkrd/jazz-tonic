A quick intro to node/npm/vscode/git (in Hungarian) can be found in the [docs dir](./docs/README.md).

## scripts

- `npm run helloWorld` = runs the hello world script, to test your node setup
- `npm run test` = run tests
- `npm run parser` = processes **main.xlsx** and outputs json data files (don't forget to place the xlsx into the data dir)

## online spreadsheet

1. try to avoid hidden columns, if possible (though the script tries hard to detect them)
2. do NOT hide rows, row indexing and handling is already complicated enough
3. preferred date is `YYYY-MM-DD`, or `M/D/YY` (in the events table)
4. do NOT change the name of existing columns (values in the `A` row)

## modules

### parser

1. place **main.xlsx** into data directory
2. create/update **parserConfig.json** (by copying **parserConfig.template.json**)
3. `npm run parser`
4. output: **performers.json**, **places.json**, **events.json** -> **main.json**

Serious errors will break the parser and it will bail out with a non zero exit code.

### scraper

The scraper is unfinished.

1. to use it first copy the `config.template.json` to `config.json` and set the parameters there
2. it can log in, manage the session, open the event cards' page and collect the event urls
3. it is rather brittle and crawling the event pages themselves would pose further problems
