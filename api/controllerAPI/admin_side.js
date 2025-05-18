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
            { userId: loginUser.id, username: loginUser.username,role:loginUser.role },
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

        const { role,username, password,myRole } = req.body;
        if(myRole!=='super_admin'){
           return res.status(401).json({
            code: 401,
            message: '权限不够'
        });
        }
        console.log(username);
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = ?`, [username]);
        if (rows.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '用户名已存在'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.query(`INSERT INTO users (username, password, role) VALUES (?, ?,?)`, [username, hashedPassword,role]);
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
        LEFT JOIN vehicles v ON ps.vehicle_id = v.id
        LEFT JOIN users u ON v.user_id = u.id
        ORDER BY ps.id
      `);

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

router.get('/parking-spaces-type', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();
        const [rows] = await connection.query(`
        SELECT * FROM parking_space_types;
      `);

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



router.put('/release-sapce', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();

        const { spaceId,status} = req.body;
        const [userRows] = await connection.query(`SELECT * FROM usage_records WHERE parking_space_id=? AND status IN('in_progress', 'booked')`, [spaceId]);
        if (userRows.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户未找到'
            });
        }
        const id = userRows.map(row => row.id);
        
      if(status=='idle'){
            return res.status(401).json({
                code: 401,
                message: '没有绑定车位'
            });
      }else if(status=='booked'){
        await connection.query(`
          UPDATE usage_records
          SET   
          status = 'end_booked'
          WHERE id = ?
    `, [id]);
      }else{
        const chargingStart = userRows.map(row => row.charging_start_time);
        if(chargingStart[0]!==null){
        await connection.query(`
            UPDATE usage_records
            SET   
            charging_complete_time = charging_start_time + INTERVAL 1 MINUTE,
            end_time = charging_start_time + INTERVAL 1 MINUTE,
            status = 'completed'
            WHERE id = ?
        `, [id]);
        }else{
         console.log('aaedadadlse')
        await connection.query(`
            UPDATE usage_records
            SET   
            end_time = start_time + INTERVAL 1 MINUTE,
            status = 'completed'
            WHERE id = ?
        `, [id]);
        }


        return res.status(200).json({
            code: 200,
            message: '成功',
        });
      }
    } catch (error) {
        console.error('错误:', error);
        if (connection) await connection.rollback();
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    } finally {
        if (connection) await connection.end();
    }
});

router.post('/usage-records', async (req, res) => {
    let connection;
    try {
      console.log('daoda usage',req.body)
      connection = await dbcon.getConnection();
      const { 
        startTime, 
        chargingStartTime,
        chargingCompleteTime,
        endTime,
        status, 
        vehicleId,
        parkingSpaceId
         } = req.body.usageRecords;

         const formatTime = (timeStr) => {
            if (!timeStr) return null;
            return timeStr.slice(0, 19).replace('T', ' ');
          };
    
          const formattedStartTime = formatTime(startTime);
          const formattedEndTime = formatTime(endTime);
          const formattedChargingStart = formatTime(chargingStartTime);
          const formattedChargingComplete = formatTime(chargingCompleteTime);
    
          console.log('Formatted times:', { formattedStartTime, formattedEndTime });

      const [result] = await connection.query(
        `INSERT INTO usage_records (start_time, charging_start_time, charging_complete_time, end_time, status, vehicle_id, parking_space_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [formattedStartTime, formattedChargingStart, formattedChargingComplete, formattedEndTime, status, vehicleId, parkingSpaceId]
      );
      
      return res.status(201).json({
        code: 201,
        data: { id: result.insertId },
        message: '使用记录创建成功'
      });
    } catch (error) {
      console.error('创建使用记录错误:', error);
      return res.status(500).json({ code: 500, message: '服务器内部错误' });
    } finally {
      if (connection) await connection.end();
    }
  });

router.put('/updatePSpace', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const { id, typeId } = req.body;
    const [result] = await connection.query(`
      UPDATE parking_spaces 
      SET 
      type_id = ?
      WHERE id = ?
    `, [typeId, id]);

    res.status(200).json({
      code: 200,
      data: result,
      message: '成功'
    });
  } catch (err) {
    console.error('错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.get('/users', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();

    const [results] = await connection.query(`
        SELECT * FROM users
    `);
 
    res.status(200).json({
      code: 200,
      data: results,
      message: '成功'
    });
  } catch (err) {
    console.error('用户查询错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});
 
router.put('/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const { name, phone, email, role, balance } = req.body;
    console.log(req.body,'111111111111');
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
 
    res.status(200).json({
      code: 200,
      data: results,
      message: '成功'
    });
  } catch (err) {
    console.error('用户查询错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});
 
router.put('/vehicles/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
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
 
    res.status(200).json({
      code: 200,
      data: results,
      message: '成功'
    });
  } catch (err) {
    console.error('用户查询错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});
 
router.put('/usage-records/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
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
 
    res.status(200).json({
      code: 200,
      data: results,
      message: '成功'
    });
  } catch (err) {
    console.error('用户查询错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});
 
router.put('/bookings/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
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
 
    res.status(200).json({
      code: 200,
      data: results,
      message: '成功'
    });
  } catch (err) {
    console.error('用户查询错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.delete('/deleteSpace/:id', async (req, res) => {
    console.log('dele');
    const spaceId = req.params.id;
    let connection;
    try {
        connection = await dbcon.getConnection();

        await connection.query(
            'DELETE FROM parking_spaces WHERE id = ?',
            [spaceId]
        );
 
        return res.status(200).json({
            code: 200,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除错误:', error);
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

router.post('/addNewSpace', async (req, res) => {
  const { typeId } = req.body;
  let connection;
  try {
    connection = await dbcon.getConnection();
    const [result] = await connection.query(`
      INSERT INTO parking_spaces (type_id) 
        VALUES 
        (?)
    `, [typeId]);

    res.status(200).json({
      code: 200,
      data: result,
      message: '成功'
    });
  } catch (err) {
    console.error('错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});


router.put('/spaceType', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    console.log(req.body)
    const { type, rate,parking_rate,overtime_occupancy_rate,power} = req.body.PST;
    const [result] = await connection.query(`
      UPDATE parking_space_types
      SET 
      rate = ?,
      parking_rate = ?,
      overtime_occupancy_rate = ?,
      power = ?
      WHERE
      type = ?
    `, [rate,parking_rate,overtime_occupancy_rate,power,type]);

    res.status(200).json({
      code: 200,
      data: result,
      message: '成功'
    });
  } catch (err) {
    console.error('错误:', err);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
  } finally {
    if (connection) await connection.end();
  }
});

router.get('/getComment/rating',async (req,res) =>{
    console.log('aaaaaregister');
    let connection;
    try {
        connection = await dbcon.getConnection();
        const [comments] = await connection.query(
            `SELECT 
                cr.id,
                cr.rating,
                cr.comment,
                cr.created_at,
                u.name,
                u.avatar_number
            FROM comment_rating cr
            JOIN usage_records ur ON cr.order_id = ur.id
            JOIN vehicles v ON ur.vehicle_id = v.id
            JOIN users u ON v.user_id = u.id`,
        );
        return res.status(200).json({
            code: 200,
            data: comments,
            message: '查询成功'
        });

    } catch (error) {
        console.error('错误:', error);
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


router.delete('/deleteComment/:id', async (req, res) => {
    console.log('dele');
    const commentId = req.params.id;
    let connection;
    try {
        connection = await dbcon.getConnection();

        await connection.query(
            'DELETE FROM comment_rating WHERE id = ?',
            [commentId]
        );
 
        return res.status(200).json({
            code: 200,
            message: '删除成功',
        });
    } catch (error) {
        console.error('删除错误:', error);
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
