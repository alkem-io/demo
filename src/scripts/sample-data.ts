import { sampleData } from '../actions/sample-data';
import { DEFAULT_SERVER_URL } from '../constants';

sampleData().catch(error =>
  console.error(error)
);
