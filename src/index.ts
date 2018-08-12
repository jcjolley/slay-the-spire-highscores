import { setupServer } from "./server";
const program = require('commander');
import fs = require('fs');
import https = require('https');

program
  .version('1.0.0')
  .option('-p, --port <n>', 'Specify port to run on', parseInt)
  .parse(process.argv)


const options = {
  cert: fs.readFileSync('/etc/letsencrypt/live/spire.jcjolley.com/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/spire.jcjolley.com/privkey.pem'),
}

const app = setupServer();
const port = program.port || 3002;
app.listen(port);
https.createServer(options, app).listen(8443);
console.log(`Server started on port ${port}`);