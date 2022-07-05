import rdfDereferencer from 'rdf-dereference';
import { DataFactory } from 'rdf-data-factory';
import type * as RDF from '@rdfjs/types';
import { createStore, resolvePath } from './utils';
import { createWriteStream } from 'fs';
import { string } from 'yargs';

export type Path = RDF.NamedNode[];
export type PathMap = Map<RDF.Term, Path[]>;
export interface ISqlOptions {
  input: string,
  output: string,
  tableName: string,
}

/**
 * Maps every sh:path object to its path within the shape
 * @param input - Path or URL of a SHACL shape
 * @returns a map of named nodes mapped to their paths
 * @info Every named node can have multiple paths. To create property paths, the array should be reversed
 */
export const getPathMap = async (input: string): Promise<PathMap> => {
  const { data } = await rdfDereferencer.dereference(input, { localFiles: true });
  const store = await createStore(data);
  const df = new DataFactory();
  const pathMap: Map<RDF.Term, Path[]> = new Map();

  const shPathQuads = store.getQuads(null, df.namedNode('https://www.w3.org/ns/shacl#path'), null, null);
  shPathQuads.forEach(pathQuad => {
    if (store.countQuads(pathQuad.subject, df.namedNode('https://www.w3.org/ns/shacl#node'), null, null) > 0) {
      return;
    }

    const path = resolvePath(pathQuad.subject, store, df);
    path.unshift(<RDF.NamedNode>pathQuad.object);

    if (!pathMap.has(pathQuad.object)) {
      pathMap.set(pathQuad.object, []);
    }

    const otherPaths = pathMap.get(pathQuad.object)!;
    otherPaths.push(path);
    pathMap.set(pathQuad.object, otherPaths)
  });

  return pathMap;
}

export const toSql = async (options: ISqlOptions): Promise<void> => {
  const pathMap = await getPathMap(options.input);
  const file = createWriteStream(options.output);

  file.write(`CREATE TABLE ${options.tableName} (\n`);

  pathMap.forEach((paths: Path[], term: RDF.Term) => {
    if (paths.length > 0) {
      paths = paths.filter(x => x.length > 0);
    }
    paths.forEach(path => {
      let termPath = '\t"(';

      path = path.reverse();

      path.forEach(part => termPath += `${part.value} `);
      termPath = `${termPath.trim()})",\n`;

      file.write(termPath);
    });
  });

  file.write(');')
  file.end();
}
