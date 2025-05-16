const express = require('express');
const router = express.Router();
const dbcon = require('../models/admin_connection_database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login',async (req,res) =>{
    console.log(req.body);
    console.log('aaalogin');
    let connection;
    try {
        connection = await dbcon.getConnection();
        console.log(req.body);
        const { username, password } = req.body;
        console.log(username);
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = ? AND role IN ('admin','super_admin')`, [username]);
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
                role: loginUser.role,
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


router.post('/register',async (req,res) =>{
    console.log('aaaaaregister');
    let connection;
    try {
        connection = await dbcon.getConnection();

        const { username, password } = req.body;
        console.log(username);
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = ?`, [username]);
        if (rows.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '用户名已存在'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.query(`INSERT INTO users (username, password, role) VALUES (?, ?,'admin')`, [username, hashedPassword]);
        const newUserId = result.insertId;

        const [newUserRows] = await connection.query(`SELECT id, username, created_at FROM users WHERE id = ?`, [newUserId]);
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
        ORDER BY ps.id
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


// 获取所有车位类型
router.get('/parking-space-types', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const [types] = await connection.query(`SELECT * FROM parking_space_types`);
    res.status(200).json({
      code: 200,
      data: types,
      message: '获取车位类型成功'
    });
  } catch (err) {
    console.error('获取车位类型错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      details: err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// 获取单个车位类型详情
router.get('/parking-space-types/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const [types] = await connection.query(`SELECT * FROM parking_space_types WHERE id = ?`, [req.params.id]);
    if (types.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '车位类型不存在'
      });
    }
    res.status(200).json({
      code: 200,
      data: types[0],
      message: '获取车位类型成功'
    });
  } catch (err) {
    console.error('获取车位类型错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      details: err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.get('/parking-spaces/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const spaceId = req.params.id;

    // 1. 查询车位基础信息及类型（不变）
    const [spaceResults] = await connection.query(`
      SELECT
        ps.id,
        ps.type_id,
        ps.status,
        ps.vehicle_id,
        ps.created_at,
        ps.updated_at,
        pst.type AS type,
        pst.rate,
        pst.parking_rate,
        pst.overtime_occupancy_rate,
        pst.power
      FROM parking_spaces ps
      LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
      WHERE ps.id = ?
    `, [spaceId]);

    if (spaceResults.length === 0) {
      return res.status(404).json({ code: 404, message: '车位不存在' });
    }

    const parkingSpace = spaceResults[0];

    // 2. 查询当前占用车辆（不变）
    let currentVehicle = null;
    if (parkingSpace.vehicle_id) {
      const [vehicleResults] = await connection.query(`
        SELECT 
          v.id,
          v.license_plate,
          v.type AS vehicle_type,
          u.name AS userInfo_name,
          u.phone AS userInfo_phone
        FROM vehicles v
        LEFT JOIN users u ON v.user_id = u.id
        WHERE v.id = ?
      `, [parkingSpace.vehicle_id]);
      currentVehicle = vehicleResults[0] || null;
    }

    // 3. 查询使用记录、预订记录（移除无效字段）
    const [usageResults] = await connection.query(`
      SELECT * FROM usage_records WHERE parking_space_id = ?
    `, [spaceId]);

    const [bookingResults] = await connection.query(`
      SELECT 
        b.id,
        b.user_id,
        b.vehicle_id,
        b.parking_space_id,
        b.start_time,
        b.end_time,
        b.status,
        b.created_at,
        u.name ,
        u.phone,
        v.license_plate
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.parking_space_id = ?
    `, [spaceId]);

    // 4. 查询车位评论（不变）
    const [commentResults] = await connection.query(`
      SELECT 
        cr.id AS comment_id,
        cr.rating,
        cr.comment,
        cr.created_at,
        ur.id AS order_id,
        v.license_plate AS vehicle_plate,
        u.id AS user_id,
        u.name AS user_name,
        u.phone AS user_phone
      FROM comment_rating cr
      JOIN usage_records ur ON cr.order_id = ur.id
      JOIN vehicles v ON ur.vehicle_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE ur.parking_space_id = ?
    `, [spaceId]);

    // 5. 构建响应（调整 bookings 字段映射）
    const parkingDetail = {
      ...parkingSpace,
      typeDetail: {
        id: parkingSpace.type_id,
        type: parkingSpace.type,
        rate: parkingSpace.rate,
        parking_rate: parkingSpace.parking_rate,
        overtime_occupancy_rate: parkingSpace.overtime_occupancy_rate,
        power: parkingSpace.power
      },
      currentVehicle,
      usageRecords: usageResults,
      bookings: bookingResults.map(booking => ({
        ...booking,
        user: booking.user_name,
        vehiclePlate: booking.vehicle_plate,
        userPhone: booking.user_phone
      })),
      comments: commentResults
    };

    res.status(200).json({ 
      code: 200, 
      data: parkingDetail, 
      message: '成功获取车位详情' 
    });

  } catch (err) {
    console.error('服务器错误:', err); // 此处应打印完整错误堆栈
    res.status(500).json({ 
      code: 500, 
      message: '服务器内部错误', 
      details: err.message // 建议生产环境中隐藏详细错误信息
    });
  } finally {
    if (connection) await connection.end();
  }
});

// 更新车位信息（支持状态、类型、占用车辆更新）
router.put('/parking-spaces/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const spaceId = req.params.id;
    const updateData = req.body;

    // 检查车位是否存在
    const [spaceCheck] = await connection.query(`
      SELECT id FROM parking_spaces WHERE id = ?
    `, [spaceId]);

    if (spaceCheck.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '车位不存在'
      });
    }

    // 构建更新字段
    const fieldsToUpdate = [];
    const values = [updateData.status, updateData.type_id, updateData.vehicle_id, spaceId];
    
    // 状态、类型、占用车辆为可更新字段
    fieldsToUpdate.push('status = ?');
    if (updateData.type_id !== undefined) fieldsToUpdate.push('type_id = ?');
    if (updateData.vehicle_id !== undefined) fieldsToUpdate.push('vehicle_id = ?');
    fieldsToUpdate.push('updated_at = NOW()');

    // 执行更新
    const [result] = await connection.query(`
      UPDATE parking_spaces 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = ?
    `, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        code: 400,
        message: '更新失败，无有效数据变更'
      });
    }

    // 返回更新后的车位详情
    const [updatedSpace] = await connection.query(`
      SELECT * FROM parking_spaces WHERE id = ?
    `, [spaceId]);

    res.status(200).json({
      code: 200,
      data: updatedSpace[0],
      message: '车位信息更新成功'
    });

  } catch (err) {
    console.error('更新车位错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      details: err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});
  

  
// GET /admin/users - 获取所有用户（带统计信息）
router.get('/users', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection(); // 获取数据库连接
    
    // 修正后的SQL查询（确保字段存在）
    const [results] = await connection.query(`
      SELECT 
      u.id,
      u.username,
      u.name,
      u.role,
      u.balance,
      u.phone,
      u.email,
      u.avatar_number,
      u.created_at,
      u.updated_at,
      COUNT(DISTINCT v.id) AS vehicle_count,
      COUNT(DISTINCT ur.id) AS usage_count,
      COUNT(DISTINCT b.id) AS booking_count
    FROM users u
    LEFT JOIN vehicles v ON u.id = v.user_id
    LEFT JOIN usage_records ur ON v.id = ur.vehicle_id
    LEFT JOIN bookings b ON v.id = b.vehicle_id
    GROUP BY u.id;
    `);
 
    res.status(200).json({  // 明确返回状态码
      code: 200,
      data: results,
      message: '成功'
    });
  } catch (err) {
    console.error('用户查询错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      details: err.message  // 返回具体错误信息
    });
  } finally {
    if (connection) await connection.end();
  }
});
 
// GET /admin/users/:id - 获取用户完整详情
router.get('/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
         console.log('aaaaaa1')
    // 查询用户基本信息
    const [userResults] = await connection.query(`
      SELECT * FROM users WHERE id = ?
    `, [req.params.id]);
    
    if (userResults.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
    
    const user = userResults[0];
    
    // 查询用户车辆
    const [vehicleResults] = await connection.query(`
      SELECT * FROM vehicles WHERE user_id = ?
    `, [req.params.id]);
    
    // 查询用户使用记录（带关联信息）
    const [usageResults] = await connection.query(`
      SELECT 
        ur.*,
        v.license_plate,
        ps.id AS parking_space_id,
        ps.status AS parking_status,
        pst.type AS space_type,
        pst.rate AS charging_rate,
        pst.parking_rate,
        pst.overtime_occupancy_rate
      FROM usage_records ur
      JOIN vehicles v ON ur.vehicle_id = v.id
      JOIN parking_spaces ps ON ur.parking_space_id = ps.id
      JOIN parking_space_types pst ON ps.type_id = pst.id
      WHERE v.user_id = ?
    `, [req.params.id]);
    
    // 查询用户预订记录（带关联信息）
    const [bookingResults] = await connection.query(`
      SELECT 
        b.*,
        ps.id AS parking_space_id,
        ps.status AS parking_status,
        pst.type AS space_type,
        pst.rate AS charging_rate,
        pst.parking_rate,
        pst.overtime_occupancy_rate
      FROM bookings b
      JOIN parking_spaces ps ON b.parking_space_id = ps.id
      JOIN parking_space_types pst ON ps.type_id = pst.id
      WHERE b.user_id = ?
    `, [req.params.id]);
    
    // 查询用户评论
    const [commentResults] = await connection.query(`
      SELECT 
      cr.id AS comment_id,
      cr.rating,
      cr.comment,
      cr.created_at,
      ur.id AS order_id,
      ur.parking_space_id, 
      v.license_plate AS vehicle_plate
    FROM comment_rating cr
    JOIN usage_records ur ON cr.order_id = ur.id
    JOIN vehicles v ON ur.vehicle_id = v.id
    WHERE v.user_id = ?
    `, [req.params.id]);
    
    // 构建完整的用户详情对象
    const userDetail = {
      ...user,
      vehicles: vehicleResults,
      usageRecords: usageResults,
      bookings: bookingResults,
      comments: commentResults
    };
    console.log(userDetail,'aaaaaa111115')

    res.status(200).json({
      code: 200,
      data: userDetail,
      message: '成功'
    });
  } catch (err) {
    console.error('获取用户详情错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      details: err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});


router.put('/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const userId = req.params.id;
    const updateData = req.body;
    const allowedFields = ['name', 'phone', 'email', 'role', 'avatar_number', 'balance'];
    
    // 过滤无效字段
    const filteredData = Object.keys(updateData).reduce((acc, key) => {
      if (allowedFields.includes(key)) acc[key] = updateData[key];
      return acc;
    }, {});
    
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ code: 400, message: '没有可更新的数据' });
    }
    
    // 检查用户是否存在
    const [userCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) return res.status(404).json({ code: 404, message: '用户不存在' });
    
    // 构建更新语句
    const setClauses = Object.keys(filteredData).map((key, index) => `${key} = ?`);
    setClauses.push('updated_at = NOW()');
    
    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
    const values = [...Object.values(filteredData), userId];
    
    await connection.query(sql, values);
    
    const [updatedUser] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
    res.status(200).json({ code: 200, data: updatedUser[0], message: '更新成功' });
  } catch (err) {
    console.error('更新用户错误:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    if (connection) await connection.end();
  }
});


 
router.delete('/vehicles/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const vehicleId = req.params.id;

    // 1. 检查车辆是否存在
    const [vehicleCheck] = await connection.query(
      'SELECT id FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    if (vehicleCheck.length === 0) {
      return res.status(404).json({ code: 404, message: '车辆不存在' });
    }

    // 2. 检查是否存在未完成的订单（重点保留逻辑）
    const [activeOrders] = await connection.query(`
      SELECT id FROM usage_records 
      WHERE vehicle_id = ? 
      AND status IN ('in_progress', 'booked', 'to_be_paid')
    `, [vehicleId]);

    if (activeOrders.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '车辆存在未完成的订单，请先完成或取消订单' 
      });
    }

    // 3. 直接删除车辆（数据库自动处理外键SET NULL）
    await connection.query('DELETE FROM vehicles WHERE id = ?', [vehicleId]);

    res.status(200).json({ 
      code: 200, 
      message: '车辆删除成功', 
      data: { vehicleId }
    });

  } catch (err) {
    console.error('删除车辆错误:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    if (connection) await connection.end();
  }
});

router.delete('/bookings/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const bookingId = req.params.id;

    // 1. 检查预订是否存在
    const [bookingCheck] = await connection.query(
      'SELECT id FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookingCheck.length === 0) {
      return res.status(404).json({ code: 404, message: '预订不存在' });
    }

    // 2. 检查预订状态是否允许删除（示例：不允许删除已确认的预订）
    const [activeBooking] = await connection.query(
      'SELECT status FROM bookings WHERE id = ? AND status = "confirmed"',
      [bookingId]
    );

    if (activeBooking.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '无法删除已确认的预订，请先取消' 
      });
    }

    // 3. 删除预订（外键自动处理：parking_space_id 可能设为 NULL，具体看外键约束）
    await connection.query('DELETE FROM bookings WHERE id = ?', [bookingId]);

    res.status(200).json({ 
      code: 200, 
      message: '预订删除成功', 
      data: { bookingId }
    });

  } catch (err) {
    console.error('删除预订错误:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    if (connection) await connection.end();
  }
});


router.delete('/usage-records/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const recordId = req.params.id;

    // 1. 检查使用记录是否存在
    const [recordCheck] = await connection.query(
      'SELECT id FROM usage_records WHERE id = ?',
      [recordId]
    );

    if (recordCheck.length === 0) {
      return res.status(404).json({ code: 404, message: '使用记录不存在' });
    }

    // 2. 检查记录状态是否允许删除（示例：不允许删除进行中的记录）
    const [activeRecord] = await connection.query(
      'SELECT status FROM usage_records WHERE id = ? AND status = "in_progress"',
      [recordId]
    );

    if (activeRecord.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '无法删除进行中的使用记录' 
      });
    }

    // 3. 删除使用记录（级联删除评论，因 comment_rating.order_id 外键为 CASCADE）
    await connection.query('DELETE FROM usage_records WHERE id = ?', [recordId]);

    res.status(200).json({ 
      code: 200, 
      message: '使用记录删除成功', 
      data: { recordId }
    });

  } catch (err) {
    console.error('删除使用记录错误:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    if (connection) await connection.end();
  }
});

router.delete('/comments/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const commentId = req.params.id;

    // 1. 检查评论是否存在
    const [commentCheck] = await connection.query(
      'SELECT id FROM comment_rating WHERE id = ?',
      [commentId]
    );

    if (commentCheck.length === 0) {
      return res.status(404).json({ code: 404, message: '评论不存在' });
    }

    // 2. 直接删除评论
    await connection.query('DELETE FROM comment_rating WHERE id = ?', [commentId]);

    res.status(200).json({ 
      code: 200, 
      message: '评论删除成功', 
      data: { commentId }
    });

  } catch (err) {
    console.error('删除评论错误:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  } finally {
    if (connection) await connection.end();
  }
});
 

 
module.exports = router;
