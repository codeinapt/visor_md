const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VisorMD V2 API',
            version: '1.0.0',
            description: 'API para la gestión de documentos y carpetas de VisorMD',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/api/folders', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM folders ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/documents', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM documents ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/folders', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO folders (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/documents', async (req, res) => {
    const { title, content, folder_id } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO documents (title, content, folder_id) VALUES ($1, $2, $3) RETURNING *',
            [title, content, folder_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/documents/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const result = await db.query(
            'UPDATE documents SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [content, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
