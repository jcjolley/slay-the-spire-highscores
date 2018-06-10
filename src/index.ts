import { setupServer } from "./server";
import * as fs from 'fs';
import * as https from 'https';
const program = require('commander');

program
  .version('1.0.0')
  .option('-p, --port <n>', 'Specify port to run on', parseInt)
  .parse(process.argv)

const options = {
  cert: fs.readFileSync('./sslcert/fullchain.pem'),
  key: fs.readFileSync('./sslcert/privkey.pem')
}

const app = setupServer();
const port = program.port || 3002;
app.listen(port);
https.createServer(options, app).listen(4002);
console.log(`Server started on port ${port}`);