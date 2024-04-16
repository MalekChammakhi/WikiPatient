const jwt = require ('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const { config } = require ('dotenv');
const { createUser, findUserByEmail} = require ('../api/UserController.js');
const crypto = require ('crypto');
const nodemailer = require ('nodemailer');
const { connectionConfig } = require ('../../dbConfig.js');

const { Pool } = require('pg');



config();
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool(connectionConfig);

// Signup function
const signup = async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password} = req.body;
        console.log({ username, email, password});

        const existingUser = await findUserByEmail(email); 
        if (existingUser) {
            return res.status(409).send({ error: "User already exists" }); 
        }
        const user = await createUser(username, email, password);
        console.log(req.body.email)
        SendOTP({ body: { email: req.body.email } });
        console.log(req.body.email)

        res.status(201).send({ userId: user.id });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error creating user" });
    }
};


// Login function
const login = async (req, res) => {
    const client = await pool.connect();
    try {
        console.log(req.body);
        const { email, password } = req.body;
        console.log({ email, password });

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: "Invalid credentials" });
        }

        const is_verified = await pool.query('SELECT verified FROM users   WHERE email = $1', [email]);

        if (!is_verified.rows[0].verified) {
            return res.status(403).send({ error: "Please verifie Your account" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error logging in" });
    }
};



async function saveOtpForUser(otp, userId, expiresAt) {

    try {
        const result = await pool.query(
            'UPDATE users SET otp = $1, otp_expires_at = $2 WHERE id = $3',
            [otp, expiresAt, userId]
        );

    } catch (error) {
        console.error('Error saving OTP:', error);
        throw error;
    }
}


const SendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const otp = crypto.randomInt(100000, 999999);

   
        const expiresAtInSeconds = Math.floor((new Date().getTime() + 5 * 60000) / 1000);
        const expiresAt = new Date(expiresAtInSeconds * 1000);

        await saveOtpForUser(otp, user.id, expiresAt);

       
        const transporter = nodemailer.createTransport({
           
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: 'malek.chammakhi@ensi-uma.tn',
            to: user.email,
            subject: 'Code OTP',
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .content {
            padding: 20px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>OTP Request</h2>
        </div>
        <div class="content">
            <p>Hi,</p>
            <p>To verify your account. This code is only valid for 15 minutes.</p>
            <p style="text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 3px;"><strong>${otp}</strong></p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        </div>
        <div class="footer">
            <p>Best Regards,<br>WikiPatient</p>
        </div>
    </div>
</body>
</html>
 `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                // Correction ici
                return res.status(500).send({ error: 'Error sending OTP email' });
            } else {
                console.log('Email sent:', info.response);
                return res.send({ message: 'OTP sent to your email' });
            }
        });
        
    } catch (error) {
        console.error('Error in send email function:', error);
        res.status(500).send({ error: "Error processing send email request" });
    }
};


const is_verified = async (req, res) => {
    try {
        const { email, inputOtp } = req.body;
        console.log(`Starting verification for email: ${email} with OTP: ${inputOtp}`);

        // Étape 1: Vérifier l'existence de l'utilisateur
        const userQueryResult = await pool.query('SELECT id, otp, otp_expires_at FROM users WHERE email = $1', [email]);
        if (userQueryResult.rows.length === 0) {
            console.log('No user found with the provided email.');
            return res.status(404).send({ error: 'User not found.' });
        }
        const user = userQueryResult.rows[0];

        // Étape 2: Vérifier la correspondance de l'OTP
        if (user.otp.toString() !== inputOtp) {
            console.log('OTP mismatch.');
            return res.status(400).send({ error: 'OTP does not match.' });
        }

        // Étape 3: Vérifier l'expiration de l'OTP
        const now = new Date();
        const otpExpirationDate = new Date(user.otp_expires_at);
        if (now > otpExpirationDate) {
            console.log('OTP has expired.');
            return res.status(400).send({ error: 'OTP has expired.' });
        }

        // Étape 4: Marquer l'utilisateur comme vérifié
        await pool.query('UPDATE users SET verified = true, otp = NULL, otp_expires_at = NULL WHERE id = $1', [user.id]);
        console.log(`User verified successfully: ${user.id}`);
        res.status(200).send({ message: 'Account verified successfully.' });
    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).send({ error: 'Failed to verify the account.' });
    }
};
const logout = async (req, res) => {
    try {
        res.send({ message: "Logged out successfully." });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send({ error: 'Failed to logout.' });
    }
};





module.exports={signup, login, SendOTP, is_verified, logout};

