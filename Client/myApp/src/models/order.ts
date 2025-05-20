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
    comment_id:number|null;
}
