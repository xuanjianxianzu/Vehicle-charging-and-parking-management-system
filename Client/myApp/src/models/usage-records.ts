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