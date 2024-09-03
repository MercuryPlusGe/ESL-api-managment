const https = require('https');

// To get Public key

function makeGetRequest(url, callback) {

    const requestCallback = res => {

        let data = [];

        res.on('data', chunk => data.push(chunk));

        res.on(

            'end', () => {

                const response_data = JSON.parse(Buffer.concat(data).toString());
                callback(response_data)
            }
        );
    }

    https.get(url, requestCallback)
        .on('Error at GET request', err => console.error('Error: ', err.message));
}

// To send login request

function makePostRequst(body, options, callback) {

    const req = https.request(

        options, res => {

            const chunks = [];

            res.on('data', data => chunks.push(data))

            res.on('end', () => {

                let resBody = Buffer.concat(chunks);

                switch (res.headers['content-type']) {

                    case 'application/json':
                        resBody = JSON.parse(resBody);
                        break;
                }

                callback(resBody)
            })
        })

    req.on('error', err => console.error('Error at POST request', err));

    if (body) req.write(body);

    req.end();
}

const crypto = require('crypto');

function encryptPassword(publicKey, password) {
    // Create a buffer from the password
    const buffer = Buffer.from(password, 'utf-8');

    // Encrypt the buffer with the public key
    const encrypted = crypto.publicEncrypt(publicKey, buffer);

    // Return the encrypted password as a base64 encoded string
    return encrypted.toString('base64');
}

/* ------------------------------- User data ------------------------------- */

const account = '[user_account]';
const password = '[password]';

/* -------------------------------------------------------------------------- */

makeGetRequest(

    'https://esl.zkong.com/zk/user/getErpPublicKey',

    async (req_response) => {

        console.log(req_response.data)

        const publicKey = `-----BEGIN PUBLIC KEY-----\n${req_response.data}\n-----END PUBLIC KEY-----`;
        const encryptedPassword = encryptPassword(publicKey, password);

        console.log('Encrypted Password:', encryptedPassword);

        const postData = JSON.stringify(
            {
                "account": account,
                "loginType": 3,
                "password": encryptedPassword
            }
        );

        console.log(JSON.parse(postData))

        const options = {

            hostname: 'esl-eu.zkong.com',
            path: '/zk/user/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
        };

        makePostRequst(

            postData, options,

            login_response => console.log(login_response)
        );
    }
); 