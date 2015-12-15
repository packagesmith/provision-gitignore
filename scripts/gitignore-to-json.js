/* eslint-disable no-console, no-process-exit, id-match, camelcase */
import fetch from 'node-fetch';
import { resolve as resolvePath } from 'path';
import { writeFile } from 'fs-promise';
import ensureDirectory from 'mkdirp-promise';
const goodStatusCap = 399;
const libFolder = resolvePath(__dirname, '..', 'lib');
const ignoresJsonFile = resolvePath(libFolder, 'ignores.json');
export async function gitignoreToJson() {
  ensureDirectory(libFolder);
  console.log('Downloading gitignore templates...');
  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'PackagesmithGitignoreFetchBot',
    },
  };
  if (process.env.GH_TOKEN) {
    console.log('Using GH_TOKEN as Authorization');
    options.headers.Authorization = `token ${process.env.GH_TOKEN}`;
  }
  const mainIgnores = await fetch('https://api.github.com/repos/github/gitignore/contents', options);
  const globalIgnores = await fetch('https://api.github.com/repos/github/gitignore/contents/Global', options);
  if (mainIgnores.status > goodStatusCap || globalIgnores.status > goodStatusCap) {
    console.log(await mainIgnores.text(), await globalIgnores.text());
    throw new Error('bad response');
  }
  const allIgnores = await Promise.all(
    (await mainIgnores.json())
      .concat(await globalIgnores.json())
      .filter(({ name, download_url }) => download_url && /.gitignore$/.test(name))
      .map(async function fetchIgnoreFile({ name, download_url }) {
        console.log(`Fetching ${download_url}`);
        return {
          name: name.replace(/.gitignore$/, '').toLowerCase(),
          contents: (await (await fetch(download_url)).text()).split('\n')
            .filter((line) => !/^#|^$/.test(line)),
        };
      })
  );
  console.log('Determining JSON contents');
  const ignoresJson = allIgnores
    .sort((left, right) => left.name.localeCompare(right.name))
    .reduce((json, { name, contents }) => {
      json[name] = contents;
      return json;
    }, {});
  console.log('Writing json file');
  await writeFile(ignoresJsonFile, JSON.stringify(ignoresJson, null, 2), 'utf8');
  console.log(`${ignoresJsonFile} written`);
}

if (require.main === module) {
  gitignoreToJson().catch((error) => {
    console.error(error.stack || error);
    process.exit(1);
  });
}
