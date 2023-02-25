const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const infoBuffer = {};

const log = {
  infoBuffer: (msg, data) => {
    console.log(msg);
    Object.assign(infoBuffer, data);
  },
  getInfoBuffer: () => infoBuffer,
  dumpInfoBuffer: () => {
    const config = require('./config'); // we must include this "lazily"
    const fileName = path.join(config.dataDir, 'problems.json');
    fs.writeFileSync(fileName, JSON.stringify(infoBuffer, null, 2), 'utf-8');
    console.info(`Saved additional details to "${fileName}".`);
  },
  banner: (msg) =>
    console.info(
      chalk.magenta(
        [
          '┌' + ''.padStart(msg.length + 2, '─') + '┐',
          `│ ${String(msg).toLocaleUpperCase()} │ `,
          '└' + ''.padStart(msg.length + 2, '─') + '┘',
        ].join('\n')
      )
    ),
  error: (msg, err) => console.log(chalk.red(msg), err ? '\n' + err : ''),
  die: async (msg, code = 1, err = null) => {
    console.log(chalk.red(msg));
    if (err) console.log(chalk.gray(err));
    process.exit(code ?? 1);
  },
  info: (msg) => console.log(msg),
  debug: (msg) => console.log(msg),
  success: (msg) => console.log(chalk.cyan(msg)),
  warning: (msg) => console.log(chalk.yellow(msg)),
};

module.exports = log;
