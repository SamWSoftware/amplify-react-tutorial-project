import React from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify, { API, graphqlOperation, Storage, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listSongs } from './graphql/queries';
import { updateSong, createSong } from './graphql/mutations';

import { useState } from 'react';
import { useEffect } from 'react';

import ReactPlayer from 'react-player';

import { v4 as uuid } from 'uuid';

import { Paper, IconButton, TextField, Button } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PauseIcon from '@material-ui/icons/Pause';
import AddIcon from '@material-ui/icons/Add';
import PublishIcon from '@material-ui/icons/Publish';
import SongList from './components/SongList';

import SignIn from './components/SignIn';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

Amplify.configure(awsconfig);

function App() {
    const [loggedIn, setLoggedIn] = useState(false);

    const assessLoggedInState = () => {
        Auth.currentAuthenticatedUser()
            .then(sess => {
                console.log('logged in');
                setLoggedIn(true);
            })
            .catch(() => {
                console.log('not logged in');
                setLoggedIn(false);
            });
    };
    useEffect(() => {
        assessLoggedInState();
    }, []);

    const signOut = async () => {
        try {
            await Auth.signOut();
            setLoggedIn(false);
        } catch (error) {
            console.log('error signing out: ', error);
        }
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    {loggedIn ? (
                        <Button onClick={signOut} variant="contained" color="primary">
                            Log Out
                        </Button>
                    ) : (
                        <Link to="/signin">
                            <Button variant="contained" color="primary">
                                Log In
                            </Button>
                        </Link>
                    )}
                    <h2>My App Content</h2>
                </header>
                <Route exact path="/">
                    <SongList />
                </Route>
                <Route path="/signin">
                    <SignIn onSignin={assessLoggedInState} />
                </Route>
            </div>
        </Router>
    );
}

export default App;

const AddSong = ({ onUpload }) => {
    const [songData, setSongData] = useState({});
    const [mp3Data, setMp3Data] = useState();

    const uploadSong = async () => {
        //Upload the song
        console.log('songData', songData);
        const { title, description, owner } = songData;

        const { key } = await Storage.put(`${uuid()}.mp3`, mp3Data, { contentType: 'audio/mp3' });

        const createSongInput = {
            id: uuid(),
            title,
            description,
            owner,
            filePath: key,
            like: 0,
        };
        await API.graphql(graphqlOperation(createSong, { input: createSongInput }));
        onUpload();
    };

    return (
        <div className="newSong">
            <TextField
                label="Title"
                value={songData.title}
                onChange={e => setSongData({ ...songData, title: e.target.value })}
            />
            <TextField
                label="Artist"
                value={songData.owner}
                onChange={e => setSongData({ ...songData, owner: e.target.value })}
            />
            <TextField
                label="Description"
                value={songData.description}
                onChange={e => setSongData({ ...songData, description: e.target.value })}
            />
            <input type="file" accept="audio/mp3" onChange={e => setMp3Data(e.target.files[0])} />
            <IconButton onClick={uploadSong}>
                <PublishIcon />
            </IconButton>
        </div>
    );
};
