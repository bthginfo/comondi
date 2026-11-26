import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const frontendExamples = {
  'material-studio': { name: 'TONWERK', profile: 'portfolio' },
  'night-programme': { name: 'NACHTFUNK', profile: 'services' },
  'field-notes': { name: 'GRATLINIE', profile: 'editorial' },
};

export async function readFrontendExample(source, id) {
  if (typeof id !== 'string' || !Object.hasOwn(frontendExamples, id)) {
    throw new Error('Unbekanntes Frontend-Beispiel. Verfügbar sind ' + Object.keys(frontendExamples).join(', ') + '.');
  }
  const directory = path.join(source, 'examples', 'frontends', id);
  const brief = JSON.parse(await readFile(path.join(directory, 'brief.json'), 'utf8'));
  const { compose } = await import(pathToFileURL(path.join(directory, 'compose.mjs')).href);
  return { directory, brief, compose, profile: frontendExamples[id].profile };
}

export async function installExampleAssets(directory, stage) {
  await copyFile(path.join(directory, 'style.css'), path.join(stage, 'src/styles/project.css'));
  await copyFile(path.join(directory, 'hero-art.tsx'), path.join(stage, 'src/components/site/project-hero-art.tsx'));
  const media = path.join(directory, 'media');
  let files;
  try {
    files = await readdir(media, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  const destination = path.join(stage, 'public/media/example');
  await mkdir(destination, { recursive: true });
  for (const file of files) {
    if (!file.isFile() || !/\.(webp|avif|png|jpe?g)$/i.test(file.name)) {
      throw new Error('Beispielmedien müssen lokale Bilddateien sein: ' + file.name);
    }
    await copyFile(path.join(media, file.name), path.join(destination, file.name));
  }
}
