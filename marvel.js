const api = require('marvel-api')
const fs = require('fs')
const inquirer = require('inquirer')
const db = require('sqlite')
const program = require('commander')
var marvel

function save() {
    db.open('marvel.db').then(() => {
        return db.run('CREATE TABLE IF NOT EXISTS keys (key) ')
    }).then(() => {
        console.log('> Base de donnée prête')
    }).then(() => {

        db.all('SELECT * FROM keys ORDER BY key DESC').then((keys) => {
            for (let i = 0, l = keys.length; i < l; i++) {
                var key = keys[i]
                console.log(key)
            }
            if (keys.length == 0) {
                write()
            } else {
                connect(keys[0]["key"])
            }

        })

    }).catch((err) => { // Si on a eu des erreurs
        console.error('ERR> ', err)
    })
}

function write() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Veuillez entrer votre clé privé',
            name: 'key',
        }
    ]).then((answers) => {
        console.log(answers)
        console.log(answers["key"])
        return db.run('INSERT INTO keys VALUES (?)', answers["key"])
    })
}

function connect(privateKeyUser) {
    marvel = api.createClient({
        publicKey: '81da4b23404e2ba087d5c9f37d2c396c',
        privateKey: privateKeyUser
    });
    if (program.comics) {
        comics(`${program.comics}`)
    } else if (program.event) {
        event(`${program.event}`)
    } else if (program.saveFs) {
        saveFs(`${program.saveFs}`)
    } else {
        program.help()
    }

}

function comics(name) {
    marvel.characters.findByName(name)
        .then(function (res) {
            console.log('Found character ID', res.data[0].id);
            return marvel.characters.comics(res.data[0].id);
        })
        .then(function (res) {
            console.log('found %s comics of %s total', res.meta.count, res.meta.total);
            for (let i = 0, l = res.data.length; i < l; i++) {
                console.log(res.data[i]["title"]);
            }
        })
        .fail(console.error)
        .done();
}

function event(name) {
    marvel.characters.findByName(name)
        .then(function (res) {
            console.log('Found character ID', res.data[0].id);
            return marvel.characters.events(res.data[0].id);
        })
        .then(function (res) {
            for (let i = 0, l = res.data.length; i < l; i++) {
                console.log(res.data[i]["title"]);

            }
        })
        .fail(console.error)
        .done();
}

/*function description(name) {
 marvel.characters.findByName(name)
 .then(function(res) {
 console.log('Found character ID', res.data[0].id);
 return marvel.characters.events(res.data[0].id);
 })
 .then(function(res) {
 for (let i = 0, l = res.data.length; i < l; i++) {
 console.log(res.data[i].id);
 }
 })
 .fail(console.error)
 .done();
 }*/

// Fonction inutile pour le TP, juste une fonction de test.
function displayEvent(answers) {
    marvel.characters.findByName(answers).then(function (res) {
        marvel.characters.events(res.data[0].id)
            .then(console.log)
            .fail(console.error)
            .done();
    })
}

function saveFs(name) {
    marvel.characters.findByName(name)
        .then(function (res) {
            console.log('Found character ID', res.data[0].id);
            return marvel.characters.find(res.data[0].id);
        })
        .then(function (res) {
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'Veuillez entrer le nom du fichier de sauvegarde',
                    name: 'save',
                }
            ]).then((answers) => {
                fs.writeFile(answers.save + '.txt', res.data[0]["description"], (err) => {
                    if (err) throw err
                    console.log('Fichier écrit')
                })
            })
                .fail(console.error)
                .done();
        })

}

save()


program
    .version('1.0.0')
    .option('-c, --comics [name]', 'Call the Hero\'s Comics')
    .option('-e, --event [name]', 'Call the Hero\'s Event')
    .option('-s, --saveFs [name]', 'Save the Hero\'s description')


program.parse(process.argv)



