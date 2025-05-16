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
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '车辆ID',
  `license_plate` varchar(20) NOT NULL COMMENT '车牌号',
  `user_id` int NOT NULL COMMENT '用户ID',
  `type` enum('electric','fuel') NOT NULL COMMENT '车辆类型',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'占位车牌1',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(2,'占位车牌2',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(3,'占位车牌3',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(4,'占位车牌4',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(5,'占位车牌5',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(6,'占位车牌6',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(7,'占位车牌7',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(8,'占位车牌8',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(9,'占位车牌9',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(10,'占位车牌10',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(11,'占位车牌11',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(12,'占位车牌12',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(13,'占位车牌13',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(14,'占位车牌14',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(15,'占位车牌15',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(16,'占位车牌16',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(17,'占位车牌17',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(18,'占位车牌18',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(19,'占位车牌19',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(20,'占位车牌20',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(21,'占位车牌21',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(22,'占位车牌22',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(23,'占位车牌23',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(24,'占位车牌24',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(25,'占位车牌25',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(26,'占位车牌26',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(27,'占位车牌27',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(28,'占位车牌28',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(29,'占位车牌29',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(30,'占位车牌30',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(31,'占位车牌31',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(32,'占位车牌32',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(33,'占位车牌33',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(34,'占位车牌34',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(35,'占位车牌35',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(36,'占位车牌36',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(37,'占位车牌37',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(38,'占位车牌38',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(39,'占位车牌39',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(40,'占位车牌40',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(41,'占位车牌41',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(42,'占位车牌42',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(43,'占位车牌43',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(44,'占位车牌44',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(45,'占位车牌45',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(46,'占位车牌46',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(47,'占位车牌47',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(48,'占位车牌48',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(49,'占位车牌49',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24'),(50,'占位车牌50',1,'electric','2025-05-16 14:28:24','2025-05-16 14:28:24');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
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
