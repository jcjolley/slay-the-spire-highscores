import { setupServer } from "./server";
const program = require('commander');

program
  .version('1.0.0')
  .option('-p, --port <n>', 'Specify port to run on', parseInt)
  .parse(process.argv)

const app = setupServer();
const port = program.port || 3002;
app.listen(port);
console.log(`Server started on port ${port}`);