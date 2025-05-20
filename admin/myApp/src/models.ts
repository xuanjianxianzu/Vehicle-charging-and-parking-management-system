export interface User {
    id: number;
    name: string | null;
    username: string;
    phone: string | null;
    email: string | null;
    role: string;
    avatar_number: number;
    balance: number;
    status:string;
    created_at: string;
    updated_at: string;
}

export interface Vehicle {
    id: number;
    license_plate: string;
    user_id: number;
    type: 'electric' | 'fuel';
    created_at: string;
    updated_at: string;
}

export interface comment {
    id:number;
    rating:number;
    comment:string|null;
    created_at:string;
    name:string|null;
    avatar_number:string;
}


export interface Booking {
    id: number;
    user_id: number;
    vehicle_id: number;
    parking_space_id: number;
    start_time: string;
    end_time: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
}

export interface ParkingSpaceType {
    id: number;
    type: string;
    rate: number;
    parking_rate: number;
    overtime_occupancy_rate: number;
    power: number;
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
    id:number;
    start_time: string;
    charging_start_time?: string | null;
    charging_complete_time?: string | null;
    end_time?: string | null;
    status: string;
    vehicle_id: number;
    parking_space_id: number;
    electricity_used: number | null;
    total_fee: number | null;
  }


export interface OrderDetail {
    name:number;
    username: string;
    phone: string | null;
    email: string | null;
    license_plate: string | null;
    rating: number|null;
    comment: string | null;
    created_at: string ;
}

export interface UserDetail {
    id:number;
    start_time: string;
    charging_start_time?: string | null;
    charging_complete_time?: string | null;
    end_time?: string | null;
    status: string;
    vehicle_id: number;
    parking_space_id: number;
    electricity_used: number | null;
    total_fee: number | null;
    rating:number | null;
    comment:string | null;
    created_at:string | null;
  }
