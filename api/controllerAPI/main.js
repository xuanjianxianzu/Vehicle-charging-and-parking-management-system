const express = require('express');
const router = express.Router();
const dbcon = require('../models/connection_database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();

        const { username, password } = req.body;
        console.log(username);
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '用户名已存在'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        const newUserId = result.insertId;

        const [newUserRows] = await connection.query('SELECT id, username, created_at FROM users WHERE id = ?', [newUserId]);
        const newUser = newUserRows[0];

        return res.status(201).json({
            code: 201,
            data: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.created_at
            },
            message: '注册成功'
        });
    } catch (error) {
        console.error('注册错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) {
            await connection.end();
        }
    }
  }

  
);


router.post('/login',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();

        const { username, password } = req.body;
        console.log(username);
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户名不存在'
            });
        }

        const loginUser = rows[0];

        console.log(password,loginUser.password);

        const isMatch = await bcrypt.compare(password, loginUser.password);

        console.log(isMatch);

        if(!isMatch){
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        const token = jwt.sign(
            { userId: loginUser.id, username: loginUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        return res.status(200).json({
            code: 200,
            data: {
                id: loginUser.id,
                username: loginUser.username,
                token: token,
                expiresIn: 3600
            },
            message: '登录成功'
        });
    
    } catch (error) {
        console.error('登录错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });

    }finally {
        if (connection) {
            await connection.end();
        }
    }
  }

  
);


router.get('/parking-spaces', async (req, res) => {
    console.log('sssss');
    let connection;
    try {
        connection = await dbcon.getConnection();
        const [rows] = await connection.query(
            `SELECT 
                ps.id,
                ps.type,
                ps.rate,
                ps.parking_rate,
                ps.overtime_occupancy_rate,
                ps.status,
                ps.vehicles_id,
                ps.created_at,
                ps.updated_at 
            FROM 
                parking_spaces ps 
            LEFT JOIN 
                vehicles v ON ps.vehicles_id = v.id;`)
        return res.status(200).json({
            code: 200,
            data: rows,
            message: '获取车位信息成功'
        });
    } catch (error) {
        console.error('获取车位信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

router.post('/add-vehicle', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();
        const { license_plate, type, userId } = req.body;
 
        const [existingRows] = await connection.query(
            'SELECT * FROM vehicles WHERE user_id = ? AND license_plate = ?',
            [userId, license_plate]
        );
 
        if (existingRows.length > 0) {
            return res.status(400).json({
                code: 400,
                message: '该用户已存在此车牌号的车辆',
            });
        }
 
        const [rows] = await connection.query(
            'INSERT INTO vehicles (license_plate, user_id, type) VALUES (?, ?, ?)',
            [license_plate, userId, type]
        );
 
        return res.status(201).json({
            code: 201,
            message: '车辆信息添加成功',
        });
    } catch (error) {
        console.error('添加车辆信息错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

router.put('/updateCar', async (req, res) => {
    console.log('update');
    console.log(req.body);
    let connection;
    try {
        connection = await dbcon.getConnection();
        const { id, license_plate, userId, type } = req.body;
        const [licensePlateCheck] = await connection.query(
            'SELECT * FROM vehicles WHERE license_plate = ? AND user_id = ? AND id = ?',
            [license_plate, userId, id]
        );
        console.log(licensePlateCheck);
        if (licensePlateCheck.length > 0) {
            console.log('updatedddddd');
            return res.status(400).json({
                code: 400,
                message: '该用户已存在此车牌号的车辆',
            });
        }

        await connection.query(
            'UPDATE vehicles SET license_plate = ?, type = ? WHERE id = ? AND user_id = ?',
            [license_plate, type, id, userId]
        );

        return res.status(200).json({
            code: 200,
            message: '车辆信息更新成功',
        });
    } catch (error) {
        console.error('更新车辆信息错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

router.get('/myCar/:userId', async (req, res) => {
    let connection;
    const userId = req.params.userId;
    try {
        connection = await dbcon.getConnection();
        const [rows] = await connection.query(
            `SELECT 
                v.id,
                v.license_plate,
                v.type,
                v.user_id,
                v.created_at,
                v.updated_at 
            FROM 
                vehicles v
            WHERE 
                v.user_id = ?
            ORDER BY 
                v.created_at ASC;`, [userId]);
        return res.status(200).json({
            code: 200,
            data: rows,
            message: '获取用户车辆信息成功'
        });
    } catch (error) {
        console.error('获取用户车辆信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});




router.delete('/deleteCar/:id', async (req, res) => {
    console.log('dele');
    const carId = req.params.id;
    let connection;
    try {
        connection = await dbcon.getConnection();

        await connection.query(
            'DELETE FROM vehicles WHERE id = ?',
            [carId]
        );
 
        return res.status(200).json({
            code: 200,
            message: '车辆信息删除成功',
        });
    } catch (error) {
        console.error('删除车辆信息错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});
 
module.exports = router;



