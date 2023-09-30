const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config.json');

const app = express();
app.use(bodyParser.json());

let db = new sqlite3.Database('./payments.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.run('CREATE TABLE IF NOT EXISTS payments(email TEXT, description TEXT, amount REAL, UNIQUE(email, description))');

app.post('/custom_payment/payment', async (req, res) => {
    const { payment_email, payment_description, payment_amount } = req.body;

    getPaymentStatus(payment_email, payment_description)
    .then(paymentData => {
        if (paymentData) {
            return res.status(420).json({"error": "Payment already exists"});
        }
    })
    .catch(err => {
        console.error(err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    });

    try {
        db.run(`INSERT INTO payments(email, description, amount) VALUES(?, ?, ?)`, [payment_email, payment_description, payment_amount], async function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);

            // Use await to wait for the getPaymentStatus function to complete
            const paymentData = await getPaymentStatus(payment_email, payment_description);
            return res.status(200).json(paymentData);
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ "error": "Internal Server Error" });
    }
});

app.get('/custom_payment/payment/status', (req, res) => {
    const { email, description } = req.query;
    if (!email || !description) {
        return res.status(400).json({ "error": "Bad Request" });
    }

    getPaymentStatus(email, description)
        .then(paymentData => {
            if (paymentData) {
                res.status(200).json(paymentData);
            } else {
                res.status(404).json({ "error": "Not Found" });
            }
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).json({ "error": "Internal Server Error" });
        });
});

const getPaymentStatus = (email, description) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM payments WHERE email  = ? AND description = ?`;
        db.get(sql, [email, description], (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row);
        });
    });
}


const port = config.port || 5011;
app.listen(port, () => console.log(`Server running on port ${port}`));
