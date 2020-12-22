import * as cp from 'child_process';
import * as fs from 'fs';

cp.execSync(
  `nx run-many --with-deps --target build --prod --projects common,nestjs,angular,typeorm,testing`,
  { stdio: 'inherit' }
);

const dir = './node_modules/@kirtan';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

cp.execSync('cp -r dist/libs/* node_modules/@kirtan', { stdio: 'inherit' });
