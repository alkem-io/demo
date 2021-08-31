import { sampleData } from '../actions/sample-data';

sampleData().catch(error =>
  console.error(error)
);
