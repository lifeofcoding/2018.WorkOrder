//   todo:

"use strict";

const FS = require('fs');
const DATASTORE = require('nedb');
const DB = new DATASTORE({filename: 'data/log_db.json', autoload: true});

this.data = [];

class DataHandler {
    constructor() {

    }

    static renderDom(path, contentType, callback, encoding) {
        FS.readFile(path, encoding ? encoding : 'utf-8', (error, string) => {
            callback(error, string, contentType);
        });
    }

    static handleZipData(callback) {
        console.log(`Handling zip data`);
        const FILE_PATH = 'data/ZipCodeDB.csv';
        FS.readFile(FILE_PATH, 'utf8', (err, file) => {
            const COLUMNS = 3;
            let tempArray, finalData = [];
            tempArray = file.split(/\r?\n/); //remove newlines
            for (let i = 0; i < tempArray.length; i++) {
                finalData[i] = tempArray[i].split(/,/).slice(0, COLUMNS);
            }
            callback(JSON.stringify(finalData));
        });
    }

    static handlePassword(password, callback) {
        const PASSWORD = '1234';
        if (password === PASSWORD) {
            callback('true');
        } else {
            callback('false');
        }
    }

    static updateData(data) {
        DB.update({ _id: data.id }, {
              building: data.building
            , roomNumber: data.roomNumber
            , priority: data.priority
            , submitter: data.submitter
            , problemDesc: data.problemDesc
            , assigned: data.assigned
            , completed: data.completed
            , status: data.status
            , date: data.date
        }, { upsert: true,
            returnUpdatedDocs: true });
    }

    static addData(data) {
        delete data.id;
        DB.insert(data);
    }

    static queryData(data) {
        DB.findOne({ _id: data.id }, (err, docs) => {
            if (docs === null) {
                this.addData(data);
            } else {
                this.updateData(data);
            }
        });
    }

    static generateInitialData(callback) {
        DB.find({ completed: '0' }, (err, docs) => {
            callback(docs);
        });
    }

    static getCompletedWork(callback) {
        DB.find({ completed: '1' }, (err, docs) => {
            callback(docs);
        });
    }
}

module.exports = DataHandler;