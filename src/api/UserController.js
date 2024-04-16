const  {Pool} = require  ('pg');
const bcrypt = require ('bcryptjs');
const { connectionConfig } = require ('../../dbConfig.js') ; 

const pool = new Pool(connectionConfig);
//S
const createUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id', [username, email, hashedPassword]);
    return res.rows[0];
};

const findUserByEmail = async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
};

const getUser = async (req, res) => {
    try {
        console.log(req.body);  
        const { email} = req.body;
        console.log({ email}); 

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.send({ user });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Error " });
    }
};

const findUserById = async (id) => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
};
module.exports={findUserById, createUser, findUserByEmail, getUser };
