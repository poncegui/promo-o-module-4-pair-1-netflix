const express = require('express');
const cors = require('cors');
const moviesData = require('./data/movies.json');

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

//Endpoints
server.get('/movies', (req, res) => {
  console.log(req.query);
  const genderFilterParam = req.query.gender;
  const filteredMovies = moviesData
    .filter((movie) => movie.gender.includes(genderFilterParam))
    .sort(function (a, b) {
      if (a.title > b.title) {
        return 1;
      } else if (a.title < b.title) {
        return -1;
      }
      return 0;
    });

  res.json({
    success: true,
    movies: filteredMovies,
  });
});
