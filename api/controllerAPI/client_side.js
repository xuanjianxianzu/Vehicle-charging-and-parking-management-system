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

router.put('/Recharge', async (req, res) => {
    let connection;
    try {
        console.log('Recharge:', req.body);
        connection = await dbcon.getConnection();
        const { userId,Amount} = req.body;
        if (!userId || !Amount || Amount <= 0) {
            return res.status(401).json({
                code: 401,
                message: '充值金额需要大于零且用户ID不能为空'
            });
        }
        await connection.query(`
            UPDATE users
                SET balance = balance + ?
                WHERE id = ?;
        `, [Amount,userId]);
        
        const [result] = await connection.query(
            'SELECT balance FROM users WHERE id = ?',
            [userId]
        );

        if (result.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户不存在'
            });
        }

        res.status(200).json({
            code: 200,
            message: '充值成功',
            balance: result[0].balance
        });

    } catch (error) {
        console.error('错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    } finally {
        if (connection) await connection.end();
    }
});


router.put('/payBill', async (req, res) => {
    let connection;
    try {
        console.log('payBill:', req.body);
        connection = await dbcon.getConnection();
        await connection.beginTransaction();
        const { userId,usageRecordId} = req.body;
        if (!userId || !usageRecordId) {
            return res.status(400).json({
                code: 400,
                message: '参数缺失'
            });
        }
        const [userRows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户未找到'
            });
        }
        
        const user = userRows[0];
        const [recordRows] = await connection.query('SELECT * FROM usage_records WHERE id = ?', [usageRecordId]);
        if (recordRows.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '使用记录未找到'
            });
        }
        const record = recordRows[0];

        if (Number(user.balance) < Number(record.total_fee) || record.status === 'completed') {
            console.log(user.balance,record.total_fee,Number(user.balance) < Number(record.total_fee))
            return res.status(401).json({
                code: 401,
                message: '余额不足或记录已支付'
            });
        }
        await connection.query(`
            UPDATE users
            SET balance = balance - ?
            WHERE id = ?;
        `, [record.total_fee, userId]);
 
        await connection.query(`
            UPDATE usage_records
            SET status = 'completed'
            WHERE id = ?;
        `, [usageRecordId]);

        await connection.commit();
        console.log('aaa')
        return res.status(200).json({
            code: 200,
            message: '支付成功',

        });

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

router.get('/usage-records/:userId', async (req, res) => {
    let connection;
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ code: 400, message: '无效的用户ID' });
        }
        connection = await dbcon.getConnection();
        const [carRows] = await connection.query(
            `SELECT * FROM vehicles WHERE user_id = ?`, [userId]);
            if (carRows.length === 0) {
                return res.status(200).json({ 
                    code: 200, 
                    data: [], 
                    message: '用户暂无车辆' 
                });
            }

        const [vehicleIds] = carRows.map(v => v.id);

        const [records] = await connection.query(`
            SELECT 
                ur.id,
                ur.start_time,
                ur.end_time,
                ur.total_fee,
                ur.status,
                v.license_plate,
                pst.type AS space_type
            FROM usage_records ur
            JOIN vehicles v ON ur.vehicle_id = v.id
            JOIN parking_spaces ps ON ur.parking_space_id = ps.id
            JOIN parking_space_types pst ON ps.type_id = pst.id
            WHERE ur.vehicle_id IN (?)
            ORDER BY ur.start_time DESC
            LIMIT 100`,
            [vehicleIds]
        );
        return res.status(200).json({
            code: 200,
            data: records,
            message: '查询成功'
        });

    } catch (error) {
        console.error('获取信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    } finally {
        if (connection) await connection.end();
    }
});


router.get('/user/:userId', async (req, res) => {
    let connection;
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ code: 400, message: '无效的用户ID' });
        }
        connection = await dbcon.getConnection();

        const [records] = await connection.query(`
            SELECT 
                u.id,
                u.name,
                u.phone,
                u.email,
                u.avatar_number,
                u.balance
            FROM users u
            WHERE u.id = ?`,
            [userId]
        );
        return res.status(200).json({
            code: 200,
            data: records,
            message: '查询成功'
        });

    } catch (error) {
        console.error('获取信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    } finally {
        if (connection) await connection.end();
    }
});






router.put('/userProfile/update', async (req, res) => {
    let connection;
    try {
        console.log('payBill:', req.body);
        connection = await dbcon.getConnection();
        const { id,name,phone,email,avatar_number} = req.body;
        if (!id) {
            return res.status(400).json({
                code: 400,
                message: '参数缺失'
            });
        }
        const [records] = await connection.query(`
            UPDATE users
            SET 
                name = ?,
                phone = ?,
                email = ?,
                avatar_number = ?
            WHERE 
                id = ?;
        `, [name,phone,email,avatar_number,id]);

        return res.status(200).json({
            code: 200,
            message: '成功',
            data: records,
        });

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


router.post('/usage-records/AllMy', async (req, res) => {
    let connection;
    try {
        const carIds = Array.isArray(req.body) ? req.body : [req.body];

        if (carIds.length === 0 || carIds.some(id => typeof id !== 'number' && typeof id !== 'string')) {
            return res.status(400).json({
                code: 400,
                message: '无效的车辆ID参数'
            });
        }

        connection = await dbcon.getConnection();
        const placeholders = carIds.map(() => '?').join(',');
        const [rows] = await connection.query(
            `SELECT 
                ur.id,
                ur.start_time,
                ur.charging_start_time,
                ur.charging_complete_time,
                ur.end_time,
                ur.status,
                ur.vehicle_id,
                ur.parking_space_id,
                ur.electricity_used,
                ur.total_fee
            FROM 
                usage_records ur
            WHERE 
                ur.vehicle_id IN (${placeholders})`,
            carIds
        );

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

router.post('/comment/rating', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();
        const { orderId, rating, comment } = req.body;
        
        const [orderRows] = await connection.query(
            'SELECT * FROM comment_rating WHERE order_id = ?',
            [orderId]
        );
  
        if (orderRows.length > 0) {
            return res.status(400).json({
                code: 400,
                message: '只能评价一次',
            });
        }
 
        const [rows] = await connection.query(
            'INSERT INTO comment_rating (rating, comment, order_id) VALUES (?, ?, ?)',
            [rating, comment, orderId]
        );
 
        return res.status(201).json({
            code: 201,
            message: '添加成功',
        });
    } catch (error) {
        console.error('添加信息错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});


router.get('/getComment/rating/:id',async (req,res) =>{
    console.log('aaaaaregister');
    let connection;
    try {
        connection = await dbcon.getConnection();
        const pId = req.params.id;
        const [usageRecords] = await connection.query(
            `SELECT id FROM usage_records 
            WHERE parking_space_id = ? 
            AND status = 'completed'`, 
            [pId]
        );
        if (usageRecords.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '该车位暂无使用记录'
            });
        }
        const orderIds = usageRecords.map(record => record.id);
        const [comments] = await connection.query(
            `SELECT 
                cr.rating,
                cr.comment,
                cr.created_at,
                u.name,
                u.avatar_number
            FROM comment_rating cr
            JOIN usage_records ur ON cr.order_id = ur.id
            JOIN vehicles v ON ur.vehicle_id = v.id
            JOIN users u ON v.user_id = u.id
            WHERE cr.order_id IN (?)`,
            [orderIds]
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


module.exports = router;