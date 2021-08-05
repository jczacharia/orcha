import * as cp from 'child_process';

cp.execSync(
  `nx run-many --with-deps --target build --prod --projects=common,nestjs,angular,typeorm,testing`,
  { stdio: 'inherit' }
);

cp.exec('cd dist/libs/common && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/nestjs && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/angular && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/typeorm && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/testing && rm -f *.tgz && npm pack');
