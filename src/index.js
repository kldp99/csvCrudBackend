import express from "express";
import cors from "cors"
import fs from "fs";
import csv from "csv-parser"
import { createObjectCsvWriter } from "csv-writer";

const app = express()

app.use(cors({
    origin: '*',
    methods: [
        "POST", "GET"
    ]
}))

app.use(express.json())
app.use(express.static('public'));
const filePath = 'userInfo.csv';

app.post('/get-file-data', (req, res) => {
    let data = [];
    try {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => res.status(200).send({ data, msg: 'data fetch successfully...!' }));
    } catch (error) {
        res.status(500).send({
            error: 'getting error while fetching data.'
        });
    }
});

app.post('/update-data/:id', (req, res) => {
    const params = req.params.id;
    const newData = req.body;

    let updatedData = [];
    let dataUpdated = false;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.id === params) {
                updatedData.push(newData);
                dataUpdated = true;
            } else {
                updatedData.push(row);
            }
        })
        .on('end', () => {
            if (dataUpdated) {
                const ws = fs.createWriteStream(filePath);
                ws.write('id,name,surName,email,age\n');
                updatedData.forEach((entry) => {
                    ws.write(`${entry.id},${entry.name},${entry.surName},${entry.email},${entry.age}\n`);
                });
                ws.end();
                res.status(200).send({
                    msg: 'Data updated successfully...!'
                });
            } else {
                res.status(404).send({
                    error: 'getting error while updating',
                });
            }
        });
});

app.post('/delete-data/:id', (req, res) => {
    const parmsId = req.params.id;

    let updatedData = [];
    let dataDeleted = false;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.id === parmsId) {
                dataDeleted = true;
            } else {
                updatedData.push(row);
            }
        })
        .on('end', () => {
            if (dataDeleted) {
                const ws = fs.createWriteStream(filePath);
                ws.write('id,name,surName,email,age\n');
                updatedData.forEach((entry) => {
                    ws.write(`${entry.id},${entry.name},${entry.surName},${entry.email},${entry.age}\n`);
                });
                ws.end();
                res.status(200).send({
                    msg: 'Data deleted successfully...!'
                });
            } else {
                res.status(404).send({
                    error: 'Entry not found.',
                });
            }
        });
});

app.post('/add-data', (req, res) => {
    const newData = req.body;
    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'id', title: 'id' },
            { id: 'name', title: 'name' },
            { id: 'surName', title: 'surName' },
            { id: 'email', title: 'email' },
            { id: 'age', title: 'age' }
        ],
        append: true
    });

    csvWriter.writeRecords([newData])
        .then(() => {
            res.status(200).send({
                msg: 'Data added successfully...!'
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send({
                error: 'An error occurred while adding data.'
            });
        });
});

app.listen(4000, () => console.log('listining on 4000'));

