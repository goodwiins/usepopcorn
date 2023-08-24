import { useEffect, useState } from "react";
import StarRating from "./StarRating";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = 'd66e8508';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedID] = useState(null);

  function handleSelectMovie(ID){
    setSelectedID(selectedId=> ID === selectedId ? null : ID);
  }
  function handleCloseMovie()
  {
    setSelectedID(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }




  

 useEffect(function(){
  async function fetchMovie() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${key}&s=${query}`
      );
      if (!res.ok) throw new Error("Response Error: " + res.text());
    
      const data = await res.json();
      if (data.Response === "False") throw new 
      Error("Movie not found");

      setMovies(data.Search);
     
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  if (query.length < 3){
    setMovies([]);
    setError("");
    return;
  }
  fetchMovie();
 },[query])


  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies} />
      </NavBar>

      <Main>
      <Box>
      {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
      {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
      </Box>

        <Box>   
         { 
          selectedId ? <MovieDetails selectedID={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched}
          watched={watched}/> : (
            <>
             <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
            </>
          )
        }
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}


function MovieDetails({selectedID, onCloseMovie,onAddWatched, watched}) {
  const [movie, setMovie] = useState({}); 
  const [userRating, setUserRating] = useState(''); 
  const [isLoading, setLoading] = useState(false);
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedID);
  const watchedUserRating =(watched.find((movie) => movie.imdbID === selectedID) || {}).userRating;
  console.log(isWatched);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

    function handleAdd() {
      const newWatchedMovie = {
        imdbID: selectedID,
        title,
        year,
        poster,
        imdbRating: Number(imdbRating),
        runtime: Number(runtime.split(" ").at(0)),
        userRating,
      }
    
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }


  useEffect(function(){
    async function getMovieDetails(){
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${key}&i=${selectedID}`
      );
      const data = await res.json();
 
      setMovie(data)
      setLoading(false);
    }
    getMovieDetails();
  },[selectedID]);

  
  return (<div className="details">
         <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              
            {
    !isWatched ? (<> 
     <StarRating
        maxRating={10}
        size={24}
        onSetRating={setUserRating}
      />
      {userRating > 0 && (<button className="btn-add" onClick={handleAdd}>
          + Add to list
        </button> 
      )}  {" "}
  
    </>):(<p> you have watched</p>)}
                

            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
          {selectedID}
          </div>)
}

function ErrorMessage({message}){
  return (
    <p className="error">
    <span >🚨</span> {message}
    </p>
  )
}


function Loader(){
  return (
   <p className="loader">loading...</p>
      )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({query, setQuery}) { 

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}



function MovieList({ movies , onSelectMovie}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
      ))}
    </ul>
  );
}

function Movie({ movie , onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}


/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/