import express from 'express';
import dotenv from 'dotenv';
import { Database } from './database/datebase';
import { Class, Image, Label } from '../types/tables';
import { body_for_search } from '../types/request_body';
import { Instance, Instance_count, Work, Work_count } from '../types/views';


// dotenv
dotenv.config({path:'.dbconfig.env'});
dotenv.config({path: '.server.env'});


// database
const db = new Database({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

},
    './src/backend/database/defination.sql'
);


// express
const app = express();
app.use(express.json());

// API(GET): get all classes
app.get('/classes', async (req, res) => {
    const result: Instance_count[] = await db.getAll<Instance_count>('Instance_counts');
    res.status(200).json(result);
});

// API(GET): get instances of the specified class
app.get('/classes/:c_id', async (req, res) => {
    const result: Instance[] = await db.search<Instance>(
        'Instances', {c_id: parseInt(req.params.c_id)}
    );
    res.status(200).json(result)
});

// API(POST): search classes
app.post('/classes', async (req, res) => {
    const { pattern = {}, columns = ['*']} = req.body as body_for_search<Class>;
    const result: Class[] = await db.search<Class>('Classes', pattern, columns);
    res.status(200).json(result);
});

// API(GET): get all images
app.get('/images', async (req, res) => {
    const result: Image[] = await db.getAll<Image>('Images');
    res.status(200).json(result);
});

// API(GET): get labels of the specified image
app.get('/images/:fileName', async (req, res) => {
    const result: Label[] = await db.search<Label>(
        'Labels', {image: req.params.fileName}
    );
    res.status(200).json(result);
});

// API(POST): search images
app.post('/images', async (req, res) => {
    const { pattern = {}, columns = ['*']} = req.body as body_for_search<Image>;
    const result: Image[] = await db.search<Image>('Images', pattern, columns);
    res.status(200).json(result);
});

// API(GET): get all annotators
app.get('/annotators', async (req, res) => {
    const result: Work_count[] = await db.getAll<Work_count>('Work_counts');
    res.status(200).json(result);
});

// API(GET): get work done by the annotator
app.get('/annotators/:a_id', async (req, res) => {
    const result: Work[] = await db.search<Work>(
        'Work', {a_id: parseInt(req.params.a_id)}
    );
    res.status(200).json(result);
})

// API(GET): get splited dataset
app.get('/dataset/:split', async (req, res) => {

    const validSplit = ['Train', 'Test', 'Prediction'];
    const split = req.params.split;

    if(!validSplit.includes(req.params.split)){
        return res.status(400).json({
            message: `Invalid split ${split}.\n Valid splits: ${validSplit.join(', ')}.`
        });
    }
    const result = await db.search<Image>('Images', {
        split: split as 'Train'|'Test'|'Prediction',
    });
    res.status(200).json(result);
});

// API(GET): clear split
app.get('/dataset/split/clear', async (req, res) => {
    const result = await db.clearSplit();
    res.status(200).json(result);
});

// API(GET): split dataset
app.get('/dataset/split/:test_size', async (req, res) => {
    const test_size = parseFloat(req.params.test_size);
    const result = await db.splitDataset(test_size);

    if (test_size < 0.0 || test_size > 1.0)
        res.status(400).json({"message": "Test size must be between 0.0 and 1.0."});
    else 
        res.status(200).json(result);
})

// server listens to port
app.listen(parseInt(process.env.PORT), () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
})