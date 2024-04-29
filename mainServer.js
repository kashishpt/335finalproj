const path = require("path");
const express = require('express')
const app = express()
const bodyParser = require("body-parser");
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
require("dotenv").config({ path: path.resolve(__dirname, './.env') })  
const { MONGO_DB_USERNAME, MONGO_DB_PASSWORD, MONGO_DB_NAME, MONGO_COLLECTION } = process.env;
const { MongoClient, ServerApiVersion } = require('mongodb');
const databaseAndCollection = {db: MONGO_DB_NAME, collection: MONGO_COLLECTION};
const uri = `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@cmsc335.oz0af0z.mongodb.net/?retryWrites=true&w=majority&appName=cmsc335`
// mongodb+srv://kashishp:<password>@cmsc335.oz0af0z.mongodb.net/?retryWrites=true&w=majority&appName=cmsc335
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const portNumber = 3000
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", (request, response) => {  
    response.render("index");
});

app.post('/getfact', async (request, response) => {
    const { name } = request.body
    const res = await fetch('https://catfact.ninja/fact')
    const catfact = (await res.json()).fact
    let application = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .insertOne({name: name, catfact: catfact})
    response.render('fact', {...request.body, fact: catfact})
})

app.get('/myfacts', async (request, response) => {
    const { name } = request.query
    const myfacts = await client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find({})
    .toArray()

    console.log(myfacts)

    let facts = "<ul>"
    for (let fact of myfacts.filter(e => e.name == name)) {
        facts +=   `<li>${fact.catfact}</li>`
    }

    facts += "</ul>"

    response.render('myfacts', {facts: facts})


})

app.listen(portNumber);




const httpSuccessStatus = 200;

console.log(`Web server started and running at http://localhost:${portNumber}`);
const prompt = "Stop to shutdown the server: "
process.stdout.write(prompt);
process.stdin.setEncoding("utf8"); /* encoding */
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            client.close()
            process.exit(0);  /* exiting */
        } else {
			/* After invalid command, we cannot type anything else */
			console.log(`Invalid command: ${command}`);
		}
        process.stdout.write(prompt)
        process.stdin.resume();
    }
});