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
    charging_rate:number;
    parking_rate:number;
    overtime_occupancy_rate:number;
    status:string;
    vehicle_id:number|null;
}
