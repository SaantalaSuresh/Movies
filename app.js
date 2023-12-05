const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());
const initialization = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is runing");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initialization();
const convertMovieName = (each) => {
  return {
    movieName: each.movie_name,
  };
};
const convertMovieData = (each) => {
  return {
    movieId: each.movie_id,
    directorId: each.director_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  };
};

const convertDirectorData = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesQuery = `SELECT movie_name FROM movie`;
  const moviesData = await db.all(moviesQuery);
  response.send(moviesData.map((each) => convertMovieName(each)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postDataQuery = `INSERT INTO
     movie (director_id,movie_name,lead_actor)
     VALUES('${directorId}','${movieName}','${leadActor}')`;
  await db.run(postDataQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDataQuery = `SELECT * FROM movie WHERE movie_id = '${movieId}'`;
  const movieData = await db.get(movieDataQuery);

  response.send(convertMovieData(movieData));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putQuery = `UPDATE movie SET director_id = '${directorId}',movie_name='${movieName}',lead_actor= '${leadActor}'`;
  await db.run(putQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id = '${movieId}'`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;
  const directorDetailse = await db.all(getDirectorsQuery);
  response.send(directorDetailse.map((each) => convertDirectorData(each)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesIdQuery = `SELECT movie_name FROM movie WHERE director_id = '${directorId}';`;
  const result = await db.all(moviesIdQuery);
  response.send(
    result.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
  //response.send({ movieName: result.movie_name });
  //response.send(result);
});

module.exports = app;
