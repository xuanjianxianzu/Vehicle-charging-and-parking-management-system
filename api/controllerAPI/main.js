const express = require('express');
const router = express.Router();
const dbcon = require('../models/connection_database')
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


router.get('/parking-spaces/:id', async (req, res) => {
    console.log('sssss');
    let connection;
    try {
        connection = await dbcon.getConnection();
        const id = parseInt(req.params.id, 10);;
        let query;
        query=
            `SELECT 
            ps.id AS id,  
            pst.type AS space_type,
            pst.rate AS charging_rate,
            pst.parking_rate,
            pst.overtime_occupancy_rate,
            ps.status,
            ps.vehicle_id,
            v.license_plate,
            v.type AS vehicle_type,
            ps.created_at,
            ps.updated_at
            FROM parking_spaces ps
            LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
            LEFT JOIN vehicles v ON ps.vehicle_id = v.id`
            if (id!== 0) {
                query += ' WHERE ps.id =?';
            }
            const [rows] = await connection.query(query,id)
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
 











/*
router.delete('/api/logout/:userId', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();
        const userId = req.params.userId;

        // 开始事务
        await connection.beginTransaction();

        try {
            // 删除用户相关的所有数据
            // 1. 删除用户的车辆记录
            await connection.query('DELETE FROM vehicles WHERE user_id = ?', [userId]);
            
            // 2. 删除用户的使用记录
            await connection.query(`
                DELETE ur FROM usage_records ur
                INNER JOIN vehicles v ON ur.vehicle_id = v.id
                WHERE v.user_id = ?
            `, [userId]);
            
            // 3. 最后删除用户账号
            await connection.query('DELETE FROM users WHERE id = ?', [userId]);

            // 提交事务
            await connection.commit();

            return res.status(200).json({
                code: 200,
                message: '账号注销成功'
            });
        } catch (error) {
            // 如果出错，回滚事务
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        console.error('注销账号错误:', error);
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
*/





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



  router.put('/usage-records/update', async (req, res) => {
    let connection;
    try {
        console.log('Updating usage record:', req.body);
        connection = await dbcon.getConnection();
        const { charging_complete_time,end_time ,parking_space_id,status,endStatus} = req.body;
        const formatTime = (timeStr) => {
            if (!timeStr) return null;
            return timeStr.slice(0, 19).replace('T', ' ');
          };
          const formattedEndTime = formatTime(end_time);
          const formattedChargingComplete = formatTime(charging_complete_time);
        console.log('aaaanoend');
        const [result] = await connection.query(`
            UPDATE usage_records
            SET charging_complete_time=?,end_time=?,status=?
            WHERE status = ? 
              AND parking_space_id = ?
        `, [formattedChargingComplete,formattedEndTime,endStatus,status,parking_space_id]);


        return res.status(200).json({
            code: 200,
            message: '使用记录更新成功',
            data: { updatedRows: result.affectedRows }
        });

    } catch (error) {
        console.error('更新使用记录错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    } finally {
        if (connection) await connection.end();
    }
});



router.get('/usage-records/:carId/:status', async (req, res) => {
    let connection;
    const carId = req.params.carId;
    const status = req.params.status;
    try {
        connection = await dbcon.getConnection();
        const [rows] = await connection.query(
            `SELECT 
                ur.start_time,
                ur.charging_start_time,
                ur.id
            FROM 
                usage_records ur
            WHERE 
                ur.vehicle_id = ?
            AND
                ur.status=?`, [carId,status]);
        return res.status(200).json({
            code: 200,
            data: rows,
            message: '获取信息成功'
        });
    } catch (error) {
        console.error('获取信息错误:', error);
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