const chalk = require('chalk');

const log = {
  error: (msg, err) => console.log(chalk.red(msg), err ? '\n' + err : ''),
  die: async (msg, code = 1, err = null) => {
    console.log(chalk.red(msg));
    if (err) console.log(chalk.gray(err));
    process.exit(code ?? 1);
  },
  info: (msg) => console.log(msg),
  success: (msg) => console.log(chalk.cyan(msg)),
  warning: (msg) => console.log(chalk.yellow(msg)),
};

module.exports = log;
