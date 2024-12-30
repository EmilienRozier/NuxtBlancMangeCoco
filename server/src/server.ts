import express from 'express';
import {createServer} from 'http';
import cors from 'cors';
import {setupWebSockets} from './websocket.ts';
import {getUserBySocketId, rooms} from "./utils";
import mongoose from "mongoose";
import os from "os";


const app = express();
const server = createServer(app);

const corsOptions = {
    origin: '*',
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Le serveur marche');
});

app.get('/room', (req, res) => {
  res.send(rooms);
})

app.get('/user/:id', (req, res) => {
    const { id } = req.params;
    res.send(getUserBySocketId(id));
})

export let white_cards: [] = [];
export let blue_cards: [] = [];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connecté!');

        const db = mongoose.connection.db;
        const fetchCollectionContent = async (collectionName) => {
            const collection = db?.collection(collectionName);
            return await collection?.find().toArray();
        };

        white_cards = await fetchCollectionContent('white_cards');
        blue_cards = await fetchCollectionContent('blue_cards');

        mongoose.connection.close();
    })
    .catch(err => console.error('Erreur:', err));

const networkInterfaces = os.networkInterfaces();

setupWebSockets(server);

const PORT = process.env.PORT || 6060;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        interfaces.forEach((iface) => {
            if (!iface.internal) {
                console.log(`- http://${iface.address}:${PORT}`);
            }
        });
    }
});

