// api/levels.js
import mysql from 'mysql2/promise';

// Configuración de conexión a freedb.tech
const dbConfig = {
    host: process.env.DB_HOST,        // sql.freedb.tech
    port: process.env.DB_PORT,        // 3306
    user: process.env.DB_USER,         // tu_usuario
    password: process.env.DB_PASSWORD, // tu_contraseña
    database: process.env.DB_NAME,      // freedb_tu_base
    ssl: false,  // freedb.tech no requiere SSL
    waitForConnections: true,
    connectionLimit: 5,  // Límite bajo por freedb.tech
    queueLimit: 0
};

// Cache de conexión para reutilizar entre invocaciones
let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
}

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Manejar preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const pool = getPool();
        
        // GET: Obtener todos los niveles
        if (req.method === 'GET') {
            const [rows] = await pool.query('SELECT * FROM levels ORDER BY createdAt DESC');
            
            // Parsear pattern JSON
            const levels = rows.map(row => ({
                ...row,
                pattern: JSON.parse(row.pattern)
            }));
            
            return res.status(200).json(levels);
        }
        
        // POST: Guardar nivel (crear o actualizar)
        if (req.method === 'POST') {
            const level = req.body;
            
            // Verificar si existe
            const [existing] = await pool.query(
                'SELECT id FROM levels WHERE id = ?', 
                [level.id]
            );
            
            if (existing.length > 0) {
                // Actualizar
                await pool.query(
                    `UPDATE levels SET 
                     name = ?, creator = ?, difficulty = ?, 
                     stars = ?, songUrl = ?, pattern = ?
                     WHERE id = ?`,
                    [
                        level.name,
                        level.creator,
                        level.difficulty,
                        level.stars,
                        level.songUrl,
                        JSON.stringify(level.pattern),
                        level.id
                    ]
                );
                return res.status(200).json({ success: true, action: 'updated' });
            } else {
                // Insertar nuevo
                await pool.query(
                    `INSERT INTO levels 
                     (id, name, creator, difficulty, stars, songUrl, pattern, createdAt)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        level.id,
                        level.name,
                        level.creator,
                        level.difficulty,
                        level.stars,
                        level.songUrl,
                        JSON.stringify(level.pattern),
                        level.createdAt
                    ]
                );
                return res.status(200).json({ success: true, action: 'created' });
            }
        }
        
        // DELETE: Eliminar nivel
        if (req.method === 'DELETE') {
            const { id } = req.query;
            await pool.query('DELETE FROM levels WHERE id = ?', [id]);
            return res.status(200).json({ success: true });
        }
        
        // Método no soportado
        return res.status(405).json({ error: 'Método no permitido' });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}