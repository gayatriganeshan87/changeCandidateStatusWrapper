var express = require("express"); //requiring express module
var app = express(); //creating express instance
var querystring = require('querystring');
const axios = require('axios');
var cors = require('cors');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const host = '0.0.0.0';
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors())


var data = querystring.stringify({
    grant_type: "client_credentials",
    client_id: "watson-orchestrate",
    client_secret: "ca81109d-312d-4ed3-9cf0-19398e26ea9d"
});

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.put('/changeCandidateInterviewStatus', async (req, res) => {
    try {
        const jwt_token = await axios.post('https://keycloak-edu-keycloak.apps.openshift-01.knowis.cloud/auth/realms/education/protocol/openid-connect/token', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        }
        );
        console.log('jwt_token = ' + jwt_token);

        let jobReqId = req.query.jobReqId;
        let requestCandidateBody = req.body;
        let response;


        console.log('jwt_token.data.access_token : ' + jwt_token.data.access_token);
        console.log('requestCandidateBody : ' + JSON.stringify(requestCandidateBody));

        if(isEmptyObject(requestCandidateBody)){
            console.log('Inside !requestCandidateBody');
            requestCandidateBody = null;
        }


        let config = {
            headers: { 'Authorization': 'Bearer ' + jwt_token.data.access_token , 'content-type' : 'application/json' },
            params: {
                jobReqId: jobReqId
            }
        }

        console.log('config : ' + config);

        response = await axios
            .put('https://education-dev.apps.openshift-01.knowis.cloud/getcandidatesbyjr/api/hello/changeCandStatus', requestCandidateBody, config)

        console.log('Response before sending back = ' + JSON.stringify(res.data));
        res.send(response.data);

    } catch (error) {
        res.send(error.response.data);
        console.log(error);
    }

});


var server = app.listen(PORT, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', 'localhost', port);
  });



