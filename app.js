const morgan = require('morgan')('dev');
const express = require('express');
 const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');
const config = require('./assets/config.json');
const {getResponse} = require('./assets/functions');
const mysql = require('promise-mysql');


mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
}).then((db) => {
    const app = express();
    app.use(morgan);
    app.use(bodyParser.json()); //parse l'application/json
    app.use(bodyParser.urlencoded({extended: true})); //obligatoire pour bien que ce soit interprété
    app.use(config.rootApi + '/api-docs', swaggerUi.serve,swaggerUi.setup(swaggerDocument))

    let Members = require('./assets/classes/members-class')(db, config);
    let members = [];
    Members.getAll()
        .then(res => members = res)
        .catch(err => console.log(err));

    let MembersRouter = express.Router();

    MembersRouter.route('/:id')
        .get(async (req, res) => {
            const memberId = req.params.id;
            let member = await Members.getById(members,  req.params.id);

            res.json(getResponse(member));
        })

        .put(async (req, res) => {
            const memberId = req.params.id;
            const memberName = req.body.name;
            let membersAfterUpdate = await Members.update(members, memberName, memberId);

            res.json(getResponse(membersAfterUpdate));
        })

        .delete( async (req, res) => {
            const memberId = req.params.id;
            let membersAfterDelete = await Members.delete(members, memberId);

            res.json(getResponse(membersAfterDelete));
        });


    MembersRouter.route('/')
        .get( async(req, res) => {
            let nbMax = req.query.max;
            let allMembers = await Members.getAll(nbMax);

            res.json(getResponse(allMembers));
        })

        .post(async (req, res) => {
            let memberName = req.body.name;
            let memberInserted = await Members.insert(members, memberName);

            res.json(getResponse(memberInserted));
        })

    app.use(config.rootApi + '/members', MembersRouter);
    app.listen(config.port, () => {
        console.log('Serveur lancé');
    });

}).catch(err => console.log(err.message));