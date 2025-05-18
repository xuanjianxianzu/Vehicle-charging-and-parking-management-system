-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: vehicle_charging_parking
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `usage_records`
--

DROP TABLE IF EXISTS `usage_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usage_records` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `charging_start_time` datetime DEFAULT NULL COMMENT '充电开始时间',
  `charging_complete_time` datetime DEFAULT NULL COMMENT '充电完成时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `status` enum('in_progress','completed','booked','cancelled','end_booked','to_be_paid') NOT NULL DEFAULT 'in_progress' COMMENT '状态',
  `vehicle_id` int NOT NULL COMMENT '车辆ID',
  `parking_space_id` int NOT NULL COMMENT '车位ID',
  `electricity_used` decimal(10,2) DEFAULT NULL COMMENT '用电量（度）',
  `total_fee` decimal(10,2) DEFAULT NULL COMMENT '总费用（元）',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `parking_minutes` int GENERATED ALWAYS AS (timestampdiff(MINUTE,`start_time`,`end_time`)) VIRTUAL,
  `overtime_minutes` int GENERATED ALWAYS AS ((case when (`charging_complete_time` is not null) then greatest((timestampdiff(MINUTE,`charging_complete_time`,`end_time`) - 60),0) else 0 end)) VIRTUAL,
  PRIMARY KEY (`id`),
  KEY `parking_space_id` (`parking_space_id`),
  KEY `idx_usage_records` (`vehicle_id`,`parking_space_id`,`status`),
  KEY `idx_status_ps_vehicle` (`status`,`parking_space_id`,`vehicle_id`),
  CONSTRAINT `usage_records_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usage_records_ibfk_2` FOREIGN KEY (`parking_space_id`) REFERENCES `parking_spaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_charging_sequence` CHECK ((((`charging_start_time` is null) and (`charging_complete_time` is null)) or (`charging_start_time` < `charging_complete_time`))),
  CONSTRAINT `chk_status` CHECK ((((`status` = _utf8mb4'in_progress') and (`end_time` is null)) or ((`status` in (_utf8mb4'completed',_utf8mb4'cancelled',_utf8mb4'booked',_utf8mb4'end_booked',_utf8mb4'to_be_paid')) and (`end_time` is not null)))),
  CONSTRAINT `chk_time_logic` CHECK (((`start_time` < `end_time`) and ((`charging_start_time` is null) or (`charging_start_time` >= `start_time`)) and ((`charging_complete_time` is null) or (`charging_complete_time` <= `end_time`))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usage_records`
--

LOCK TABLES `usage_records` WRITE;
/*!40000 ALTER TABLE `usage_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `usage_records` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-16 14:29:17
