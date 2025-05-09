const express = require('express');
const router = express.Router();
const dbcon = require('../models/admin_connection_database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register',async (req,res) =>{
    console.log('aaaaaregister');
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
// 新增车位管理相关路由
router.get('/parking-spaces', async (req, res) => {
    try {
      const connection = await dbcon.getConnection();
      const [rows] = await connection.query(`
        SELECT 
          ps.id,
          pst.type AS parking_type,
          ps.status,
          v.license_plate,
          u.name AS user_name,
          b.status AS booking_status
        FROM parking_spaces ps
        LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
        LEFT JOIN usage_records ur ON ps.id = ur.parking_space_id 
          AND ur.status = 'in_progress'
        LEFT JOIN vehicles v ON ur.vehicle_id = v.id
        LEFT JOIN users u ON v.user_id = u.id
        LEFT JOIN bookings b ON ps.id = b.parking_space_id 
          AND b.status = 'confirmed'
          AND b.end_time > NOW()
      `);
      connection.end();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.put('/parking-spaces/:id', async (req, res) => {
    try {
      const connection = await dbcon.getConnection();
      const { status, type_id } = req.body;
      
      // 开启事务
      await connection.beginTransaction();
      
      // 更新车位信息
      const [spaceResult] = await connection.query(
        'UPDATE parking_spaces SET status = ?, type_id = ? WHERE id = ?',
        [status, type_id, req.params.id]
      );
  
      // 更新关联预约状态（如果需要）
      if (status === 'idle') {
        await connection.query(
          'UPDATE bookings SET status = ? WHERE parking_space_id = ?',
          ['cancelled', req.params.id]
        );
      }
  
      await connection.commit();
      connection.end();
  
      if (spaceResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Parking space not found' });
      }
  
      res.json({ success: true });
    } catch (err) {
      await connection.rollback();
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.get('/parking-spaces/:id/details', async (req, res) => {
    try {
      const connection = await dbcon.getConnection();
      const [spaceRows] = await connection.query(`
        SELECT 
          ps.*,
          pst.type AS parking_type,
          pst.rate,
          pst.parking_rate,
          v.license_plate,
          u.name AS user_name,
          ur.electricity_used,
          ur.total_fee,
          b.start_time AS booking_start,
          b.end_time AS booking_end
        FROM parking_spaces ps
        LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
        LEFT JOIN usage_records ur ON ps.id = ur.parking_space_id 
          AND ur.status = 'in_progress'
        LEFT JOIN vehicles v ON ur.vehicle_id = v.id
        LEFT JOIN users u ON v.user_id = u.id
        LEFT JOIN bookings b ON ps.id = b.parking_space_id 
          AND b.status = 'confirmed'
          AND b.end_time > NOW()
        WHERE ps.id = ?
      `, [req.params.id]);
  
      const [historyRows] = await connection.query(`
        SELECT 
          ur.start_time,
          ur.end_time,
          ur.electricity_used,
          ur.total_fee,
          v.license_plate,
          u.name AS user_name
        FROM usage_records ur
        JOIN vehicles v ON ur.vehicle_id = v.id
        JOIN users u ON v.user_id = u.id
        WHERE ur.parking_space_id = ?
        ORDER BY ur.start_time DESC
        LIMIT 10
      `, [req.params.id]);
  
      connection.end();
  
      res.json({
        space: spaceRows[0],
        history: historyRows
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;