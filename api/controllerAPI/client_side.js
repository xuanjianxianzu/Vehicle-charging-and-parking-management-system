const express = require('express');
const router = express.Router();//创建路由实例
const dbcon = require('../models/connection_database')//数据库连接池
const bcrypt = require('bcrypt');//密码哈希库
const jwt = require('jsonwebtoken');//jwt库用来获取token


/*------------------------------下面是客户端的登录注册模块(张博)------------------------------*/
//用来注册的路由处理模块
router.post('/register',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { username, password } = req.body;//解析请求体
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);//数据库查询,使用参数化查询,避免sql注入
        if (rows.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '用户名已存在'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);//对密码进行哈希处理
        const [result] = await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);//插入用户
        const newUserId = result.insertId;//获取自增的id
        const [newUserRows] = await connection.query('SELECT id, username, created_at FROM users WHERE id = ?', [newUserId]);//查询新添加的用户信息
        const newUser = newUserRows[0];

        return res.status(201).json({//成功并返回必要字段
            code: 201,
            data: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.created_at
            },
            message: '注册成功'
        });
    } catch (error) {//错误处理
        console.error('注册错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来登陆的路由模块
router.post('/login',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { username, password } = req.body;//解析请求体
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);//数据库查询用户名
        if (rows.length === 0) {//用户名不存在返回404
            return res.status(404).json({
                code: 404,
                message: '用户名不存在'
            });
        }
        const loginUser = rows[0];//当存在用户名时将查询到的用户对象赋值给loginUser
        const isMatch = await bcrypt.compare(password, loginUser.password);//将用户输入的密码哈希处理后和查询后的密码比较
        if(!isMatch){//如果不一样密码错误
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误'
            });
        }

        const token = jwt.sign(//生成token将必要数据储存到里边,并设置3小时过期
            { userId: loginUser.id, username: loginUser.username,role:loginUser.role },
            process.env.JWT_SECRET,//jwt的私钥通过环境变量获取
            { expiresIn: '3h' }
        );

        return res.status(200).json({//登陆成功将token和一些信息返回.
            code: 200,
            data: {
                id: loginUser.id,
                username: loginUser.username,
                token: token,
                expiresIn: 3600
            },
            message: '登录成功'
        });
    
    } catch (error) {//错误处理
        console.error('登录错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });

    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
/*------------------------------下面是停车位管理模块(张博)------------------------------*/
//用来获取所有或者单个车位的信息的路由模块
router.get('/parking-spaces/:id', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const id = Number(req.params.id);//从url提取id
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
            if (id!== 0) {//动态添加sql当id=0时查询所有车位信息,其他时候查询单个的
                query += ' WHERE ps.id =?';
            }
            const [rows] = await connection.query(query,id)
        return res.status(200).json({//查询成功返回车位信息
            code: 200,
            data: rows,
            message: '获取车位信息成功'
        });
    } catch (error) {//错误处理
        console.error('获取车位信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
/*------------------------------下面是车辆管理模块(刘烨轩)------------------------------*/
//用来给用户添加车辆的路由处理模块
router.post('/add-vehicle', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { license_plate, type, userId } = req.body;//解析请求体
 
        const [existingRows] = await connection.query(//查询现有的车辆,防止重复添加
            'SELECT * FROM vehicles WHERE license_plate = ?',
            [license_plate]
        );
 
        if (existingRows.length > 0) {//已存在车辆返回400
            return res.status(400).json({
                code: 400,
                message: '该已存在此车牌号的车辆',
            });
        }
 
        const [rows] = await connection.query(//插入车辆
            'INSERT INTO vehicles (license_plate, user_id, type) VALUES (?, ?, ?)',
            [license_plate, userId, type]
        );
 
        return res.status(201).json({//成功并返回
            code: 201,
            message: '车辆信息添加成功',
        });
    } catch (error) {//错误处理
        console.error('添加车辆信息错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来修改车辆信息的路由处理模块
router.put('/updateCar', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { id, license_plate, userId, type } = req.body;//解析请求体
        const [licensePlateCheck] = await connection.query(//查询现有车辆,防止重复提交
            'SELECT * FROM vehicles WHERE license_plate = ?',
            [license_plate]
        );
        if (licensePlateCheck.length > 0) {//有重复的车牌返回400无法添加
            return res.status(400).json({
                code: 400,
                message: '该已存在此车牌号的车辆',
            });
        }
        await connection.query(//更新数据库车辆信息
            'UPDATE vehicles SET license_plate = ?, type = ? WHERE id = ? AND user_id = ?',
            [license_plate, type, id, userId]
        );

        return res.status(200).json({//成功处理
            code: 200,
            message: '车辆信息更新成功',
        });
    } catch (error) {//错误处理
        console.error('更新车辆信息错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来获取属于我的车辆信息的路由模块
router.get('/myCar/:userId', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const userId = req.params.userId;//从url获取用户id
        const [rows] = await connection.query(//数据库查询车辆信息并按创建时间排序
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
        return res.status(200).json({//成功返回车辆信息
            code: 200,
            data: rows,
            message: '获取用户车辆信息成功'
        });
    } catch (error) {//错误处理
        console.error('获取用户车辆信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来删除车辆的路由处理模块
router.delete('/deleteCar/:id', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const carId = req.params.id;//从url获取车辆id
        await connection.query(//通过id删除车辆
            'DELETE FROM vehicles WHERE id = ?',
            [carId]
        );
 
        return res.status(200).json({//成功处理
            code: 200,
            message: '车辆信息删除成功',
        });
    } catch (error) {//错误处理
        console.error('删除车辆信息错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
/*------------------------------下面是使用车辆管理模块(杨佳龙)------------------------------*/
//创建使用记录的路由处理模块
router.post('/usage-records', async (req, res) => {
    let connection;
    try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
      const { 
        startTime, 
        chargingStartTime,
        chargingCompleteTime,
        endTime,
        status, 
        vehicleId,
        parkingSpaceId
         } = req.body.usageRecords;//解析请求体中包含的对象
         const [licensePlateCheck] = await connection.query(//查询该车辆的订单,防止一车绑多个车位
            `SELECT * FROM usage_records WHERE vehicle_id = ? AND status IN('booked','in_progress')`,
            [vehicleId]
        );
        if(licensePlateCheck.length>0){//有使用记录返回错误
            return res.status(400).json({
                code: 400,
                message: '该车辆有正在使用的记录',
            });
        }
         const formatTime = (timeStr) => {//处理时间格式使其符合数据库格式
            if (!timeStr) return null;
            return timeStr.slice(0, 19).replace('T', ' ');
          };
          //将时间处理后重新赋值
          const formattedStartTime = formatTime(startTime);
          const formattedEndTime = formatTime(endTime);
          const formattedChargingStart = formatTime(chargingStartTime);
          const formattedChargingComplete = formatTime(chargingCompleteTime);

      const [result] = await connection.query(//数据库插入使用记录
        `INSERT INTO usage_records (start_time, charging_start_time, charging_complete_time, end_time, status, vehicle_id, parking_space_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [formattedStartTime, formattedChargingStart, formattedChargingComplete, formattedEndTime, status, vehicleId, parkingSpaceId]
      );
      
      return res.status(201).json({//成功返回记录id
        code: 201,
        data: { id: result.insertId },
        message: '使用记录创建成功'
      });
    } catch (error) {//错误处理
      console.error('创建使用记录错误:', error);
      return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来修改使用记录表的路由处理模块
  router.put('/usage-records/update', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { charging_complete_time,end_time ,parking_space_id,status,endStatus} = req.body;//从请求体解析字段
        const formatTime = (timeStr) => {//处理时间格式
            if (!timeStr) return null;
            return timeStr.slice(0, 19).replace('T', ' ');
          };
          //将事件处理并赋值
          const formattedEndTime = formatTime(end_time);
          const formattedChargingComplete = formatTime(charging_complete_time);
          //数据库更新使用记录表
        const [result] = await connection.query(`
            UPDATE usage_records
            SET charging_complete_time=?,end_time=?,status=?
            WHERE status = ? 
              AND parking_space_id = ?
        `, [formattedChargingComplete,formattedEndTime,endStatus,status,parking_space_id]);

        return res.status(200).json({//成功返回更新的使用记录
            code: 200,
            message: '使用记录更新成功',
            data: { updatedRows: result.affectedRows }
        });
    } catch (error) {//错误处理
        console.error('更新使用记录错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来获取使用记录的路由模块
router.get('/usage-records/:carId/:status', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        //从url获取变量
        const carId = req.params.carId;
        const status = req.params.status;
        const [rows] = await connection.query(//根据车辆id和订单状态获取订单信息
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
        return res.status(200).json({//成功返回使用记录
            code: 200,
            data: rows,
            message: '获取信息成功'
        });
    } catch (error) {//错误处理
        console.error('获取信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来支付订单的路由模块
router.put('/payBill', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        await connection.beginTransaction();//开启事务,使用数据库事务保证扣费的数据库一致性
        const { userId,usageRecordId} = req.body;//解析请求体
        const [userRows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId]);//查询用户信息,获取余额
        if (userRows.length === 0) {//没找到返回404
            return res.status(404).json({
                code: 404,
                message: '用户未找到'
            });
        }
        
        const user = userRows[0];//找到信息提取获取的用户信息
        const [recordRows] = await connection.query('SELECT * FROM usage_records WHERE id = ?', [usageRecordId]);//查询使用记录根据id
        if (recordRows.length === 0) {//没找到返回404
            return res.status(404).json({
                code: 404,
                message: '使用记录未找到'
            });
        }
        const record = recordRows[0];//提取获取的信息

        if (Number(user.balance) < Number(record.total_fee) || record.status === 'completed') {//当余额不足或订单已经完成时返回401
            return res.status(401).json({
                code: 401,
                message: '余额不足或记录已支付'
            });
        }
        //余额扣除所需费用
        await connection.query(`
            UPDATE users
            SET balance = balance - ?
            WHERE id = ?;
        `, [record.total_fee, userId]);
        //订单状态改成完成
        await connection.query(`
            UPDATE usage_records
            SET status = 'completed'
            WHERE id = ?;
        `, [usageRecordId]);
        await connection.commit();//提交事务
        return res.status(200).json({//成功处理
            code: 200,
            message: '支付成功',

        });
    } catch (error) {
        console.error('错误:', error);
        if (connection) await connection.rollback();//如果失败回滚事务,保持数据一致性
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
/*------------------------------下面是账户管理模块(苏汇德)------------------------------*/
//用来充值的路由模块
router.put('/Recharge', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { userId,Amount} = req.body;//解析请求体
        if (!userId || !Amount || Amount <= 0) {//确保数据正常,否则返回错误
            return res.status(401).json({
                code: 401,
                message: '充值金额需要大于零且用户ID不能为空'
            });
        }
        //更改用户的余额
        await connection.query(`
            UPDATE users
                SET balance = balance + ?
                WHERE id = ?;
        `, [Amount,userId]);
        //查询用户的余额
        const [result] = await connection.query(
            'SELECT balance FROM users WHERE id = ?',
            [userId]
        );
        res.status(200).json({//成功返回余额
            code: 200,
            message: '充值成功',
            balance: result[0].balance
        });
    } catch (error) {//错误处理
        console.error('错误:', error);
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来获取用户信息的路由模块
router.get('/user/:userId', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const userId = req.params.userId;//从url获取id
        //数据库查询用户表通过id
        const [records] = await connection.query(`
            SELECT 
                u.id,
                u.name,
                u.phone,
                u.email,
                u.avatar_number,
                u.balance,
                u.vip_end_time,
                u.role
            FROM users u
            WHERE u.id = ?`,
            [userId]
        );
        return res.status(200).json({//成功返回用户信息
            code: 200,
            data: records,
            message: '查询成功'
        });
    } catch (error) {//错误处理
        console.error('获取信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//修改用户信息的路由模块
router.put('/userProfile/update', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { id,name,phone,email,avatar_number} = req.body;//解析请求体
        //数据库更新用户表,通过id
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

        return res.status(200).json({//成功返回
            code: 200,
            message: '成功',
            data: records,
        });
    } catch (error) {//错误处理
        console.error('错误:', error);
        if (connection) await connection.rollback();
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来获取用户所有订单的路由模块.
router.post('/usage-records/AllMy', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const carIds = req.body;//从请求体获取车辆id数组
        if (carIds.length === 0 || carIds.some(id => typeof id !== 'number' && typeof id !== 'string')) {//确保数据正常
            return res.status(400).json({
                code: 400,
                message: '无效的车辆ID参数'
            });
        }
        const [rows] = await connection.query(//根据车辆id获取使用记录并排序,待支付优先级最高
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
                ur.total_fee,
                cr.id AS comment_id
            FROM 
                usage_records ur
            LEFT JOIN comment_rating cr ON ur.id=cr.order_id
            WHERE 
                ur.vehicle_id IN (?)
            ORDER BY 
                CASE ur.status
                    WHEN 'to_be_paid' THEN 1
                    WHEN 'in_progress' THEN 2
                    WHEN 'booked' THEN 3
                    ELSE 4
                END
            `,
            [carIds]
          );
        return res.status(200).json({//成功返回数据
            code: 200,
            data: rows,
            message: '获取信息成功'
        });
    } catch (error) {//错误处理
        console.error('获取信息错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//用来充值vip的路由模块
router.put('/VIP', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { days,amount} = req.body;//解析请求体
        const myRole=req.user.role;
        const userId=req.user.userId;
        if (!amount || !days || Number(days <= 0)) {//确保数据正常,否则返回错误
            return res.status(401).json({
                code: 401,
                message: '天数或金额无效'
            });
        }
        // 检查余额
        const [user] = await connection.query(
            'SELECT balance FROM users WHERE id = ?', 
            [userId]
        );
        if (Number(user[0].balance) < Number(amount)) {
            return res.status(402).json({ 
                code: 402, 
                message: '余额不足' 
            });
        }
        // 开启事务
        await connection.beginTransaction();

        try {
            if (myRole === 'user') {
                await connection.query(`
                    UPDATE users 
                    SET 
                        balance = balance - ?,
                        role = 'VIPUser',
                        vip_end_time = DATE_ADD(NOW(), INTERVAL ? DAY)
                    WHERE id = ?`,
                    [amount, days, userId]
                );
            } else if (myRole === 'VIPUser') {
                await connection.query(`
                    UPDATE users 
                    SET 
                        balance = balance - ?,
                        vip_end_time = DATE_ADD(
                            COALESCE(vip_end_time, NOW()), 
                            INTERVAL ? DAY
                        )
                    WHERE id = ?`,
                    [amount, days, userId]
                );
            } else {
                throw new Error('无效的用户角色');
            }

            // 提交事务
            await connection.commit();

            // 获取更新后的用户数据
            const [[updatedUser]] = await connection.query(
                'SELECT balance, vip_end_time FROM users WHERE id = ?',
                [userId]
            );

            res.status(200).json({
                code: 200,
                data: {
                    newBalance: updatedUser.balance,
                    vipEndTime: updatedUser.vip_end_time
                },
                message: '充值成功'
            });
        } catch (error) {
            // 回滚事务
            await connection.rollback();
            throw error;
        }
    } catch (error) {//错误处理
        console.error('添加信息错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//注销申请
router.put('/for/cancellation', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const id = req.user.userId;//解析请求体
        //数据库更新用户表,通过id
        const [records] = await connection.query(`
            UPDATE users
            SET 
                status='to_be_cancelled'
            WHERE 
                id = ?;
        `, [id]);
        return res.status(200).json({//成功返回
            code: 200,
            message: '申请成功,您的帐号将在1-5个工作日注销',
            data: records,
        });
    } catch (error) {//错误处理
        console.error('错误:', error);
        if (connection) await connection.rollback();
        return res.status(500).json({ 
            code: 500, 
            message: '服务器内部错误' 
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
/*------------------------------下面是评价模块(张博)------------------------------*/
//创建评价的路由模块
router.post('/comment/rating', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { orderId, rating, comment } = req.body;//解析请求体
        const [orderRows] = await connection.query(//查询评价
            'SELECT * FROM comment_rating WHERE order_id = ?',
            [orderId]
        );
        if (orderRows.length > 0) {//如果存在评价返回错误
            return res.status(400).json({
                code: 400,
                message: '只能评价一次',
            });
        }
        const [rows] = await connection.query(//添加评论
            'INSERT INTO comment_rating (rating, comment, order_id) VALUES (?, ?, ?)',
            [rating, comment, orderId]
        );
        return res.status(201).json({//成功处理
            code: 201,
            message: '添加成功',
        });
    } catch (error) {//错误处理
        console.error('添加信息错误:', error);
        return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//获取该车位的评价
router.get('/getComment/rating/:id',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const pId = req.params.id;//从url获取车位id
        const [usageRecords] = await connection.query(//查询该车位的所有完成了的使用记录
            `SELECT * FROM usage_records 
            WHERE parking_space_id = ? 
            AND status = 'completed'`, 
            [pId]
        );
        if (usageRecords.length === 0) {//如果没有使用记录也不会有评价所以返回
            return res.status(404).json({
                code: 404,
                message: '该车位暂无使用记录'
            });
        }
        const orderIds = usageRecords.map(record => record.id);//提取订单id数组
        const [comments] = await connection.query(//查询包含订单id的评价,join操作连接几个表显示用户名字和头像让评价更完善.
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
        return res.status(200).json({//查询成功返回查询记录
            code: 200,
            data: comments,
            message: '查询成功'
        });
    } catch (error) {//错误处理
        console.error('错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);
//获取该用户的评价(基本同上)
router.get('/getComment/r/:userId',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const userId = req.params.userId;//从url获取id
        const [comments] = await connection.query(//查询评价表和一些数据
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
            WHERE u.id=?`,[userId]
        );
        if (comments.length === 0) {//没评价返回404
            return res.status(404).json({
                code: 404,
                message: '该用户暂无评价'
            });
        }
        return res.status(200).json({//成功返回查到的记录
            code: 200,
            data: comments,
            message: '查询成功'
        });
    } catch (error) {//错误处理
        console.error('错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误'
        });
    }finally {
        if (connection) await connection.end();//释放连接到连接池
    }
  }
);

module.exports = router;