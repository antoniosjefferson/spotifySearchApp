import "./App.css";
import { Button, Card, FormControl, Row, Container, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import moment from "moment";

// NOTE: ADD DOTENV BELOW BEFORE PUSHING!

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState(""); // takes search input and setSearchInput changes it.
  const [accessToken, setAccessToken] = useState(""); // used to store access token from spotify api request. First fetch
  const [albums, setAlbums] = useState([]); // used to store data from 2nd fetch request (returnedAlbums)

  // Note: Good for having function run once. Setup for API call ONCE! Dont want to reconnect to API and make calls every time it's refreshed.

  useEffect(() => {
    // API Access Token
    var authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET,
    };
    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  // Search. Function will have multiple fetch statements. We want each statement to wait its turn. To use await you must use async.

  async function search() {
    // console.log("Search for " + searchInput); // testing input

    // Get request using search to get Artist ID
    var searchParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
    var artistID = await fetch("https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist", searchParameters)
      .then((response) => response.json())
      .then((data) => {
        return data.artists.items[0].id;
      });
    // console.log("Artist ID is " + artistID);

    // Get request with Artist ID grab all albums from that artist

    var returnedAlbums = await fetch(
      "https://api.spotify.com/v1/artists/" + artistID + "/albums?include_groups=album&market=US&limit=50",
      searchParameters
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setAlbums(data.items);
      });

    // var returnedSongs = await fetch("https://api.spotify.com/v1/artists/", searchParameters);

    // Display those albums to the user
  }
  // console.log(albums);

  // Date conversion example
  let date_string = "01-01-2001";
  let output = new Date(date_string);

  console.log(output.toString());

  const e = <h1> Welcome to Spotify Search App</h1>;

  return (
    <div className="App">
      <header className="App-header">
        {e}
        <Container>
          <InputGroup className="mb-2" size="lg">
            <FormControl
              placeholder="Search For Artist"
              type="input"
              // why is this still working if its deprecated?
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  search();
                }
              }}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Button variant="success" onClick={search}>
              Search
            </Button>
          </InputGroup>
        </Container>
        <Container>
          <Row className="mx-2 row row-cols-4">
            {albums.map((album, i) => {
              const date = new Date(album.release_date);
              console.log(date);

              return (
                <Card className="cardImage" key={album.id}>
                  <Card.Img imagesvariant="top" src={album.images[0].url} />
                  <Card.Body>
                    <Card.Title className="text-success"> Released on {album.release_date}</Card.Title>
                    <Card.Text className="text-success">{album.artists[0].name}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <small className="text-success">{album.name}</small>
                  </Card.Footer>
                </Card>
              );
            })}
          </Row>
        </Container>
      </header>
    </div>
  );
}

export default App;
