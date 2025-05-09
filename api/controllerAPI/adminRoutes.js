const express = require('express');
const router = express.Router();
const dbcon = require('../models/connection_database');
const jwt = require('jsonwebtoken');
const { adminAuth } = require('../middleware/auth'); // 新增权限中间件
 
// 管理员权限中间件（需单独创建）
router.use(adminAuth);
 
// 获取所有用户列表（管理端）
router.get('/users', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const [rows] = await connection.query('SELECT id, username, balance, created_at FROM users');
    res.status(200).json({
      code: 200,
      data: rows,
      message: '获取用户列表成功'
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  } finally {
    if (connection) await connection.end();
  }
});
 
// 强制用户下线（示例）
router.post('/users/:userId/logout', async (req, res) => {
  // 实现逻辑：清除用户session/token等
  res.status(200).json({ message: '用户强制下线功能待实现' });
});
 
// 车位管理接口
router.get('/parking-spaces', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        ps.id,
        pst.type AS space_type,
        ps.status,
        ps.vehicle_id
      FROM parking_spaces ps
      LEFT JOIN parking_space_types pst ON ps.type_id = pst.id
    `);
    res.status(200).json({
      code: 200,
      data: rows,
      message: '获取车位列表成功'
    });
  } catch (error) {
    console.error('获取车位列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  } finally {
    if (connection) await connection.end();
  }
});
 
// 更新车位状态（示例）
router.put('/parking-spaces/:id/status', async (req, res) => {
  const { status } = req.body;
  let connection;
  try {
    connection = await dbcon.getConnection();
    const [result] = await connection.query(
      'UPDATE parking_spaces SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.status(200).json({
      code: 200,
      message: '车位状态更新成功',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('更新车位状态错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  } finally {
    if (connection) await connection.end();
  }
});
 
module.exports = router;