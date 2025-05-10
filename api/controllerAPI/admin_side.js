const express = require('express');
const router = express.Router();
const dbcon = require('../models/admin_connection_database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const safeNumber = (num) => (isNaN(num) ? 0 : Number(num));

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




router.get('/parking-spaces', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();

        const [rows] = await connection.query(`
        SELECT 
          ps.id,
          pst.type AS space_type,
          ps.status,
          v.license_plate,
          u.name
        FROM parking_spaces ps
        LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
        LEFT JOIN usage_records ur ON ps.id = ur.parking_space_id 
          AND ur.status = 'in_progress'
        LEFT JOIN vehicles v ON ur.vehicle_id = v.id
        LEFT JOIN users u ON v.user_id = u.id
      `);
      console.log('jjjjjjjjjjjj');


        return res.status(201).json({
            code: 201,
            data: rows,
            message: '成功'
        });
    } catch (error) {
        console.error('错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();
    }
  }

  
);


  
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

  router.post('/login',async (req,res) =>{
    console.log(req.body);
    console.log('aaalogin');
    let connection;
    try {
        connection = await dbcon.getConnection();
        console.log(req.body);
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




// GET /admin/users - 获取所有用户（带统计信息）
router.get('/users', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.name,
        u.role,
        u.balance,
        COUNT(DISTINCT v.id) AS vehicle_count,
        COUNT(DISTINCT ur.id) AS usage_count,
        COUNT(DISTINCT b.id) AS booking_count
      FROM users u
      LEFT JOIN vehicles v ON u.id = v.user_id
      LEFT JOIN usage_records ur ON u.id = ur.user_id
      LEFT JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
 
// GET /admin/users/:id - 获取用户完整详情
router.get('/users/:id', async (req, res) => {
  try {
    const [userResults] = await db.query(`
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM vehicles WHERE user_id = u.id) AS vehicle_count,
        (SELECT COUNT(*) FROM usage_records WHERE user_id = u.id) AS usage_count,
        (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) AS booking_count
      FROM users u
      WHERE u.id = ?
    `, [req.params.id]);
 
    if (!userResults.length) return res.status(404).json({ error: '用户不存在' });
 
    const user = userResults[0];
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE user_id = ?', [req.params.id]);
    const [usageRecords] = await db.query(`
      SELECT 
        ur.*, 
        ps.id AS parking_space_id,
        pst.type AS parking_type,
        v.license_plate AS vehicle_plate
      FROM usage_records ur
      LEFT JOIN parking_spaces ps ON ur.parking_space_id = ps.id
      LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
      LEFT JOIN vehicles v ON ur.vehicle_id = v.id
      WHERE ur.user_id = ?
    `, [req.params.id]);
 
    const [bookings] = await db.query(`
      SELECT 
        b.*,
        ps.id AS parking_space_id,
        pst.type AS parking_type,
        v.license_plate AS vehicle_plate
      FROM bookings b
      LEFT JOIN parking_spaces ps ON b.parking_space_id = ps.id
      LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.user_id = ?
    `, [req.params.id]);
 
    res.json({
      user,
      vehicles,
      usageRecords,
      bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
 
// PUT /admin/users/:id - 更新用户信息
router.put('/users/:id', async (req, res) => {
  try {
    const { name, phone, email, role, balance } = req.body;
    const [result] = await db.query(`
      UPDATE users 
      SET 
        name = ?,
        phone = ?,
        email = ?,
        role = ?,
        balance = ?
      WHERE id = ?
    `, [name, phone, email, role, safeNumber(balance), req.params.id]);
 
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
 
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
 
// PUT /admin/vehicles/:id - 更新车辆信息
router.put('/vehicles/:id', async (req, res) => {
  try {
    const { license_plate, type } = req.body;
    const [result] = await db.query(`
      UPDATE vehicles 
      SET 
        license_plate = ?,
        type = ?
      WHERE id = ?
    `, [license_plate, type, req.params.id]);
 
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '车辆不存在' });
    }
 
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
 
// PUT /admin/usage-records/:id - 更新使用记录
router.put('/usage-records/:id', async (req, res) => {
  try {
    const { 
      start_time, 
      charging_start_time, 
      charging_complete_time, 
      end_time, 
      status,
      electricity_used,
      total_fee
    } = req.body;
 
    const [result] = await db.query(`
      UPDATE usage_records 
      SET 
        start_time = ?,
        charging_start_time = ?,
        charging_complete_time = ?,
        end_time = ?,
        status = ?,
        electricity_used = ?,
        total_fee = ?
      WHERE id = ?
    `, [
      start_time,
      charging_start_time,
      charging_complete_time,
      end_time,
      status,
      safeNumber(electricity_used),
      safeNumber(total_fee),
      req.params.id
    ]);
 
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '使用记录不存在' });
    }
 
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
 
// PUT /admin/bookings/:id - 更新预约信息
router.put('/bookings/:id', async (req, res) => {
  try {
    const { start_time, end_time, status } = req.body;
    const [result] = await db.query(`
      UPDATE bookings 
      SET 
        start_time = ?,
        end_time = ?,
        status = ?
      WHERE id = ?
    `, [start_time, end_time, status, req.params.id]);
 
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '预约不存在' });
    }
 
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
 
module.exports = router;
