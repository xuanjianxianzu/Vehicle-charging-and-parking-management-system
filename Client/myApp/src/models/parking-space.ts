export interface ParkingSpace {
    id:number;
    space_type:string;
    charging_rate:number;
    parking_rate:number;
    overtime_occupancy_rate:number;
    status:string;
    vehicle_id:number|null;
}
