const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

//Set template middleware
server.set('view engine', 'ejs');

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

//Init and config data base
const db = new Database('./src/db/database.db', {
  verbose: console.log, //log in console all data base queries
});

///STATICS here when finish all server

//Template engine - to get the movies id
//Endpoints
server.get('/movie/:movieId', (req, res) => {
  console.log(req.params.movieId); //Show URL params
  const movieId = req.params.movieId; //movie id that we get by qparams
  const query = db.prepare(`SELECT * FROM movies WHERE id=?`);
  const movie = query.get(movieId); //We pass de id to execute the query
  res.render('pages/movie', movie); //Render the template with the data of query
});

server.post('/sign-up', (req, res) => {
  console.log(req.body);
  const signUpMail = req.body.email;
  const signUpPassword = req.body.password;
  //Check if there's another user using the same mail
  const queryMail = db.prepare(`SELECT * FROM users WHERE email = ?`);
  const foundUserMail = queryMail.get(signUpMail);
  console.log(foundUserMail);
  if (foundUserMail === undefined) {
    const query = db.prepare(
      `INSERT INTO users (email, password) VALUES (?, ?)`
    );
    const newUserId = query.run(signUpMail, signUpPassword);
    res.json({ success: true, userId: newUserId.lastInsertRowid });
  } else {
    res.json({
      success: false,
      errorMessage: 'Usuaria ya existente',
    });
  }
});

server.post('/user/profile', (req, res) => {
  console.log(req.body);
  console.log('userId abajo');
  console.log(req.headers.user_id);
  const emailUpdated = req.body.email;
  const passwordUpdated = req.body.password;
  const nameUpdated = req.body.name;
  const userId = req.headers.user_id;
  const query = db.prepare(
    `UPDATE users SET email = ?, password = ?, name = ? WHERE id = ?`
  );
  const resultUpdate = query.run(
    emailUpdated,
    passwordUpdated,
    nameUpdated,
    userId
  );

  resultUpdate.changes !== 0
    ? res.json({
        success: true,
        message: 'Usario modificado con éxito.',
      })
    : res.json({ success: false, message: 'Usario NO modificado.' });
});

server.get('/user/profile', (req, res) => {
  const userId = req.headers.user_id;
  console.log('userID del get profile', userId);
  const query = db.prepare(`SELECT * FROM users WHERE id = ?`);
  const userProfile = query.get(userId);
  res.json(userProfile);
});

server.get('/user/movies', (req, res) => {
  //prepare query to get the movieIds
  const movieIdsQuery = db.prepare(
    'SELECT movieId FROM rel_movies_users WHERE userId = ?'
  );
  // get the user id
  // const userId = req.header('user-id');
  const userId = req.headers.user_id;
  console.log('userID del moviesss', userId);
  //execute the query
  const movieIds = movieIdsQuery.all(userId); // it returns for example: [{ movieId: 1 }, { movieId: 2 }];

  //Get the '?' separated by ','
  const moviesIdsQuestions = movieIds.map((id) => '?').join(', '); // it returns '?, ?'

  // prepare second query to get all data of the movieIds
  const moviesQuery = db.prepare(
    `SELECT * FROM movies WHERE id IN (${moviesIdsQuestions})`
  );

  // transform the above array of id objects to an array of numbers
  const moviesIdsNumbers = movieIds.map((movie) => movie.movieId); // it returns: [1.0, 2.0]

  //execute the second query
  const movies = moviesQuery.all(moviesIdsNumbers);

  // response to the query
  res.json({
    success: true,
    movies: movies,
  });
});

server.get('/movies', (req, res) => {
  if (req.query.gender) {
    const query = db.prepare(
      `SELECT * FROM movies WHERE gender= ? ORDER BY title DESC`
    );
    const movies = query.all(req.query.gender);
    res.json({
      success: true,
      movies,
    });
  } else {
    const query = db.prepare(`SELECT * FROM movies `);
    const movies = query.all();

    res.json({
      success: true,
      movies,
    });
  }
});

//Endpoint post for login
server.post('/login', (req, res) => {
  console.log(req.body);
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const query = db.prepare(
    `SELECT id FROM users WHERE email = ? AND password = ?`
  );
  const userId = query.get(loginEmail, loginPassword);
  userId //if query returns a user, then it returns its id
    ? res.json({
        success: true,
        userId: userId.id,
      })
    : res.json({
        //Else, it returns an error message
        success: false,
        errorMessage: 'Usuaria/o no encontrada/o',
      });
});

// Static Server
const staticServerPathWeb = './src/public-react'; // Static files
server.use(express.static(staticServerPathWeb));

// Static Server for images
const staticServerPathImages = './src/public-movies-images'; // Static files
server.use(express.static(staticServerPathImages));

// Static Server for css
const staticServerPathCss = './src/public-movies-styles'; // Static files
server.use(express.static(staticServerPathCss));
