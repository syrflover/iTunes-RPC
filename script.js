const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const moment = require('moment');

const resolvePath = (s) => {
  const a = fs.realpathSync(process.cwd());
  return path.resolve(a, s);
};

const configSampleFile = resolvePath('build/itunes-rpc/.env');

const config = fs.readFileSync(resolvePath('.env.sample'), {
  encoding: 'utf8',
});

fs.writeFile(configSampleFile, config, (error) => {
  if (error) {
    console.error(error);
  }

  exec(
    `tar -cvf ./build/itunes-rpc-${moment().format(
      'YYMMDDHH',
    )}.tar ./build/itunes-rpc`,
    (error) => {
      if (error) {
        console.error(error);
      }
    },
  );
});
