import { sampleData } from '../actions/sample-data';
import { DEFAULT_SERVER_URL } from '../constants';

sampleData('cherrytwist-data-template.ods', DEFAULT_SERVER_URL).catch(error =>
  console.error(error)
);
