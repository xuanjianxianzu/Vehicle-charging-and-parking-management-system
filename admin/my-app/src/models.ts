// --------------------------- 基础类型定义 ---------------------------
export type DateTime = string; // 统一时间格式为 ISO 8601 字符串

// --------------------------- 用户相关接口 ---------------------------
/** 用户表（users） */
export interface User {
    id: number; // 用户ID（主键）
    name: string | null; // 姓名
    username: string; // 用户名（唯一）
    password: string; // 密码
    phone: string | null; // 电话
    email: string | null; // 邮箱
    role: 'user' | 'admin' | 'super_admin'; // 角色（枚举）
    avatar_number: number; // 头像编号（默认0）
    balance: number; // 账户余额（≥0）
    created_at: DateTime; // 创建时间
    updated_at: DateTime; // 更新时间
}

/** 车辆表（vehicles） */
export interface Vehicle {
    id: number; // 车辆ID（主键）
    license_plate: string; // 车牌号（唯一）
    user_id: number; // 所属用户ID（外键：users.id）
    type: 'electric' | 'fuel'; // 车辆类型（枚举）
    created_at: DateTime; // 创建时间
    updated_at: DateTime; // 更新时间
}

/** 评论表（comment_rating） */
export interface Comment {
    id: number; // 评论ID（主键）
    rating: number; // 评分（0-5，精确到0.1）
    comment: string | null; // 评论内容
    order_id: number; // 关联使用记录ID（外键：usage_records.id）
    created_at: DateTime; // 创建时间
    updated_at: DateTime; // 更新时间
}

/** 预订表（bookings） */
export interface Booking {
    id: number; // 预订ID（主键）
    user_id: number; // 预订用户ID（外键：users.id）
    vehicle_id: number; // 预订车辆ID（外键：vehicles.id）
    parking_space_id: number; // 预订车位ID（外键：parking_spaces.id）
    start_time: DateTime; // 预订开始时间
    end_time: DateTime; // 预订结束时间
    status: 'confirmed' | 'cancelled' | 'completed'; // 预订状态（枚举）
    created_at: DateTime; // 创建时间
}

// --------------------------- 车位相关接口 ---------------------------
/** 车位类型表（parking_space_types） */
export interface ParkingSpaceType {
    id: number; // 类型ID（主键）
    type: 'fast_charging' | 'slow_charging' | 'normal'; // 类型名称（枚举）
    rate: number; // 充电费率（元/度）
    parking_rate: number; // 停车费率（元/小时）
    overtime_occupancy_rate: number; // 超时占用费率（元/分钟）
    power: number; // 充电功率（KW）
    created_at: DateTime; // 创建时间
    updated_at: DateTime; // 更新时间
}

/** 车位表（parking_spaces） */
export interface ParkingSpace {
    id: number; // 车位ID（主键）
    type_id: number; // 类型ID（外键：parking_space_types.id）
    status: SpaceStatus; // 状态（枚举）
    vehicle_id: number | null; // 占用车辆ID（外键：vehicles.id，可为空）
    created_at: DateTime; // 创建时间
    updated_at: DateTime; // 更新时间

    // 关联字段（通过 JOIN 获取，非本表直接字段）
    typeInfo?: ParkingSpaceType; // 车位类型详情
    vehicleInfo?: Vehicle; // 占用车辆详情（当 status 为 occupied/booked 时存在）
}

/** 使用记录表（usage_records） */
export interface UsageRecord {
    id: number; // 记录ID（主键）
    start_time: DateTime; // 开始时间
    charging_start_time: DateTime | null; // 充电开始时间（可为空）
    charging_complete_time: DateTime | null; // 充电完成时间（可为空）
    end_time: DateTime | null; // 结束时间（可为空）
    status: 'in_progress' | 'completed' | 'booked' | 'cancelled' | 'end_booked' | 'to_be_paid'; // 状态（枚举）
    vehicle_id: number; // 车辆ID（外键：vehicles.id）
    parking_space_id: number; // 车位ID（外键：parking_spaces.id）
    electricity_used: number | null; // 用电量（度，可为空）
    total_fee: number | null; // 总费用（元，可为空）
    parking_minutes: number; // 虚拟字段：停车总分钟数（自动计算）
    overtime_minutes: number; // 虚拟字段：超时分钟数（自动计算）
    created_at: DateTime; // 创建时间
    updated_at: DateTime; // 更新时间

    // 关联字段（通过 JOIN 获取）
    vehicleInfo?: Vehicle; // 车辆详情
    parkingSpaceInfo?: ParkingSpace; // 车位详情
    comments?: Comment[]; // 关联的评论（通过 order_id 关联）
}

// --------------------------- 管理端页面专用接口 ---------------------------
/** 用户详情页面完整接口（包含关联数据） */
export interface UserDetail extends User {
    vehicles: Vehicle[]; // 用户拥有的所有车辆
    usageRecords: UsageRecord[]; // 用户的所有使用记录（通过车辆关联）
    bookings: Booking[]; // 用户的所有预订记录
    comments: Comment[]; // 用户发表的所有评论（通过使用记录关联）
}

/** 车位详情页面完整接口（包含关联数据） */
export interface ParkingSpaceDetail extends ParkingSpace {
    typeDetail: ParkingSpaceType; // 车位类型详情（直接关联）
    usageRecords: UsageRecord[]; // 该车位的所有使用记录
    bookings: Booking[]; // 该车位的所有预订记录
    currentVehicle: Vehicle | null; // 当前占用车辆（当 status 非 idle 时存在）
}

//枚举
export enum SpaceStatus {
  IDLE = 'idle',
  OCCUPIED = 'occupied',
  BOOKED = 'booked'
}