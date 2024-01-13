const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

// Oracle DB connection configuration
const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'manager',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/ORCL',
};

// Insert operation
app.post('/api/upload', async (req, res) => {
    console.log('Received POST request:', req.body);
  let connection;

  try {
    const { email, password, address, projectTitle, projectDescription, projectExperience, shareLink } = req.body;

    if (!email || !password || !address || !projectTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    connection = await oracledb.getConnection(dbConfig);
    const query = `
      INSERT INTO upload (email, password, address, projectTitle, projectDescription, projectExperience, shareLink)
      VALUES (:email, :password, :address, :projectTitle, :projectDescription, :projectExperience, :shareLink)`;

    const result = await connection.execute(query, { email, password, address, projectTitle, projectDescription, projectExperience, shareLink }, { autoCommit: true });

    res.json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Read operation
app.get('/api/data', async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT * FROM upload');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
app.put('/api/update/:email', async (req, res) => {
  let connection;

  try {
    const { email, password, address, projectTitle, projectDescription, projectExperience, shareLink } = req.body;

    if (!email || !password || !address || !projectTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    connection = await oracledb.getConnection(dbConfig);
    const query = `
      UPDATE upload SET 
      password = :password,
      address = :address,
      projectTitle = :projectTitle,
      projectDescription = :projectDescription,
      projectExperience = :projectExperience,
      shareLink = :shareLink
      WHERE email = :email`;

    const result = await connection.execute(query, {
      email,
      password,
      address,
      projectTitle,
      projectDescription,
      projectExperience,
      shareLink
    }, { autoCommit: true });

    res.json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Delete operation
app.delete('/api/delete/:email', async (req, res) => {
  let connection;

  try {
    const id = req.params.email;

    if (!id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    connection = await oracledb.getConnection(dbConfig);
    const query = 'DELETE FROM upload WHERE email = :email';

    const result = await connection.execute(query, [id], { autoCommit: true });

    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.listen(PORT, async () => {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connected to Oracle Database');
    await connection.close();
  } catch (error) {
    console.error('Failed to connect to Oracle Database:', error);
  }

  console.log(`Server is running on http://localhost:${PORT}`);
});
