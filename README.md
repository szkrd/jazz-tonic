A quick intro to node/npm/vscode/git (in Hungarian) can be found in the [docs dir](./docs/README.md).

After opening the project, install the dependencies with `npm i` (from the terminal).

## scripts

- `npm run helloWorld` = runs the hello world script, to test your node setup
- `npm run test` = run tests
- `npm run parser` = processes **main.xlsx** and outputs json data files (don't forget to place the xlsx into the data dir)
- `npm run renderer` = processes **main.json** and outputs html and js files (don't forget to run the parser first)
- `npm run renderer:watch` = continually runs the renderer listening for changes in the _hbs_ file
- `npm run serve` = fires up a local server that serves static files from the **/client** directory
- `npm run lint` = checks the code for common problems
- `npm run format` = prettifies the code (in case the vscode extension did not work)

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

### renderer

- uses **templates/index.hbs** which is a [handlebars](https://handlebarsjs.com/guide/#what-is-handlebars) template
- run it with `npm run renderer` (or `node scripts/renderer`), for dev/watch mode `npm run renderer:watch`
- run the dummy client server with `npm run serve` and then open the page in the browser
- output of the html file is in **client/index.html**
- a dump of the used template data can be found in the **templateData.dump**, next to the hbs file
  (which is based on the **main.json** created by the parser)

### scraper

The scraper is unfinished.

1. to use it first copy the `config.template.json` to `config.json` and set the parameters there
2. it can log in, manage the session, open the event cards' page and collect the event urls
3. it is rather brittle and crawling the event pages themselves would pose further problems

### frontend

1. frontend is purely static
2. old dates are not displayed; for debugging you can use the location search part: `http://localhost:3000/?currentDate=2023-02-15`
