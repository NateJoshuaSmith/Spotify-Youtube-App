/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require("express"); // Express web server framework
var request = require("request"); // "Request" library
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");
const { response } = require("express");

var client_id = "164dceed83f04c21b21d198d94443ba9"; // Your client id
var client_secret = "1543f6f5bd4c4b3f8dcd751a6ac18467"; // Your secret
var redirect_uri = "http://localhost:5500/callback"; // Your redirect uri
const refresh_token =
  "AQCXaf7IVmcqaiw5A4C2cCRVzAY0IcpapEyJj1XymzBq3A1rTNkNkqsZkQPXUd0uGW2BCdopa1zFKaOPgBhDG1ER0pczwTc0CN2IfR9XNoWeYa--BQZ-lR9x49cb_ogeEHI";

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = "spotify_auth_state";

var app = express();

app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(express.json())
  .use(cookieParser());

app.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = "user-read-private user-read-email user-modify-playback-state";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };
        // use the access token to access the Spotify Web API
        // request.get(options, function(error, response, body) {
        //   console.log(body);
        // });

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          "/#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

//creating a playlist
//start a playlist
app.post("/create_playlist", function (req, res) {
  var playlistName = req.body.playlistName;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;

      var options = {
        url: "https://api.spotify.com/v1/me",
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };

      //test

      request.get(options, function (error, response, body) {
        //get the user id for the playlist creation
        var userId = body.id;

        var options = {
          url: `https://api.spotify.com/v1/users/${userId}/playlists`,
          headers: { Authorization: "Bearer " + access_token },
          body: {
            name: playlistName,
          },
          json: true,
        };

        request.post(options, function (error, response, body) {
          console.log("success");
        });
      });
    }
  });

  //want to know why this isnt working.

  // fetch('http://localhost:5500/refresh_token?' + new URLSearchParams({
  //   token: refresh_token
  // }), {
  //   method: 'GET',
  //   headers: {
  //               'Content-Type': 'application/json',
  //               'Accept': 'application/json'
  //       },
  // })
  // .then((response) => response.json());

  // fetch('/refresh_token' + new URLSearchParams({
  //   foo: 'value',
  //   bar: 2,)}, {
  //   method: 'GET',
  //   headers: {
  //           'Content-Type': 'application/json',
  //           'Accept': 'application/json'
  //   },
  // })
  // .then((response) => response.json())
  // .then((data) => console.log(data));
});

app.post("/search_track", function (req, res) {
  var trackName = req.body.trackName;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;

      var options = {
        url: `https://api.spotify.com/v1/search?q=${trackName}&type=track`,
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };

      request.get(options, function (error, response, body) {
        var trackURI = body.tracks.items[0].uri;

        var playOptions = {
          url: `https://api.spotify.com/v1/me/player/play`,
          headers: { Authorization: "Bearer " + access_token },
          body: {
            uris: [trackURI],
          },
          json: true,
        };

        request.put(playOptions, function (error, response, body) {
          console.log(body);
        });
        console.log(body);
      });
    }
  });
});

app.get("/refresh_token", function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

console.log("Listening on 5500");
app.listen(5500);
