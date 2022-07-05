import { DataFactory } from 'rdf-data-factory';
import { Readable } from 'stream';
import * as N3 from 'n3';
import type * as RDF from '@rdfjs/types';

export function resolvePath(parent: RDF.Term, store: N3.Store, df: DataFactory): RDF.NamedNode[] {
  const path: RDF.NamedNode[] = [];
  let subjects = store.getSubjects(null, parent, null);

  while (subjects.length > 0) {
    const parentSubject = subjects[0];
    const pathObjects = store.getObjects(parentSubject, df.namedNode('https://www.w3.org/ns/shacl#path'), null);

    if (pathObjects.length > 0) {
      // We assume that object of triple with sh:path predicate can not contain blank nodes
      path.push(<RDF.NamedNode>pathObjects[0]);
    }

    subjects = store.getSubjects(null, parentSubject, null);
  }

  return path;
}

export function createStore(stream: Readable): Promise<N3.Store> {
  return new Promise((resolve, reject) => {
    const store = new N3.Store();

    stream.on('data', (quad) => {
      store.addQuad(quad);
    });

    stream.on('error', (error) => reject(error));
    stream.on('end', () => resolve(store));
  })
}
