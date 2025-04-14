export interface UsageRecords {
    startTime: Date | string;
    chargingStartTime?: Date | string | null;
    chargingCompleteTime?: Date | string | null;
    endTime?: Date | string | null;
    status: string;
    vehicleId: number;
    parkingSpaceId: number;
   //electricityUsed?: number | null;
   //totalFee?: number | null;
   //parkingMinutes?: number; // 虚拟列：停车分钟数
   //overtimeMinutes?: number; // 虚拟列：超时分钟数
  }