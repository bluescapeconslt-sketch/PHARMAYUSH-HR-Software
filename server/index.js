
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Helper: Map Tables ---
const ALLOWED_TABLES = [
    'roles', 'departments', 'shifts', 'policies', 'employees', 
    'leave_requests', 'onboarding_tasks', 'meetings', 'notices', 
    'attendance_records', 'complaints', 'performance_records', 
    'team_chat_messages'
];

// --- Seed Data ---
const SEED_DATA = {
    roles: [
        { id: 1, name: 'Admin', permissions: [ 'view:employees', 'manage:employees', 'view:leaves', 'manage:leaves', 'view:onboarding', 'manage:onboarding', 'view:policies', 'manage:policies', 'manage:notices', 'manage:departments', 'manage:meetings', 'view:attendance-report', 'use:performance-review', 'use:job-description', 'use:generate-letter', 'use:hr-assistant', 'manage:settings', 'manage:users', 'manage:roles', 'manage:shifts', 'manage:payroll', 'view:complaints', 'view:recognition', 'manage:recognition' ] },
        { id: 2, name: 'Employee', permissions: [ 'view:leaves', 'use:hr-assistant', 'view:recognition' ] },
        { id: 3, name: 'HR Manager', permissions: [ 'view:employees', 'manage:employees', 'view:leaves', 'manage:leaves', 'view:onboarding', 'manage:onboarding', 'view:policies', 'manage:policies', 'manage:notices', 'use:performance-review', 'use:job-description', 'use:generate-letter', 'use:hr-assistant', 'manage:shifts', 'view:complaints', 'view:recognition', 'manage:recognition' ] }
    ],
    employees: [
        { id: 4, name: 'Diana Prince', position: 'CEO', jobTitle: 'Chief Executive Officer', department: 'Executive', email: 'admin@example.com', password: 'admin', roleId: 1, avatar: 'https://i.pravatar.cc/150?u=4', status: 'Active', birthday: '1985-03-10', leaveBalance: { short: 20, sick: 10, personal: 5 }, baseSalary: 150000, lastLeaveAllocation: '2024-07', performancePoints: 250, badges: ['Rising Star', 'Team Player'] }
    ],
    departments: [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Human Resources' },
        { id: 3, name: 'Marketing' },
        { id: 4, name: 'Sales' },
        { id: 5, name: 'Executive' }
    ],
    shifts: [
        { id: 1, name: 'General Shift', startTime: '09:00', endTime: '17:00' }
    ]
};

const seedTable = async (tableName, items) => {
    for (const item of items) {
        const { id, ...data } = item;
        try {
            // Check if exists to avoid duplicate error spam
            const [exists] = await db.query(`SELECT id FROM ${tableName} WHERE id = ?`, [id]);
            if (exists.length === 0) {
               await db.query(`INSERT INTO ${tableName} (id, data) VALUES (?, ?)`, [id, JSON.stringify(data)]);
            }
        } catch (e) {
            console.error(`Failed to seed ${tableName} item ${id}:`, e);
        }
    }
    console.log(`Seeded ${tableName} with ${items.length} items.`);
};

// --- Database Initialization ---
const initDb = async () => {
    console.log('Checking database status...');
    try {
        // Initialize Schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema.split(';').filter(s => s.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await db.query(statement);
                }
            }
            console.log('Database schema checked/initialized.');
        } else {
            console.error('schema.sql not found. Skipping schema init.');
        }

        // Seed Data if empty
        try {
            const [roleRows] = await db.query('SELECT COUNT(*) as count FROM roles');
            if (roleRows[0].count === 0) {
                console.log('Roles table empty. Seeding defaults...');
                await seedTable('roles', SEED_DATA.roles);
            }

            const [empRows] = await db.query('SELECT COUNT(*) as count FROM employees');
            if (empRows[0].count === 0) {
                console.log('Employees table empty. Seeding default admin...');
                await seedTable('employees', SEED_DATA.employees);
            }
            
            const [deptRows] = await db.query('SELECT COUNT(*) as count FROM departments');
            if (deptRows[0].count === 0) {
                await seedTable('departments', SEED_DATA.departments);
            }

            const [shiftRows] = await db.query('SELECT COUNT(*) as count FROM shifts');
            if (shiftRows[0].count === 0) {
                await seedTable('shifts', SEED_DATA.shifts);
            }

        } catch (seedErr) {
            console.error('Error during data seeding:', seedErr);
        }

    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 1. File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// 2. Key-Value Settings
app.get('/api/settings/:key', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT value FROM settings WHERE `key` = ?', [req.params.key]);
        if (rows.length > 0) {
            res.json({ value: rows[0].value }); 
        } else {
            res.status(404).json({ error: 'Setting not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/settings/:key', async (req, res) => {
    try {
        const { value } = req.body;
        const key = req.params.key;
        await db.query(
            'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
            [key, JSON.stringify(value), JSON.stringify(value)]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. Generic CRUD
app.get('/api/:table', async (req, res) => {
    const table = req.params.table;
    if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: 'Invalid table' });

    try {
        const [rows] = await db.query(`SELECT id, data FROM ${table}`);
        const results = rows.map(row => ({ id: row.id, ...row.data }));
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/:table/:id', async (req, res) => {
    const table = req.params.table;
    if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: 'Invalid table' });

    try {
        const [rows] = await db.query(`SELECT id, data FROM ${table} WHERE id = ?`, [req.params.id]);
        if (rows.length > 0) {
            res.json({ id: rows[0].id, ...rows[0].data });
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/:table', async (req, res) => {
    const table = req.params.table;
    if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: 'Invalid table' });

    try {
        const data = req.body;
        const [result] = await db.query(`INSERT INTO ${table} (data) VALUES (?)`, [JSON.stringify(data)]);
        const newId = result.insertId;
        res.json({ id: newId, ...data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/:table/:id', async (req, res) => {
    const table = req.params.table;
    if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: 'Invalid table' });

    try {
        const data = req.body;
        const id = req.params.id;
        data.id = Number(id);

        const [result] = await db.query(`UPDATE ${table} SET data = ? WHERE id = ?`, [JSON.stringify(data), id]);
        
        if (result.affectedRows > 0) {
            res.json(data);
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/:table/:id', async (req, res) => {
    const table = req.params.table;
    if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: 'Invalid table' });

    try {
        await db.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Serve React App (Must be last)
const buildPath = path.join(__dirname, '../dist');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

app.listen(PORT, async () => {
    await initDb();
    console.log(`Server running on port ${PORT}`);
});
