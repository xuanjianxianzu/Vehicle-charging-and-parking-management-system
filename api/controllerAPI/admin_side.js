const express = require('express');
const router = express.Router();
const dbcon = require('../models/admin_connection_database')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
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
                message: 'User not found'
            });
        }

        const loginUser = rows[0];

        console.log(password, loginUser.password);

        const isMatch = await bcrypt.compare(password, loginUser.password);

        console.log(isMatch);

        if (!isMatch) {
            return res.status(401).json({
                code: 401,
                message: 'Invalid username or password'
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
            message: 'Login successful'
        });
    
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ code: 500, message: 'Internal server error' });

    } finally {
        if (connection) {
            await connection.end();
        }
    }
});


router.post('/register', async (req, res) => {
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
                message: 'Username already exists'
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
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error'
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});




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


        return res.status(200).json({
            code: 200,
            data: rows,
            message: 'Success'
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error'
        });
    } finally {
        if (connection) await connection.end();
    }
});


// 获取所有车位类型
router.get('/parking-space-types', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const [types] = await connection.query(`SELECT * FROM parking_space_types`);
    res.status(200).json({
      code: 200,
      data: types,
      message: 'Parking space types retrieved successfully'
    });
  } catch (err) {
    console.error('The type of parking space obtained is incorrect:', err);
    res.status(500).json({
      code: 500,
      message: 'Server error',
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
        message: 'Parking space type not found'
      });
    }
    res.status(200).json({
      code: 200,
      data: types[0],
      message: 'Parking space type retrieved successfully'
    });
  } catch (err) {
    console.error('The type of parking space obtained is incorrect:', err);
    res.status(500).json({
      code: 500,
      message: 'Server error',
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

    // 1. Query parking space basic info and type (unchanged)
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
      return res.status(404).json({ code: 404, message: 'Parking space not found' });
    }

    const parkingSpace = spaceResults[0];

    // 2. Query current occupied vehicle (unchanged)
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

    // 3. Query usage records and bookings (remove invalid fields)
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

    // 4. Query parking space comments (unchanged)
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

    // 5. Build response (adjust bookings field mapping)
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
      message: 'Parking space details retrieved successfully' 
    });

  } catch (err) {
    console.error('Server error:', err); // Should print full error stack here
    res.status(500).json({ 
      code: 500, 
      message: 'Internal server error', 
      details: err.message // Hide detailed errors in production environment
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Update parking space information (supports status, type, and occupied vehicle updates)
router.put('/parking-spaces/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const spaceId = req.params.id;
    const updateData = req.body;

    // Check if parking space exists
    const [spaceCheck] = await connection.query(`
      SELECT id FROM parking_spaces WHERE id = ?
    `, [spaceId]);

    if (spaceCheck.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Parking space not found'
      });
    }

    // Build update fields
    const fieldsToUpdate = [];
    const values = [updateData.status, updateData.type_id, updateData.vehicle_id, spaceId];
    
    // Status, type, and occupied vehicle are updatable fields
    fieldsToUpdate.push('status = ?');
    if (updateData.type_id !== undefined) fieldsToUpdate.push('type_id = ?');
    if (updateData.vehicle_id !== undefined) fieldsToUpdate.push('vehicle_id = ?');
    fieldsToUpdate.push('updated_at = NOW()');

    // Execute update
    const [result] = await connection.query(`
      UPDATE parking_spaces 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE id = ?
    `, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Update failed, no valid data changes'
      });
    }

    // Return updated parking space details
    const [updatedSpace] = await connection.query(`
      SELECT * FROM parking_spaces WHERE id = ?
    `, [spaceId]);

    res.status(200).json({
      code: 200,
      data: updatedSpace[0],
      message: 'Parking space information updated successfully'
    });

  } catch (err) {
    console.error('Parking space update error:', err);
    res.status(500).json({
      code: 500,
      message: 'Server error',
      details: err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// GET /admin/users - Get all users with statistics
router.get('/users', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection(); // Get database connection
    
    // Corrected SQL query (ensure fields exist)
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
 
    res.status(200).json({  // Explicitly return status code
      code: 200,
      data: results,
      message: 'Success'
    });
  } catch (err) {
    console.error('User query error:', err);
    res.status(500).json({
      code: 500,
      message: 'Server error',
      details: err.message  // Return specific error message
    });
  } finally {
    if (connection) await connection.end();
  }
});
 
// GET /admin/users/:id - Get complete user details
router.get('/users/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
         console.log('aaaaaa1')
    // Query user basic information
    const [userResults] = await connection.query(`
      SELECT * FROM users WHERE id = ?
    `, [req.params.id]);
    
    if (userResults.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'User not found'
      });
    }
    
    const user = userResults[0];
    
    // Query user's vehicles
    const [vehicleResults] = await connection.query(`
      SELECT * FROM vehicles WHERE user_id = ?
    `, [req.params.id]);
    
    // Query user's usage records (with associated information)
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
    
    // Query user's booking records (with associated information)
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
    
    // Query user's comments
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
    
    // Build complete user details object
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
      message: 'Success'
    });
  } catch (err) {
    console.error('Get user details error:', err);
    res.status(500).json({
      code: 500,
      message: 'Server error',
      details: err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});


 
router.delete('/vehicles/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const vehicleId = req.params.id;

    // 1. Check if vehicle exists
    const [vehicleCheck] = await connection.query(
      'SELECT id FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    if (vehicleCheck.length === 0) {
      return res.status(404).json({ code: 404, message: 'Vehicle not found' });
    }

    // 2. Check for active orders
    const [activeOrders] = await connection.query(`
      SELECT id FROM usage_records 
      WHERE vehicle_id = ? 
      AND status IN ('in_progress', 'booked', 'to_be_paid')
    `, [vehicleId]);

    if (activeOrders.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: 'Active orders exist for the vehicle. Please complete or cancel orders first' 
      });
    }

    // 3. Delete vehicle (database handles foreign keys with SET NULL)
    await connection.query('DELETE FROM vehicles WHERE id = ?', [vehicleId]);

    res.status(200).json({ 
      code: 200, 
      message: 'Vehicle deleted successfully', 
      data: { vehicleId }
    });

  } catch (err) {
    console.error('Vehicle deletion error:', err);
    res.status(500).json({ code: 500, message: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});

router.delete('/bookings/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const bookingId = req.params.id;

    // 1. Check if booking exists
    const [bookingCheck] = await connection.query(
      'SELECT id FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookingCheck.length === 0) {
      return res.status(404).json({ code: 404, message: 'Booking not found' });
    }

    // 2. Check booking status
    const [activeBooking] = await connection.query(
      'SELECT status FROM bookings WHERE id = ? AND status = "confirmed"',
      [bookingId]
    );

    if (activeBooking.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: 'Cannot delete confirmed booking. Please cancel first' 
      });
    }

    // 3. Delete booking
    await connection.query('DELETE FROM bookings WHERE id = ?', [bookingId]);

    res.status(200).json({ 
      code: 200, 
      message: 'Booking deleted successfully', 
      data: { bookingId }
    });

  } catch (err) {
    console.error('Booking deletion error:', err);
    res.status(500).json({ code: 500, message: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});


router.delete('/usage-records/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const recordId = req.params.id;

    // 1. Check if usage record exists
    const [recordCheck] = await connection.query(
      'SELECT id FROM usage_records WHERE id = ?',
      [recordId]
    );

    if (recordCheck.length === 0) {
      return res.status(404).json({ code: 404, message: 'Usage record not found' });
    }

    // 2. Check record status
    const [activeRecord] = await connection.query(
      'SELECT status FROM usage_records WHERE id = ? AND status = "in_progress"',
      [recordId]
    );

    if (activeRecord.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: 'Cannot delete in-progress usage record' 
      });
    }

    // 3. Delete usage record (cascade deletes comments via foreign key)
    await connection.query('DELETE FROM usage_records WHERE id = ?', [recordId]);

    res.status(200).json({ 
      code: 200, 
      message: 'Usage record deleted successfully', 
      data: { recordId }
    });

  } catch (err) {
    console.error('Usage record deletion error:', err);
    res.status(500).json({ code: 500, message: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});

router.delete('/comments/:id', async (req, res) => {
  let connection;
  try {
    connection = await dbcon.getConnection();
    const commentId = req.params.id;

    // 1. Check if comment exists
    const [commentCheck] = await connection.query(
      'SELECT id FROM comment_rating WHERE id = ?',
      [commentId]
    );

    if (commentCheck.length === 0) {
      return res.status(404).json({ code: 404, message: 'Comment not found' });
    }

    // 2. Delete comment
    await connection.query('DELETE FROM comment_rating WHERE id = ?', [commentId]);

    res.status(200).json({ 
      code: 200, 
      message: 'Comment deleted successfully', 
      data: { commentId }
    });

  } catch (err) {
    console.error('Comment deletion error:', err);
    res.status(500).json({ code: 500, message: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});
 

 
module.exports = router;
