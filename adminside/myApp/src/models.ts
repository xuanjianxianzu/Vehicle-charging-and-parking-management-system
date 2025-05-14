export interface comment {
    rating:number;
    comment:string|null;
    created_at:string;
    name:string|null;
    avatar_number:string;
}

export interface Order {
    id:number;
    start_time:string;
    charging_start_time:string|null;
    charging_complete_time:string|null;
    end_time:string|null;
    status:string;
    vehicle_id:number;
    parking_space_id:number;
    electricity_used:number|null;
    total_fee:number|null;
}


export interface ParkingSpace {
    id:number;
    space_type:string;
    status:string;
    vehicle_id:number|null;
    license_plate:string|null;
    name:string|null;
}



export interface UsageRecords {
    startTime: string;
    chargingStartTime?: string | null;
    chargingCompleteTime?: string | null;
    endTime?: string | null;
    status: string;
    vehicleId: number;
    parkingSpaceId: number;
   //electricityUsed?: number | null;
   //totalFee?: number | null;
   //parkingMinutes?: number; // 虚拟列：停车分钟数
   //overtimeMinutes?: number; // 虚拟列：超时分钟数
  }

export interface User {
    id: number;
    name: string | null;
    username: string;
    phone: string | null;
    email: string | null;
    role: string;
    avatar_number: number;
    balance: number;
    created_at: string;
    updated_at: string;
}



export interface Vehicle {
    id:number;
    license_plate:string;
    user_id:number;
    type:string;
}
