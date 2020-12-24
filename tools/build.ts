import * as cp from 'child_process';
import * as fs from 'fs';

cp.execSync(
  `nx run-many --with-deps --target build --prod --projects common,nestjs,angular,typeorm,testing`,
  { stdio: 'inherit' }
);

cp.exec('cd dist/libs/common && npm pack');
cp.exec('cd dist/libs/nestjs && npm pack');
cp.exec('cd dist/libs/angular && npm pack');
cp.exec('cd dist/libs/typeorm && npm pack');
cp.exec('cd dist/libs/testing && npm pack');
