const express = require('express')
const bodyParser= require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const returnJSON = require('./returnJSON')

MongoClient.connect("mongodb://localhost:27017/node_js_tutorial", (err, database) => {
	app.set('view engine', 'ejs')
	app.use(express.static('public'))
	app.use(bodyParser.json())

	if (err) return console.log(err);
	db = database;
	console.log("ok, connected to Mongo, running server");
	app.use(bodyParser.urlencoded({extended: true}));

	app.listen(3000, () => {
		console.log('listening on 3000')
	})

	app.get('/ping', (req,res) => {
		returnJSON(res, {msg: "pong from node live changes"})		
	});

	app.put('/quotes', (req, res) => {
		db.collection('quotes')
		.findOneAndUpdate({name: 'Yoda'}, {
			$set: {
				name: req.body.name,
				quote: req.body.quote
			}
		}, {
			sort: {_id: -1},
			upsert: true
		}, (err, result) => {
			if (err) return res.send(err)
				res.send(result)
		})
	})

	function signUpSuccess(err, user) {
		res.send({msg: 'welcome, young padawan!'})
	}

	app.get('/sign_up', (req, res) => { 
		var email    = req.query.email;
		var password = req.query.password;
		var data = {email};		
		db.collection('users').findOne(data).then( user => { 
				if (user) {
					if (user.password == password) { 
						res.send({msg: "welcome back"})
					} else {
						res.send({msg: "wrong password"})
					}
				} else {
					db.collection('users').findOneAndUpdate({email}, {
						$set: {email, password}
					}, {upsert: true}).then(()=> { 
						res.send({msg: 'welcome, young padawan!'})
					}).catch(error => {
						res.send({msg: "whoops!"});
					});
				}
		});
	}); //end of sign_up 

	app.get('/', (req, res) => {
		db.collection('quotes').find().toArray((err, result) => {
			if (err) return console.log(err)
		res.render('index.ejs', {quotes: result})
		})
	})

	app.post('/quotes', (req, res) => {
		db.collection('quotes').save(req.body, (err, result) => {
			if (err) return console.log(err)
			console.log('saved to database')
			res.redirect('/')
		})
	})

	app.delete('/quotes', (req, res) => {
		db.collection('quotes').findOneAndDelete({name: req.body.name},
			(err, result) => {
				if (err) return res.send(500, err)
					res.send('A darth vadar quote got deleted')
			})
	})

})
