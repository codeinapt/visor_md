CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO folders (name) VALUES ('General'), ('Proyectos');
INSERT INTO documents (title, content, folder_id) VALUES 
('Bienvenido', '# Hola Mundo\nBienvenido a VisorMD Full Stack.', 1),
('Arquitectura', '## Backend\nNode.js + Express\n## Frontend\nReact + Vite', 2);
