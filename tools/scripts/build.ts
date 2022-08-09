import * as cp from 'child_process';

cp.execSync(`nx run-many --target build --prod --projects=common,nestjs,angular,mikro-orm,testing`, {
  stdio: 'inherit',
});

cp.exec('cd dist/libs/common && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/nestjs && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/angular && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/mikro-orm && rm -f *.tgz && npm pack');
cp.exec('cd dist/libs/testing && rm -f *.tgz && npm pack');
