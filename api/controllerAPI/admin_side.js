const express = require('express');
const router = express.Router();
const dbcon = require('../models/admin_connection_database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


/*------------------------------下面是管理端的登录注册模块(张博)------------------------------*/
//用来登陆的路由处理模块
router.post('/login', async (req, res) => {
    let connection;
    try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { username, password } = req.body;//解析请求体获取账号密码
        //查询通过账号用户信息,角色是管理员或超级管理员
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = ? AND role IN ('admin','super_admin')`, [username]);
        if (rows.length === 0) {//没找到用户返回404
            return res.status(404).json({
                code: 404,
                message: 'User not found'
            });
        }
        const loginUser = rows[0];//将找到的用户数据赋值给loginUser
        const isMatch = await bcrypt.compare(password, loginUser.password);//比较哈希后的密码和获取的密码
        if (!isMatch) {//比较不同密码错误,返回错误401
            return res.status(401).json({
                code: 401,
                message: 'Invalid username or password'
            });
        }
        const token = jwt.sign(//生成3小时的令牌包含一些信息
            { userId: loginUser.id, username: loginUser.username,role:loginUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );
        return res.status(200).json({//成功返回令牌和一些信息
            code: 200,
            data: {
                id: loginUser.id,
                username: loginUser.username,
                role: loginUser.role,
                token: token,
                expiresIn: 3600
            },
            message: 'Login successful'
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
//用来注册的路由模块
router.post('/register', async (req, res) => {
    let connection;
    try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
        const { role,username, password } = req.body;//从请求体解析字段
        const myRole=req.user.role;//从中间件获取我的角色
        if(myRole!=='super_admin'){//只有超级管理员可以注册
           return res.status(401).json({
            code: 401,
            message: '权限不够'
        });
        }
        const [rows] = await connection.query(`SELECT * FROM users WHERE username = ?`, [username]);//数据库查询用户表通过账号
        if (rows.length > 0) {//如果已有账号返回409账号重复
            return res.status(409).json({
                code: 409,
                message: 'Username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);//将传来的密码哈希处理
        //数据库插入新用户
        const [result] = await connection.query(`INSERT INTO users (username, password, role) VALUES (?, ?,?)`, [username, hashedPassword,role]);
        const newUserId = result.insertId;//获取自增的id
        //查询新用户
        const [newUserRows] = await connection.query(`SELECT id, username, created_at FROM users WHERE id = ?`, [newUserId]);
        const newUser = newUserRows[0];//将新用户赋值给newUser
        return res.status(201).json({//返回必要信息和201码
            code: 201,
            data: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.created_at
            },
            message: 'Registration successful'
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
/*------------------------------下面是管理端的用户管理模块(苏汇德)------------------------------*/
//用来获取所有用户的路由模块
router.get('/users', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();//从数据库连接池获取连接
    //数据库查询用户表
    const [results] = await connection.query(`
        SELECT * FROM users
    `);
    res.status(200).json({//返回状态码和查询的用户记录
      code: 200,
      data: results,
      message: '成功'
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
//用来修改用户状态的路由模块
router.put('/users/status', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();//从数据库连接池获取连接
    const {userId,status} = req.body;//解析请求体中的字段
    const myRole=req.user.role;//从中间件获取用户角色
if (myRole === 'super_admin') {//当用户是超管时可以编辑除超管的所有角色的状态
      [result] = await connection.query(`
        UPDATE users
        SET status = ?
        WHERE id = ?
        AND role IN ('admin','user','VIPUser')
      `, [status, userId]);
    } else {//当用户是管理时只能改用户的状态
      [result] = await connection.query(`
        UPDATE users
        SET status = ?
        WHERE id = ?
        AND role IN ('user', 'VIPUser')
      `, [status, userId]);
    }
    if (result.affectedRows === 0) {//没有修改数据时用户不存在或者权限不够,返回状态码
      return res.status(403).json({
        code: 403,
        message: '用户不存在或无权修改'
      });
    }
    res.status(200).json({//成功时返回信息
      code: 200,
      data: result,
      message: '成功'
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
//查询用户的使用记录等详情的路由模块
router.get('/users/:id',async (req,res) =>{
  let connection;
  try {
    connection = await dbcon.getConnection();//从数据库连接池获取连接
    const id = req.params.id;//从url获取id
    const [userDetailed] = await connection.query(//联表查询通过用户id查询车牌号
          `SELECT
            v.id,
            v.license_plate
          FROM users u
          INNER JOIN vehicles v ON u.id = v.user_id
          WHERE u.id = ?`,[id]
      );
       const [userDetailed2] = await connection.query(//联表查询,查询用户的所有使用记录
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
            cr.rating,
            cr.comment,
            cr.created_at
          FROM users u
          INNER JOIN vehicles v ON u.id = v.user_id
          INNER JOIN usage_records ur ON v.id = ur.vehicle_id
          LEFT JOIN comment_rating cr ON ur.id = cr.order_id
          WHERE u.id = ?`,[id]
      );
      return res.status(200).json({//成功查询返回两个信息
          code: 200,
          data: userDetailed,
          data2:userDetailed2,
          message: '查询成功'
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
//用来删除用户的路由模块
router.delete('/user/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();//从数据库连接池获取连接
    const userId = req.params.id;
    const myRole=req.user.role;//从中间件获取用户角色
    if (myRole === 'super_admin') {//当用户是超管时可以删除除超管的所有角色
      [result] = await connection.query(`
        DELETE FROM users
        WHERE id = ?
        AND role IN ('admin','user','VIPUser')
      `, [userId]);
    } else {//当用户是管理时只能删除用户
      [result] = await connection.query(`
        DELETE FROM users
        WHERE id = ?
        AND role IN ('user', 'VIPUser')
      `, [userId]);
    }
    if (result.affectedRows === 0) {//没有删除数据时用户不存在或者权限不够,返回状态码
      return res.status(403).json({
        code: 403,
        message: '用户不存在或无权修改'
      });
    }

      return res.status(200).json({//成功返回
          code: 200,
          message: '删除成功',
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
//用于修改用户的数据的路由模块
router.put('/user/details', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();//从数据库连接池获取连接
    const myRole=req.user.role;//获取中间件存入user的角色
    const {id,name,username,phone,email,role,avatar_number,balance,status} = req.body.user;//解析请求体中的对象
      if(role=='super_admin'){//不能修改超级管理员的详情
        return res.status(403).json({
        code: 403,
        message: '无权修改'
      });
    }else if(role=='admin'&&myRole=='admin'){//管理员不能修改管理员的详情
        return res.status(403).json({
        code: 403,
        message: '无权修改'
      });
    }else{//其他情况数据库修改用户表
      [result] = await connection.query(`
        UPDATE users
        SET 
          name = ?,
          username = ?,
          phone = ?,
          email = ?,
          role = ?,
          avatar_number = ?,
          balance = ?,
          status=?
        WHERE id = ?
        AND role IN ('admin','user','VIPUser')
      `, [name,username,phone,email,role,avatar_number,balance,status,id]);
    }
    res.status(200).json({//成功响应返回数据
      code: 200,
      data: result,
      message: '成功'
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
      const userId = req.params.userId;//从url获取用户id
      //数据库查询用户的这些字段通过id
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
      return res.status(200).json({//成功响应返回响应码和数据
          code: 200,
          data: records,
          message: '查询成功'
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
//用于修改用户信息的路由模块
router.put('/userProfile/update', async (req, res) => {
  let connection;
  try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
      const { id,name,phone,email,avatar_number} = req.body;//从请求体获取字段
      //根据id更新这些字段
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
      return res.status(200).json({//成功响应
          code: 200,
          message: '成功',
          data: records,
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
/*------------------------------下面是管理端的车位管理模块(刘烨轩)------------------------------*/
//获取车位信息的路由模块
router.get('/parking-spaces', async (req, res) => {
    let connection;
    try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
      //连表查询车位信息和相关信息,并排序
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
        return res.status(201).json({//成功处理
            code: 201,
            data: rows,
            message: 'Success'
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
//释放该车位的路由模块,将订单结束
router.put('/release-space', async (req, res) => {
  let connection;
  try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
      const { spaceId,status} = req.body;//从请求体解析字段
      //根据车位id查询是否有使用或预定中的订单
      const [userRows] = await connection.query(`SELECT * FROM usage_records WHERE parking_space_id=? AND status IN('in_progress', 'booked')`, [spaceId]);
      if (userRows.length === 0) {//没有订单说明车位没有被占用
          return res.status(404).json({
              code: 404,
              message: '没有需要释放的订单'
          });
      }
      const id = userRows[0].id;//提取订单中的id
      if(status=='occupied'){//当状态是占用时
        const chargingStart = userRows.map(row => row.charging_start_time);//查看订单是否有充电开始时间
        if(chargingStart[0]!==null){//有充电开始时间将充电结束时间和结束时间设为充电开始时间加一分钟
          await connection.query(`
            UPDATE usage_records
            SET   
              charging_complete_time = charging_start_time + INTERVAL 1 MINUTE,
              end_time = charging_start_time + INTERVAL 1 MINUTE,
            status = 'completed'
            WHERE id = ?
            `, [id]);
        }else{//没有充电开始时间直接结束,结束时间设为开始时间加一分钟
          await connection.query(`
            UPDATE usage_records
            SET   
              end_time = start_time + INTERVAL 1 MINUTE,
              status = 'completed'
            WHERE id = ?
            `, [id]);
        }
      }else{//其他情况应该是booked,预定状态带有结束时间,直接将状态改成取消预约
        await connection.query(`
          UPDATE usage_records
          SET   
            status = 'cancelled'
          WHERE id = ?
        `, [id]);
      }
      return res.status(200).json({//成功返回
        code: 200,
        message: '成功',
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
//更改车位的类型
router.put('/updatePSpace', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();//从数据库连接池获取连接
    const { id,typeId } = req.body;//从请求体解析字段
    //根据类型id和id更新车位表
    const [result] = await connection.query(`
      UPDATE parking_spaces 
      SET 
      type_id = ?
      WHERE id = ?
    `, [typeId, id]);
    res.status(200).json({//成功响应
      code: 200,
      data: result,
      message: '成功'
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
//删除车位
router.delete('/deleteSpace/:id', async (req, res) => {
  let connection;
  try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
      const spaceId = req.params.id;//从url提取车位id
      await connection.query(//通过id删除车位
          'DELETE FROM parking_spaces WHERE id = ?',
          [spaceId]
      );
      return res.status(200).json({//成功响应
          code: 200,
          message: '删除成功',
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
//添加新车位
router.post('/addNewSpace', async (req, res) => {
  let connection;
  try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
      //插入typeid类型的车位
      const [result] = await connection.query(`
        INSERT INTO parking_spaces (type_id) 
        VALUES 
          (?)
        `, [typeId]);
      res.status(200).json({//成功响应
        code: 200,
        data: result,
        message: '成功'
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
/*------------------------------下面是管理端的车位类型管理模块(张博)------------------------------*/
//获取车位类型表的路由模块
router.get('/parking-spaces-type', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        //查询数据库的停车类型表
          const [rows] = await connection.query(`
          SELECT * FROM parking_space_types;
        `);
        return res.status(201).json({//成功返回
            code: 201,
            data: rows,
            message: '成功'
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
//修改车位类型的信息的路由模块
router.put('/spaceType', async (req, res) => {
  let connection;
  try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
      const { type, rate,parking_rate,overtime_occupancy_rate,power} = req.body.PST;//解析请求体
      //更新车辆类型表
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
      res.status(200).json({//成功响应
        code: 200,
        data: result,
        message: '成功'
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
/*------------------------------下面是管理端的使用记录管理模块(杨佳龙)------------------------------*/
//插入一条使用记录的路由模块,用来维护车位
router.post('/usage-records', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        await connection.beginTransaction();//开启事务
        const {start_time,charging_start_time,charging_complete_time,end_time,status,parking_space_id} = req.body.usageRecords;//解析请求体中的对象
        const formatTime = (timeStr) => timeStr?.slice(0, 19).replace('T', ' ') || null;//用来处理时间格式
        for (let vehicleId = 1; vehicleId <= 50; vehicleId++){//循环前五十个车辆id
          try {
                const [existing] = await connection.query(//查找是否有未使用的占位车辆
                    `SELECT id
                    FROM usage_records
                    WHERE vehicle_id = ?
                    AND end_time IS NULL;`,
                    [vehicleId]
                );
                if (existing.length > 0) {//当车辆id被占用
                    continue;//跳过占用的车辆
                }
                const [result] = await connection.query(//将没占用的车辆插入使用记录
                    `INSERT INTO usage_records (
                        start_time, 
                        charging_start_time, 
                        charging_complete_time, 
                        end_time, 
                        status, 
                        vehicle_id, 
                        parking_space_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        formatTime(start_time),
                        formatTime(charging_start_time),
                        formatTime(charging_complete_time),
                        formatTime(end_time),
                        status,
                        vehicleId,
                        parking_space_id
                    ]
                );
                await connection.commit();//提交事务
                return res.status(201).json({//成功创建记录
                    code: 201,
                    data: { id: result.insertId, vehicle_id: vehicleId },
                    message: '使用记录创建成功'
                });
            } catch (insertError) {//错误处理
                await connection.rollback();//错误回滚事务
                continue;//插入错误时跳过
            }
        }
        return res.status(409).json({//没有车辆可用时返回错误响应
            code: 409,
            message: '所有车辆（1-50号）均不可用'
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
//查询所有订单
router.get('/Order/All',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const [order] = await connection.query(//查询使用记录表包括他的虚拟列
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
                ur.parking_minutes,
                ur.overtime_minutes
            FROM usage_records ur`,
        );
        return res.status(200).json({//成功响应
            code: 200,
            data: order,
            message: '查询成功'
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
//获取订单关联的用户等信息
router.get('/Order/detailed/:id',async (req,res) =>{
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const id = req.params.id;
        const [orderDetailed] = await connection.query(//联表查询用户车辆评价等和订单有关的详情
            `SELECT
              u.name,
              u.username,
              u.phone,
              u.email,
              v.license_plate,
              cr.rating,
              cr.comment,
              cr.created_at
            FROM usage_records ur
            LEFT JOIN comment_rating cr ON ur.id = cr.order_id
            INNER JOIN vehicles v ON ur.vehicle_id = v.id
            INNER JOIN users u ON v.user_id = u.id
            WHERE ur.id = ?`,[id]
        );
        return res.status(200).json({//成功响应并返回查询的信息
            code: 200,
            data: orderDetailed,
            message: '查询成功'
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

router.delete('/deleteOrder/:id', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const orderId = req.params.id;//从url获取订单id
        await connection.query(//删除这个id的订单
            'DELETE FROM usage_records WHERE id = ?',
            [orderId]
        );
        return res.status(200).json({//成功响应
            code: 200,
            message: '删除成功',
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
/*------------------------------下面是管理端的评价模块(张博)------------------------------*/
//获取评价的路由模块
router.get('/getComment/rating',async (req,res) =>{
    let connection;
    try {
      connection = await dbcon.getConnection();//从数据库连接池获取连接
        const [comments] = await connection.query(//查询所有的评论并联表查询他的用户名字等相关信息
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
        return res.status(200).json({//返回响应
            code: 200,
            data: comments,
            message: '查询成功'
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
//删除评价的路由模块
router.delete('/deleteComment/:id', async (req, res) => {
    let connection;
    try {
        connection = await dbcon.getConnection();//从数据库连接池获取连接
        const commentId = req.params.id;//从url获取评价id
        await connection.query(//通过id删除评价
            'DELETE FROM comment_rating WHERE id = ?',
            [commentId]
        );
        return res.status(200).json({//成功响应
            code: 200,
            message: '删除成功',
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

module.exports = router;//导出路由模块
