/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: agrilink
-- ------------------------------------------------------
-- Server version	10.11.13-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `assigned_to` bigint(20) unsigned DEFAULT NULL,
  `delivery_address` text NOT NULL,
  `scheduled_date` timestamp NULL DEFAULT NULL,
  `delivered_date` timestamp NULL DEFAULT NULL,
  `status` enum('assigned','in_transit','delivered','failed','returned') NOT NULL DEFAULT 'assigned',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `tracking_number` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deliveries_tracking_number_unique` (`tracking_number`),
  KEY `deliveries_order_id_foreign` (`order_id`),
  KEY `deliveries_assigned_to_status_index` (`assigned_to`,`status`),
  KEY `deliveries_tracking_number_index` (`tracking_number`),
  CONSTRAINT `deliveries_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `deliveries_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
INSERT INTO `deliveries` VALUES
(2,2,7,'Msambweni Sub-County Hospital, Kwale','2025-07-15 13:26:32','2025-07-29 22:06:02','delivered','urgent','TRK-2025-F683B722',NULL,'2025-07-08 20:53:12','2025-07-29 22:06:02'),
(7,7,NULL,'Msambweni Sub-County Hospital, Kwale','2025-07-13 11:38:39',NULL,'assigned','low','TRK-2025-F685006A',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(8,8,NULL,'Gazi Village, Kwale','2025-07-11 05:08:44',NULL,'in_transit','urgent','TRK-2025-F685395E',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,10,NULL,'97301 Langworth Fall\nMarianamouth, KY 78118','2025-07-13 23:51:52',NULL,'in_transit','medium','TRK-2025-F685C031',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,11,NULL,'16539 Balistreri Field\nEfrainborough, TX 47712-5116','2025-07-14 20:38:46',NULL,'assigned','medium','TRK-2025-F685FCE7',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,15,NULL,'4418 Beer Terrace Apt. 675\nLake Barrettstad, AK 89013-0718','2025-07-15 02:57:37',NULL,'assigned','medium','TRK-2025-F68715E0',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(17,17,NULL,'76528 Bradtke Garden Apt. 792\nLake Adell, HI 98437','2025-07-12 16:12:22',NULL,'assigned','urgent','TRK-2025-F68795F2',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(22,25,NULL,'Bulk delivery address will be provided','2025-07-17 21:00:00',NULL,'assigned','medium','TRK-2025-2C401B3B',NULL,'2025-07-12 16:08:52','2025-07-12 16:08:52'),
(26,34,NULL,'Bulk delivery - Budget: 10000-25000. Requirements: nope','2025-07-22 21:00:00',NULL,'assigned','medium','TRK-2025-4A82674C',NULL,'2025-07-21 15:19:20','2025-07-21 15:19:20'),
(29,37,NULL,'Bulk delivery - Budget: 5000-10000. Requirements: owow','2025-07-23 21:00:00',NULL,'assigned','medium','TRK-2025-6A6BD3F2',NULL,'2025-07-21 15:27:50','2025-07-21 15:27:50'),
(35,43,NULL,'Bulk delivery - Budget: 25000-50000. Requirements: fishy','2025-07-23 21:00:00',NULL,'assigned','medium','TRK-2025-88849C41','Bulk order for retail - fishy','2025-07-22 08:39:52','2025-07-22 08:39:52'),
(36,44,NULL,'Bulk delivery - Budget: 5000-10000','2025-07-22 21:00:00',NULL,'assigned','medium','TRK-2025-8BD620A1','Bulk order for retail - Standard bulk order','2025-07-22 08:40:45','2025-07-22 08:40:45'),
(40,48,NULL,'Bulk delivery - Budget: 5000-10000. Requirements: nana','2025-07-23 21:00:00',NULL,'assigned','medium','TRK-2025-8B683029','Bulk order for retail - nana','2025-07-23 10:50:46','2025-07-23 10:50:46'),
(41,49,NULL,'Bulk delivery - Budget: 5000-10000. Requirements: nana','2025-07-23 21:00:00',NULL,'assigned','medium','TRK-2025-CFC3C754','Bulk order for retail - nana','2025-07-23 11:09:00','2025-07-23 11:09:00'),
(42,50,NULL,'Bulk delivery - Budget: 5000-10000. Requirements: nope','2025-07-23 21:00:00',NULL,'assigned','medium','TRK-2025-0A3021B9','Bulk order for retail - nope','2025-07-23 11:24:35','2025-07-23 11:24:35'),
(43,51,NULL,'Bulk delivery - Budget: 5000-10000. Requirements: should be fresh and cold','2025-07-30 21:00:00',NULL,'assigned','medium','TRK-2025-1AC8C4D5','Bulk order for retail - should be fresh and cold','2025-07-23 11:29:00','2025-07-23 11:29:00'),
(44,53,NULL,'Bulk delivery - Budget: 5000-10000. Requirements: nope','2025-07-26 00:35:00',NULL,'assigned','medium','TRK17534253119186',NULL,'2025-07-25 03:35:11','2025-07-25 03:35:11'),
(46,56,7,'Bulk delivery - Budget: 5000-10000. Requirements: asap as possible','2025-07-26 05:25:00','2025-07-26 15:46:04','delivered','medium','TRK17534427495162',NULL,'2025-07-25 08:25:49','2025-07-26 15:46:04'),
(48,57,7,'Bulk delivery - Budget: 10000-25000. Requirements: no','2025-07-26 05:33:00','2025-07-26 15:52:58','delivered','medium','TRK17534432317547',NULL,'2025-07-25 08:33:51','2025-07-26 15:52:58'),
(49,58,NULL,'Bulk delivery - Budget: 10000-25000. Requirements: HOT','2025-07-26 05:49:00',NULL,'assigned','low','TRK17534442015057',NULL,'2025-07-25 08:50:01','2025-07-25 08:50:01'),
(50,59,7,'Bulk delivery - Budget: 10000-25000. Requirements: nope','2025-07-26 05:51:00','2025-07-26 15:53:00','delivered','medium','TRK17534442955242',NULL,'2025-07-25 08:51:35','2025-07-26 15:53:00'),
(53,62,7,'kisumu','2025-07-27 01:05:00','2025-07-29 22:28:39','delivered','medium','TRK17535135368664',NULL,'2025-07-26 04:05:36','2025-07-29 22:28:39'),
(54,61,NULL,'testsdeliverylocation','2025-07-27 01:06:00',NULL,'assigned','low','TRK17535136044839',NULL,'2025-07-26 04:06:44','2025-07-26 04:06:44'),
(55,63,7,'kiambu','2025-07-27 01:29:00','2025-07-29 22:28:34','delivered','high','TRK17535150064880',NULL,'2025-07-26 04:30:06','2025-07-29 22:28:34'),
(56,66,7,'Turkana','2025-07-27 12:51:00','2025-07-29 22:28:41','delivered','medium','TRK17535559182939',NULL,'2025-07-26 15:51:58','2025-07-29 22:28:41'),
(57,71,NULL,'nairobi','2025-07-30 07:52:00',NULL,'assigned','medium','TRK17537971387909',NULL,'2025-07-29 10:52:18','2025-07-29 10:52:18'),
(58,70,NULL,'kitale','2025-07-30 07:52:00',NULL,'assigned','medium','TRK17537971642916',NULL,'2025-07-29 10:52:44','2025-07-29 10:52:44'),
(59,72,7,'nairobi','2025-07-30 18:19:00','2025-07-29 22:28:37','delivered','high','TRK17538348104056',NULL,'2025-07-29 21:20:10','2025-07-29 22:28:37'),
(60,77,7,'Garissa','2025-07-30 19:41:00','2025-07-29 22:43:32','delivered','high','TRK17538397362655',NULL,'2025-07-29 22:42:16','2025-07-29 22:43:32'),
(61,80,7,'Kitale','2025-07-30 20:21:00','2025-07-29 23:25:29','delivered','high','TRK17538421318606',NULL,'2025-07-29 23:22:11','2025-07-29 23:25:29'),
(62,81,7,'Kileleshwa','2025-07-30 20:37:00','2025-07-29 23:38:44','delivered','medium','TRK17538430622620',NULL,'2025-07-29 23:37:42','2025-07-29 23:38:44'),
(63,82,7,'kisauni','2025-07-30 20:42:00','2025-07-29 23:43:07','delivered','medium','TRK17538433545146',NULL,'2025-07-29 23:42:34','2025-07-29 23:43:07'),
(64,83,7,'Kwale County','2025-07-31 08:16:00','2025-07-30 11:20:22','delivered','high','TRK17538849943619',NULL,'2025-07-30 11:16:34','2025-07-30 11:20:22'),
(65,85,45,'Nakuru','2025-08-02 21:27:00','2025-08-02 00:30:37','delivered','low','TRK17541052727768',NULL,'2025-08-02 00:27:52','2025-08-02 00:30:37'),
(66,86,7,'Kisumu','2025-08-04 05:40:00','2025-08-03 08:41:42','delivered','high','TRK17542212224595',NULL,'2025-08-03 08:40:22','2025-08-03 08:41:42'),
(67,87,7,'Kisauni','2025-08-05 01:07:00','2025-08-04 04:10:21','delivered','medium','TRK17542912374065',NULL,'2025-08-04 04:07:17','2025-08-04 04:10:21'),
(68,84,NULL,'Kwale','2025-08-06 00:16:00',NULL,'assigned','medium','TRK17543746106868',NULL,'2025-08-05 03:16:50','2025-08-05 03:16:50'),
(69,91,NULL,'Kiambu','2025-08-06 04:49:00',NULL,'assigned','medium','TRK17543909893411',NULL,'2025-08-05 07:49:49','2025-08-05 07:49:49'),
(70,107,NULL,'Machakos','2025-08-09 19:35:00',NULL,'assigned','medium','TRK17547033521982',NULL,'2025-08-08 22:35:52','2025-08-08 22:35:52'),
(71,108,NULL,'Kitale','2025-08-10 19:44:00',NULL,'assigned','medium','TRK17547038799667',NULL,'2025-08-08 22:44:39','2025-08-08 22:44:39'),
(72,106,53,'Turkana','2025-08-09 19:50:00','2025-08-08 22:52:10','delivered','medium','TRK17547042592551',NULL,'2025-08-08 22:50:59','2025-08-08 22:52:10'),
(73,105,53,'Banana Hill','2025-08-09 20:03:00','2025-08-08 23:04:09','delivered','medium','TRK17547050306766',NULL,'2025-08-08 23:03:50','2025-08-08 23:04:09'),
(74,109,53,'Kwale','2025-08-09 20:13:00','2025-08-08 23:16:43','delivered','medium','TRK17547056154797',NULL,'2025-08-08 23:13:35','2025-08-08 23:16:43'),
(75,110,53,'Kwale','2025-08-09 20:22:00','2025-08-08 23:24:33','delivered','medium','TRK17547061801995',NULL,'2025-08-08 23:23:00','2025-08-08 23:24:33');
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_status_updates`
--

DROP TABLE IF EXISTS `delivery_status_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_status_updates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `delivery_id` bigint(20) unsigned NOT NULL,
  `status` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `updated_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `delivery_status_updates_updated_by_foreign` (`updated_by`),
  KEY `delivery_status_updates_delivery_id_created_at_index` (`delivery_id`,`created_at`),
  CONSTRAINT `delivery_status_updates_delivery_id_foreign` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_status_updates_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_status_updates`
--

LOCK TABLES `delivery_status_updates` WRITE;
/*!40000 ALTER TABLE `delivery_status_updates` DISABLE KEYS */;
INSERT INTO `delivery_status_updates` VALUES
(3,2,'in_transit',NULL,'Delivery updated',7,'2025-07-24 11:15:18','2025-07-24 11:15:18'),
(4,2,'in_transit',NULL,'Delivery updated',7,'2025-07-24 11:15:18','2025-07-24 11:15:18'),
(5,44,'assigned',NULL,'Delivery created',1,'2025-07-25 03:35:11','2025-07-25 03:35:11'),
(7,46,'assigned',NULL,'Delivery created',1,'2025-07-25 08:25:49','2025-07-25 08:25:49'),
(9,48,'assigned',NULL,'Delivery created',1,'2025-07-25 08:33:51','2025-07-25 08:33:51'),
(10,49,'assigned',NULL,'Delivery created',1,'2025-07-25 08:50:01','2025-07-25 08:50:01'),
(11,50,'assigned',NULL,'Delivery created',1,'2025-07-25 08:51:35','2025-07-25 08:51:35'),
(14,53,'assigned',NULL,'Delivery created',1,'2025-07-26 04:05:36','2025-07-26 04:05:36'),
(15,54,'assigned',NULL,'Delivery created',1,'2025-07-26 04:06:44','2025-07-26 04:06:44'),
(16,55,'assigned',NULL,'Delivery created',1,'2025-07-26 04:30:06','2025-07-26 04:30:06'),
(17,2,'in_transit',NULL,'Delivery updated',7,'2025-07-26 15:41:57','2025-07-26 15:41:57'),
(18,53,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:42:07','2025-07-26 15:42:07'),
(19,53,'in_transit',NULL,'Delivery updated',7,'2025-07-26 15:44:02','2025-07-26 15:44:02'),
(20,55,'in_transit',NULL,'Delivery updated',7,'2025-07-26 15:44:17','2025-07-26 15:44:17'),
(21,53,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:44:31','2025-07-26 15:44:31'),
(22,2,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:44:55','2025-07-26 15:44:55'),
(23,55,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:45:49','2025-07-26 15:45:49'),
(24,48,'in_transit',NULL,'Delivery updated',7,'2025-07-26 15:45:54','2025-07-26 15:45:54'),
(25,50,'in_transit',NULL,'Delivery updated',7,'2025-07-26 15:45:57','2025-07-26 15:45:57'),
(26,53,'in_transit',NULL,'Delivery updated',7,'2025-07-26 15:45:58','2025-07-26 15:45:58'),
(27,46,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:46:04','2025-07-26 15:46:04'),
(28,56,'assigned',NULL,'Delivery created',1,'2025-07-26 15:51:58','2025-07-26 15:51:58'),
(29,56,'in_transit',NULL,'Delivery updated',7,'2025-07-26 15:52:40','2025-07-26 15:52:40'),
(30,48,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:52:58','2025-07-26 15:52:58'),
(31,50,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:53:00','2025-07-26 15:53:00'),
(32,56,'delivered',NULL,'Delivery updated',7,'2025-07-26 15:53:09','2025-07-26 15:53:09'),
(33,57,'assigned',NULL,'Delivery created',1,'2025-07-29 10:52:18','2025-07-29 10:52:18'),
(34,58,'assigned',NULL,'Delivery created',1,'2025-07-29 10:52:44','2025-07-29 10:52:44'),
(35,59,'assigned',NULL,'Delivery created',1,'2025-07-29 21:20:10','2025-07-29 21:20:10'),
(36,56,'in_transit',NULL,'Delivery updated',7,'2025-07-29 22:04:06','2025-07-29 22:04:06'),
(37,2,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:04:43','2025-07-29 22:04:43'),
(38,2,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:04:51','2025-07-29 22:04:51'),
(39,55,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:04:57','2025-07-29 22:04:57'),
(40,55,'in_transit',NULL,'Delivery updated',7,'2025-07-29 22:05:52','2025-07-29 22:05:52'),
(41,2,'in_transit',NULL,'Delivery updated',7,'2025-07-29 22:06:00','2025-07-29 22:06:00'),
(42,2,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:06:02','2025-07-29 22:06:02'),
(43,55,'in_transit',NULL,'Delivery updated',7,'2025-07-29 22:17:48','2025-07-29 22:17:48'),
(44,55,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:28:34','2025-07-29 22:28:34'),
(45,59,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:28:37','2025-07-29 22:28:37'),
(46,53,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:28:39','2025-07-29 22:28:39'),
(47,56,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:28:41','2025-07-29 22:28:41'),
(48,60,'assigned',NULL,'Delivery created',1,'2025-07-29 22:42:16','2025-07-29 22:42:16'),
(49,60,'in_transit',NULL,'Delivery updated',7,'2025-07-29 22:43:13','2025-07-29 22:43:13'),
(50,60,'delivered',NULL,'Delivery updated',7,'2025-07-29 22:43:32','2025-07-29 22:43:32'),
(51,61,'assigned',NULL,'Delivery created',1,'2025-07-29 23:22:11','2025-07-29 23:22:11'),
(52,61,'failed',NULL,'Delivery updated',7,'2025-07-29 23:24:18','2025-07-29 23:24:18'),
(53,61,'in_transit',NULL,NULL,1,'2025-07-29 23:25:12','2025-07-29 23:25:12'),
(54,61,'delivered',NULL,'Delivery updated',7,'2025-07-29 23:25:29','2025-07-29 23:25:29'),
(55,62,'assigned',NULL,'Delivery created',1,'2025-07-29 23:37:42','2025-07-29 23:37:42'),
(56,62,'delivered',NULL,'Delivery updated',7,'2025-07-29 23:38:44','2025-07-29 23:38:44'),
(57,63,'assigned',NULL,'Delivery created',1,'2025-07-29 23:42:34','2025-07-29 23:42:34'),
(58,63,'delivered',NULL,'Delivery updated',7,'2025-07-29 23:43:07','2025-07-29 23:43:07'),
(59,64,'assigned',NULL,'Delivery created',1,'2025-07-30 11:16:34','2025-07-30 11:16:34'),
(60,64,'in_transit',NULL,'Delivery updated',7,'2025-07-30 11:17:20','2025-07-30 11:17:20'),
(61,64,'failed',NULL,'Delivery updated',7,'2025-07-30 11:18:26','2025-07-30 11:18:26'),
(62,64,'in_transit',NULL,'jjj',1,'2025-07-30 11:19:31','2025-07-30 11:19:31'),
(63,64,'delivered',NULL,'Delivery updated',7,'2025-07-30 11:20:22','2025-07-30 11:20:22'),
(64,65,'assigned',NULL,'Delivery created',1,'2025-08-02 00:27:52','2025-08-02 00:27:52'),
(65,65,'in_transit',NULL,'Delivery updated',45,'2025-08-02 00:30:11','2025-08-02 00:30:11'),
(66,65,'delivered',NULL,'Delivery updated',45,'2025-08-02 00:30:37','2025-08-02 00:30:37'),
(67,66,'assigned',NULL,'Delivery created',1,'2025-08-03 08:40:22','2025-08-03 08:40:22'),
(68,66,'in_transit',NULL,'Delivery updated',7,'2025-08-03 08:41:10','2025-08-03 08:41:10'),
(69,66,'delivered',NULL,'Delivery updated',7,'2025-08-03 08:41:42','2025-08-03 08:41:42'),
(70,67,'assigned',NULL,'Delivery created',1,'2025-08-04 04:07:17','2025-08-04 04:07:17'),
(71,67,'in_transit',NULL,'Delivery updated',7,'2025-08-04 04:10:19','2025-08-04 04:10:19'),
(72,67,'delivered',NULL,'Delivery updated',7,'2025-08-04 04:10:21','2025-08-04 04:10:21'),
(73,68,'assigned',NULL,'Delivery created',1,'2025-08-05 03:16:50','2025-08-05 03:16:50'),
(74,69,'assigned',NULL,'Delivery created',1,'2025-08-05 07:49:49','2025-08-05 07:49:49'),
(75,70,'assigned',NULL,'Delivery created',1,'2025-08-08 22:35:52','2025-08-08 22:35:52'),
(76,71,'assigned',NULL,'Delivery created',1,'2025-08-08 22:44:39','2025-08-08 22:44:39'),
(77,72,'assigned',NULL,'Delivery created',1,'2025-08-08 22:50:59','2025-08-08 22:50:59'),
(78,72,'in_transit',NULL,'Delivery updated',53,'2025-08-08 22:52:03','2025-08-08 22:52:03'),
(79,72,'delivered',NULL,'Delivery updated',53,'2025-08-08 22:52:09','2025-08-08 22:52:09'),
(80,73,'assigned',NULL,'Delivery created',1,'2025-08-08 23:03:50','2025-08-08 23:03:50'),
(81,73,'delivered',NULL,'Delivery updated',53,'2025-08-08 23:04:09','2025-08-08 23:04:09'),
(82,74,'assigned',NULL,'Delivery created',1,'2025-08-08 23:13:35','2025-08-08 23:13:35'),
(83,74,'in_transit',NULL,'Delivery updated',53,'2025-08-08 23:13:57','2025-08-08 23:13:57'),
(84,74,'failed',NULL,'Delivery updated',53,'2025-08-08 23:14:50','2025-08-08 23:14:50'),
(85,74,'delivered',NULL,'Delivery updated',53,'2025-08-08 23:16:43','2025-08-08 23:16:43'),
(86,75,'assigned',NULL,'Delivery created',1,'2025-08-08 23:23:00','2025-08-08 23:23:00'),
(87,75,'failed',NULL,'Delivery updated',53,'2025-08-08 23:23:32','2025-08-08 23:23:32'),
(88,75,'delivered',NULL,'Delivery updated',53,'2025-08-08 23:24:33','2025-08-08 23:24:33');
/*!40000 ALTER TABLE `delivery_status_updates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2019_12_14_000001_create_personal_access_tokens_table',1),
(5,'2024_01_01_000002_create_products_table',1),
(6,'2024_01_01_000003_create_orders_table',1),
(7,'2024_01_01_000004_create_order_items_table',1),
(8,'2024_01_01_000005_create_payments_table',1),
(9,'2024_01_01_000006_create_deliveries_table',1),
(10,'2024_01_01_000007_create_delivery_status_updates_table',1),
(11,'2024_01_01_000008_create_promotions_table',1),
(12,'2025_07_21_181721_alter_payment_method_column_in_payments_table',2),
(13,'2025_07_29_231153_update_products_category_enum',3),
(14,'2024_01_01_000009_create_reviews_table',4);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  KEY `order_items_order_id_product_id_index` (`order_id`,`product_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES
(15,7,2,3,35.00,105.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(22,10,2,1,35.00,35.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(27,11,2,7,35.00,245.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(66,37,2,200,35.00,7000.00,'2025-07-21 15:27:50','2025-07-21 15:27:50'),
(77,48,74,10,60.00,600.00,'2025-07-23 10:50:46','2025-07-23 10:50:46'),
(78,49,74,10,60.00,600.00,'2025-07-23 11:09:00','2025-07-23 11:09:00'),
(80,51,74,50,60.00,3000.00,'2025-07-23 11:29:00','2025-07-23 11:29:00'),
(85,56,77,30,200.00,6000.00,'2025-07-25 08:24:43','2025-07-25 08:24:43'),
(90,61,78,1,50.00,50.00,'2025-07-26 04:03:27','2025-07-26 04:03:27'),
(91,62,78,100,50.00,5000.00,'2025-07-26 04:04:46','2025-07-26 04:04:46'),
(92,63,78,80,50.00,4000.00,'2025-07-26 04:25:59','2025-07-26 04:25:59'),
(93,64,80,10,700.00,7000.00,'2025-07-26 14:35:45','2025-07-26 14:35:45'),
(97,67,78,10,50.00,500.00,'2025-07-29 09:57:28','2025-07-29 09:57:28'),
(98,68,80,50,700.00,35000.00,'2025-07-29 10:24:19','2025-07-29 10:24:19'),
(99,69,80,1,700.00,700.00,'2025-07-29 10:42:10','2025-07-29 10:42:10'),
(101,71,80,20,700.00,14000.00,'2025-07-29 10:50:54','2025-07-29 10:50:54'),
(105,75,78,10,50.00,500.00,'2025-07-29 21:48:26','2025-07-29 21:48:26'),
(106,76,78,18,50.00,900.00,'2025-07-29 21:59:22','2025-07-29 21:59:22'),
(107,77,78,17,50.00,850.00,'2025-07-29 22:40:50','2025-07-29 22:40:50'),
(108,78,2,200,35.00,7000.00,'2025-07-29 22:49:06','2025-07-29 22:49:06'),
(109,79,2,100,35.00,3500.00,'2025-07-29 22:52:26','2025-07-29 22:52:26'),
(110,80,4,200,25.00,5000.00,'2025-07-29 23:21:25','2025-07-29 23:21:25'),
(111,81,22,100,62.00,6200.00,'2025-07-29 23:36:54','2025-07-29 23:36:54'),
(113,82,80,1,700.00,700.00,'2025-07-29 23:42:02','2025-07-29 23:42:02'),
(114,83,80,100,700.00,70000.00,'2025-07-30 07:16:00','2025-07-30 07:16:00'),
(115,84,88,10,200.00,2000.00,'2025-07-31 02:11:53','2025-07-31 02:11:53'),
(116,85,90,10,300.00,3000.00,'2025-08-02 00:24:52','2025-08-02 00:24:52'),
(117,86,83,1,60.00,60.00,'2025-08-03 08:36:57','2025-08-03 08:36:57'),
(118,86,89,1,100.00,100.00,'2025-08-03 08:36:57','2025-08-03 08:36:57'),
(119,87,93,1,50.00,50.00,'2025-08-04 03:58:28','2025-08-04 03:58:28'),
(120,88,90,1,300.00,300.00,'2025-08-04 04:27:33','2025-08-04 04:27:33'),
(121,89,90,1,300.00,300.00,'2025-08-05 07:32:59','2025-08-05 07:32:59'),
(122,90,88,1,70.00,70.00,'2025-08-05 07:36:31','2025-08-05 07:36:31'),
(123,91,95,1,300.00,300.00,'2025-08-05 07:41:51','2025-08-05 07:41:51'),
(124,92,95,100,300.00,30000.00,'2025-08-05 07:47:10','2025-08-05 07:47:10'),
(125,93,95,50,300.00,15000.00,'2025-08-05 09:33:27','2025-08-05 09:33:27'),
(126,94,92,1,400.00,400.00,'2025-08-05 09:36:18','2025-08-05 09:36:18'),
(127,95,96,1,30.00,30.00,'2025-08-05 09:38:08','2025-08-05 09:38:08'),
(128,96,95,10,300.00,3000.00,'2025-08-05 09:44:27','2025-08-05 09:44:27'),
(129,97,94,1,7000.00,7000.00,'2025-08-05 09:48:37','2025-08-05 09:48:37'),
(130,98,95,1,300.00,300.00,'2025-08-05 09:55:11','2025-08-05 09:55:11'),
(131,99,95,1,300.00,300.00,'2025-08-05 10:07:46','2025-08-05 10:07:46'),
(132,100,98,1,40.00,40.00,'2025-08-05 10:10:37','2025-08-05 10:10:37'),
(133,101,92,1,400.00,400.00,'2025-08-05 10:13:50','2025-08-05 10:13:50'),
(134,102,95,30,300.00,9000.00,'2025-08-05 10:17:26','2025-08-05 10:17:26'),
(135,103,95,5,300.00,1500.00,'2025-08-05 14:01:01','2025-08-05 14:01:01'),
(136,104,98,400,40.00,16000.00,'2025-08-05 14:15:35','2025-08-05 14:15:35'),
(137,105,92,25,400.00,10000.00,'2025-08-05 14:18:43','2025-08-05 14:18:43'),
(138,106,94,8,7000.00,56000.00,'2025-08-05 14:23:58','2025-08-05 14:23:58'),
(139,107,83,1,60.00,60.00,'2025-08-05 14:26:10','2025-08-05 14:26:10'),
(140,108,95,1,300.00,300.00,'2025-08-08 22:44:03','2025-08-08 22:44:03'),
(141,109,88,30,70.00,2100.00,'2025-08-08 23:10:58','2025-08-08 23:10:58'),
(142,110,87,45,30.00,1350.00,'2025-08-08 23:22:26','2025-08-08 23:22:26');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `delivery_address` text NOT NULL,
  `delivery_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_user_id_status_index` (`user_id`,`status`),
  KEY `orders_order_number_index` (`order_number`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES
(2,6,'ORD-2025-000002',1860.00,'delivered','Msambweni Sub-County Hospital, Kwale','2025-07-15 13:26:32','Urgent delivery before noon','2025-07-08 20:53:12','2025-07-26 15:44:55'),
(7,6,'ORD-2025-000007',3902.00,'cancelled','Ukunda Town, Kwale County, Kenya','2025-07-13 11:38:39','Standard delivery instructions','2025-07-08 20:53:12','2025-07-23 11:08:22'),
(8,6,'ORD-2025-000008',2578.00,'processing','Ukunda Town, Kwale County, Kenya','2025-07-11 05:08:44','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,12,'ORD-2025-000010',2041.00,'processing','Ukunda Town, Kwale County, Kenya','2025-07-13 23:51:52','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,12,'ORD-2025-000011',1055.00,'confirmed','Ukunda Town, Kwale County, Kenya','2025-07-14 20:38:46','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,6,'ORD-2025-000015',720.00,'cancelled','4418 Beer Terrace Apt. 675\nLake Barrettstad, AK 89013-0718','2025-07-15 02:57:37','Standard delivery instructions','2025-07-08 20:53:12','2025-07-23 10:26:54'),
(17,6,'ORD-2025-000017',7457.00,'cancelled','76528 Bradtke Garden Apt. 792\nLake Adell, HI 98437','2025-07-12 16:12:22','Standard delivery instructions','2025-07-08 20:53:12','2025-07-23 10:26:58'),
(25,6,'ORD-2025-000022',2200.00,'cancelled','Bulk delivery address will be provided','2025-07-17 21:00:00','Standard delivery instructions','2025-07-12 16:08:51','2025-07-23 11:08:25'),
(34,6,'ORD-2025-472951',12000.00,'cancelled','Bulk delivery - Budget: 10000-25000. Requirements: nope','2025-07-22 21:00:00','Bulk order for retail - nope','2025-07-21 15:19:20','2025-07-23 11:08:27'),
(37,6,'ORD-2025-968230',7000.00,'cancelled','Bulk delivery - Budget: 5000-10000. Requirements: owow','2025-07-23 21:00:00','Bulk order for retail - owow','2025-07-21 15:27:50','2025-07-23 11:02:47'),
(43,6,'ORD-2025-114947',40000.00,'confirmed','Bulk delivery - Budget: 25000-50000. Requirements: fishy','2025-07-23 21:00:00','Bulk order for retail - fishy','2025-07-22 08:39:52','2025-07-25 03:31:28'),
(44,6,'ORD-2025-085149',4000.00,'confirmed','Bulk delivery - Budget: 5000-10000','2025-07-22 21:00:00','Bulk order for retail - Standard bulk order','2025-07-22 08:40:45','2025-07-25 02:59:50'),
(48,6,'ORD-2025-075808',600.00,'confirmed','Bulk delivery - Budget: 5000-10000. Requirements: nana','2025-07-23 21:00:00','Bulk order for retail - nana','2025-07-23 10:50:46','2025-07-25 02:39:53'),
(49,6,'ORD-2025-380744',600.00,'confirmed','Bulk delivery - Budget: 5000-10000. Requirements: nana','2025-07-23 21:00:00','Bulk order for retail - nana','2025-07-23 11:09:00','2025-07-25 02:11:45'),
(50,6,'ORD-2025-953058',4000.00,'confirmed','Bulk delivery - Budget: 5000-10000. Requirements: nope','2025-07-23 21:00:00','Bulk order for retail - nope','2025-07-23 11:24:34','2025-07-25 02:01:05'),
(51,6,'ORD-2025-629719',3000.00,'confirmed','Bulk delivery - Budget: 5000-10000. Requirements: should be fresh and cold','2025-07-30 21:00:00','Bulk order for retail - should be fresh and cold','2025-07-23 11:29:00','2025-07-23 12:28:26'),
(53,6,'ORD-2025-802790',3000.00,'confirmed','Bulk delivery - Budget: 5000-10000. Requirements: nope','2025-07-25 21:00:00','Bulk order for retail - nope','2025-07-25 03:33:40','2025-07-25 03:34:30'),
(56,6,'ORD-2025-445005',6000.00,'delivered','Bulk delivery - Budget: 5000-10000. Requirements: asap as possible','2025-07-25 21:00:00','Bulk order for retail - asap as possible','2025-07-25 08:24:43','2025-07-26 15:46:04'),
(57,6,'ORD-2025-611641',12000.00,'delivered','Bulk delivery - Budget: 10000-25000. Requirements: no','2025-07-25 21:00:00','Bulk order for retail - no','2025-07-25 08:31:31','2025-07-26 15:52:58'),
(58,6,'ORD-2025-163265',10000.00,'confirmed','Bulk delivery - Budget: 10000-25000. Requirements: HOT','2025-07-25 21:00:00','Bulk order for retail - HOT','2025-07-25 08:33:00','2025-07-25 08:34:14'),
(59,6,'ORD-2025-617422',12000.00,'delivered','Bulk delivery - Budget: 10000-25000. Requirements: nope','2025-07-25 21:00:00','Bulk order for retail - nope','2025-07-25 08:51:10','2025-07-26 15:53:00'),
(61,41,'ORD-2025-513002',50.00,'confirmed','testsdeliverylocation',NULL,NULL,'2025-07-26 04:03:27','2025-07-26 04:06:33'),
(62,41,'ORD-2025-328079',5000.00,'delivered','kisumu',NULL,NULL,'2025-07-26 04:04:46','2025-07-26 15:42:07'),
(63,6,'ORD-2025-991827',4000.00,'delivered','Bulk delivery - Budget: 5000-10000. Requirements: fresh green ones','2025-07-27 21:00:00','Bulk order for retail - fresh green ones','2025-07-26 04:25:59','2025-07-26 15:45:49'),
(64,41,'ORD-2025-966451',17000.00,'confirmed','Msambweni market',NULL,NULL,'2025-07-26 14:35:45','2025-07-26 14:36:53'),
(65,6,'ORD-2025-531095',20000.00,'confirmed','Bulk delivery - Budget: 25000-50000. Requirements: as fresh as possible','2025-07-26 21:00:00','Bulk order for retail - as fresh as possible','2025-07-26 14:48:15','2025-07-26 14:50:24'),
(66,6,'ORD-2025-132692',50000.00,'delivered','Bulk delivery - Budget: 50000+. Requirements: today','2025-07-30 21:00:00','Bulk order for retail - today','2025-07-26 14:52:28','2025-07-26 15:53:09'),
(67,6,'ORD-2025-767136',500.00,'cancelled','Bulk delivery - Budget: 5000-10000','2025-07-30 21:00:00','Bulk order for retail - Standard bulk order','2025-07-29 09:57:28','2025-07-29 21:35:46'),
(68,6,'ORD-2025-762010',35000.00,'cancelled','Bulk delivery - Budget: 25000-50000. Requirements: no','2025-07-30 21:00:00','Bulk order for retail - no','2025-07-29 10:24:19','2025-07-29 21:56:39'),
(69,41,'ORD-2025-330619',700.00,'cancelled','353627',NULL,NULL,'2025-07-29 10:42:10','2025-07-29 21:44:31'),
(70,41,'ORD-2025-650700',1000.00,'confirmed','another tests',NULL,NULL,'2025-07-29 10:49:50','2025-07-29 10:52:30'),
(71,6,'ORD-2025-276731',14000.00,'confirmed','Bulk delivery - Budget: 10000-25000','2025-07-29 21:00:00','Bulk order for retail - Standard bulk order','2025-07-29 10:50:54','2025-07-29 10:52:02'),
(72,41,'ORD-2025-556394',4000.00,'delivered','nairobi',NULL,NULL,'2025-07-29 21:07:29','2025-07-29 22:28:37'),
(73,41,'ORD-2025-057959',1000.00,'cancelled','kisumu',NULL,NULL,'2025-07-29 21:18:37','2025-07-29 21:19:43'),
(74,6,'ORD-2025-917052',40000.00,'cancelled','Bulk delivery - Budget: 25000-50000. Requirements: fresh','2025-07-30 21:00:00','Bulk order for retail - fresh','2025-07-29 21:25:24','2025-07-29 21:33:55'),
(75,41,'ORD-2025-977671',500.00,'cancelled','Machakos',NULL,NULL,'2025-07-29 21:48:26','2025-07-29 21:48:53'),
(76,6,'ORD-2025-627081',900.00,'cancelled','Bulk delivery - Budget: 5000-10000. Requirements: fresh','2025-07-30 21:00:00','Bulk order for retail - fresh','2025-07-29 21:59:22','2025-07-29 21:59:51'),
(77,6,'ORD-2025-746680',850.00,'delivered','Bulk delivery - Budget: 5000-10000. Requirements: should be green and fresh','2025-07-30 21:00:00','Bulk order for retail - should be green and fresh','2025-07-29 22:40:50','2025-07-29 22:43:32'),
(78,6,'ORD-2025-103839',7000.00,'cancelled','Bulk delivery - Budget: 5000-10000. Requirements: no','2025-07-30 21:00:00','Bulk order for retail - no','2025-07-29 22:49:06','2025-07-29 22:51:33'),
(79,6,'ORD-2025-830440',3500.00,'cancelled','Bulk delivery - Budget: 5000-10000. Requirements: no','2025-07-30 21:00:00','Bulk order for retail - no','2025-07-29 22:52:26','2025-07-29 23:09:33'),
(80,6,'ORD-2025-644854',5000.00,'delivered','Kitale','2025-07-29 21:00:00','Bulk order for retail - Budget Range: 5000-10000. Special Requirements: very urgent','2025-07-29 23:21:25','2025-07-29 23:25:29'),
(81,6,'ORD-2025-107655',6200.00,'delivered','Kileleshwa','2025-07-30 21:00:00','Bulk order for retail - Budget Range: 5000-10000. Special Requirements: no','2025-07-29 23:36:54','2025-07-29 23:38:44'),
(82,41,'ORD-2025-699230',4700.00,'delivered','kisauni',NULL,NULL,'2025-07-29 23:42:02','2025-07-29 23:43:07'),
(83,6,'ORD-2025-325981',70000.00,'delivered','Kwale County','2025-07-31 21:00:00','Bulk order for retail - Budget Range: 50000+','2025-07-30 07:16:00','2025-07-30 11:20:22'),
(84,6,'ORD-2025-927203',2000.00,'confirmed','Kwale','2025-07-30 21:00:00','Bulk order for retail - Budget Range: 5000-10000','2025-07-31 02:11:53','2025-08-02 00:04:45'),
(85,41,'ORD-2025-615784',3000.00,'delivered','Nakuru',NULL,NULL,'2025-08-02 00:24:52','2025-08-02 00:30:37'),
(86,41,'ORD-2025-564280',160.00,'delivered','Kisumu',NULL,NULL,'2025-08-03 08:36:57','2025-08-03 08:41:42'),
(87,41,'ORD-2025-858210',50.00,'delivered','Kisauni',NULL,NULL,'2025-08-04 03:58:28','2025-08-04 04:10:21'),
(88,41,'ORD-2025-703674',300.00,'delivered','Meru',NULL,NULL,'2025-08-04 04:27:33','2025-08-04 04:30:24'),
(89,41,'ORD-2025-600724',300.00,'confirmed','Msambweni',NULL,NULL,'2025-08-05 07:32:59','2025-08-05 07:42:26'),
(90,41,'ORD-2025-461871',70.00,'cancelled','Kisauni',NULL,NULL,'2025-08-05 07:36:31','2025-08-05 07:42:39'),
(91,41,'ORD-2025-829144',300.00,'confirmed','Kiambu',NULL,NULL,'2025-08-05 07:41:51','2025-08-05 07:48:19'),
(92,6,'ORD-2025-502878',30000.00,'delivered','Kwale','2025-08-30 21:00:00','Bulk order for retail - Budget Range: 25000-50000. Special Requirements: as fresh as possible','2025-08-05 07:47:10','2025-08-05 07:48:12'),
(93,6,'ORD-2025-138707',15000.00,'cancelled','Kwale','2025-08-05 21:00:00','Bulk order for retail - Budget Range: 10000-25000. Special Requirements: No','2025-08-05 09:33:27','2025-08-08 23:21:00'),
(94,41,'ORD-2025-567739',400.00,'pending','Kitale',NULL,NULL,'2025-08-05 09:36:18','2025-08-05 09:36:18'),
(95,41,'ORD-2025-976973',30.00,'pending','Ruaka',NULL,NULL,'2025-08-05 09:38:08','2025-08-05 09:38:08'),
(96,41,'ORD-2025-105376',3000.00,'pending','Kisumu',NULL,NULL,'2025-08-05 09:44:27','2025-08-05 09:44:27'),
(97,41,'ORD-2025-157929',7000.00,'pending','Kitale',NULL,NULL,'2025-08-05 09:48:37','2025-08-05 09:48:37'),
(98,41,'ORD-2025-242445',300.00,'pending','Nairobi',NULL,NULL,'2025-08-05 09:55:11','2025-08-05 09:55:11'),
(99,41,'ORD-2025-749891',300.00,'pending','Nyandarua',NULL,NULL,'2025-08-05 10:07:46','2025-08-05 10:07:46'),
(100,41,'ORD-2025-455635',40.00,'pending','Nyali',NULL,NULL,'2025-08-05 10:10:37','2025-08-05 10:10:37'),
(101,41,'ORD-2025-309818',400.00,'pending','Kasarani',NULL,NULL,'2025-08-05 10:13:50','2025-08-05 10:13:50'),
(102,6,'ORD-2025-077425',9000.00,'cancelled','Kwale','2025-08-05 21:00:00','Bulk order for retail - Budget Range: 5000-10000. Special Requirements: no','2025-08-05 10:17:26','2025-08-08 23:20:55'),
(103,6,'ORD-2025-035902',1500.00,'cancelled','Kisauni','2025-08-05 21:00:00','Bulk order for retail - Budget Range: 5000-10000. Special Requirements: no','2025-08-05 14:01:01','2025-08-08 23:20:52'),
(104,6,'ORD-2025-971033',16000.00,'cancelled','Nakuru','2025-08-04 21:00:00','Bulk order for retail - Budget Range: 10000-25000. Special Requirements: Fresh and Yellow','2025-08-05 14:15:35','2025-08-08 23:20:49'),
(105,6,'ORD-2025-597623',10000.00,'delivered','Banana Hill','2025-08-05 21:00:00','Bulk order for retail - Budget Range: 10000-25000. Special Requirements: Must be Goat milk,i know goat milk','2025-08-05 14:18:43','2025-08-08 23:04:09'),
(106,41,'ORD-2025-089239',56000.00,'delivered','Turkana',NULL,NULL,'2025-08-05 14:23:58','2025-08-08 22:52:10'),
(107,41,'ORD-2025-819392',60.00,'confirmed','Machakos',NULL,NULL,'2025-08-05 14:26:10','2025-08-08 22:35:32'),
(108,41,'ORD-2025-080311',300.00,'confirmed','Kitale',NULL,NULL,'2025-08-08 22:44:03','2025-08-08 22:44:27'),
(109,6,'ORD-2025-154878',2100.00,'confirmed','Kwale','2025-08-08 21:00:00','Bulk order for retail - Budget Range: 5000-10000. Special Requirements: should be fresh and cold','2025-08-08 23:10:58','2025-08-08 23:17:42'),
(110,6,'ORD-2025-154203',1350.00,'delivered','Kwale','2025-08-08 21:00:00','Bulk order for retail - Budget Range: 5000-10000. Special Requirements: Yellow and juicy','2025-08-08 23:22:26','2025-08-08 23:24:33');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `payment_method` varchar(30) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `transaction_id` varchar(255) NOT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`),
  KEY `payments_order_id_status_index` (`order_id`,`status`),
  KEY `payments_transaction_id_index` (`transaction_id`),
  CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES
(2,2,'bank_transfer',1860.00,'refunded','TXN-20250708235312-83A8E6',NULL,NULL,'2025-07-08 20:53:12','2025-07-23 11:08:24'),
(7,7,'cash',3902.00,'refunded','TXN-20250708235312-84E06A',NULL,NULL,'2025-07-08 20:53:12','2025-07-23 11:08:22'),
(8,8,'mobile_money',2578.00,'processing','TXN-20250708235312-852D2C',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,10,'bank_transfer',2041.00,'failed','TXN-20250708235312-85B099',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,11,'mobile_money',1055.00,'failed','TXN-20250708235312-85F0A4',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,15,'cash',720.00,'refunded','TXN-20250708235312-870BF9',NULL,NULL,'2025-07-08 20:53:12','2025-07-23 10:26:54'),
(17,17,'card',7457.00,'refunded','TXN-20250708235312-878C82',NULL,NULL,'2025-07-08 20:53:12','2025-07-23 10:26:58'),
(25,34,'cash_on_delivery',12000.00,'refunded','TXN-20250721181920-826173',NULL,NULL,'2025-07-21 15:19:20','2025-07-23 11:08:27'),
(28,37,'mobile_money',7000.00,'refunded','TXN-20250721182750-6BCA71',NULL,NULL,'2025-07-21 15:27:50','2025-07-23 11:02:47'),
(34,43,'mobile_money',40000.00,'refunded','TXN-20250722113952-849665',NULL,NULL,'2025-07-22 08:39:52','2025-07-23 11:02:43'),
(35,44,'cash_on_delivery',4000.00,'refunded','TXN-20250722114045-D61C5F',NULL,NULL,'2025-07-22 08:40:45','2025-07-23 11:00:39'),
(39,48,'mobile_money',600.00,'refunded','TXN-20250723135046-682226',NULL,NULL,'2025-07-23 10:50:46','2025-07-23 10:59:48'),
(40,49,'cash_on_delivery',600.00,'pending','TXN-20250723140900-C3C0F1',NULL,NULL,'2025-07-23 11:09:00','2025-07-23 11:09:00'),
(41,50,'cash_on_delivery',4000.00,'pending','TXN-20250723142435-3015CB',NULL,NULL,'2025-07-23 11:24:35','2025-07-23 11:24:35'),
(42,51,'mobile_money',3000.00,'pending','TXN-20250723142900-C8BEE0',NULL,NULL,'2025-07-23 11:29:00','2025-07-23 11:29:00'),
(44,53,'cash_on_delivery',3000.00,'pending','TXN-20250725063340-45B00A',NULL,NULL,'2025-07-25 03:33:40','2025-07-25 03:33:40'),
(47,56,'cash_on_delivery',6000.00,'pending','TXN-20250725112443-B17A7E',NULL,NULL,'2025-07-25 08:24:43','2025-07-25 08:24:43'),
(48,57,'cash_on_delivery',12000.00,'refunded','TXN-20250725113131-38964A',NULL,NULL,'2025-07-25 08:31:31','2025-07-25 08:32:14'),
(49,58,'cash_on_delivery',10000.00,'pending','TXN-20250725113300-C74795',NULL,NULL,'2025-07-25 08:33:00','2025-07-25 08:33:00'),
(50,59,'cash_on_delivery',12000.00,'pending','TXN-20250725115110-E83150',NULL,NULL,'2025-07-25 08:51:10','2025-07-25 08:51:10'),
(52,61,'cash_on_delivery',50.00,'pending','TXN-20250726070327-F98E22',NULL,NULL,'2025-07-26 04:03:27','2025-07-26 04:03:27'),
(53,62,'mobile_money',5000.00,'pending','TXN-20250726070446-E6FB41',NULL,NULL,'2025-07-26 04:04:46','2025-07-26 04:04:46'),
(54,63,'cash_on_delivery',4000.00,'pending','TXN-20250726072559-7B9ACB',NULL,NULL,'2025-07-26 04:25:59','2025-07-26 04:25:59'),
(55,64,'cash_on_delivery',17000.00,'pending','TXN-20250726173545-14E510',NULL,NULL,'2025-07-26 14:35:45','2025-07-26 14:35:45'),
(56,65,'cash_on_delivery',20000.00,'refunded','TXN-20250726174815-FB17C5',NULL,NULL,'2025-07-26 14:48:15','2025-07-26 14:49:08'),
(57,66,'cash_on_delivery',50000.00,'pending','TXN-20250726175228-CBBA58',NULL,NULL,'2025-07-26 14:52:28','2025-07-26 14:52:28'),
(58,67,'cash_on_delivery',500.00,'refunded','TXN-20250729125728-84C2D6',NULL,NULL,'2025-07-29 09:57:28','2025-07-29 21:35:46'),
(59,68,'cash_on_delivery',35000.00,'refunded','TXN-20250729132419-3F0BF1',NULL,NULL,'2025-07-29 10:24:19','2025-07-29 21:56:39'),
(60,69,'cash_on_delivery',700.00,'refunded','TXN-20250729134210-2B5974',NULL,NULL,'2025-07-29 10:42:10','2025-07-29 21:44:31'),
(61,70,'cash_on_delivery',1000.00,'pending','TXN-20250729134950-E2BE9A',NULL,NULL,'2025-07-29 10:49:50','2025-07-29 10:49:50'),
(62,71,'cash_on_delivery',14000.00,'pending','TXN-20250729135054-E546A2',NULL,NULL,'2025-07-29 10:50:54','2025-07-29 10:50:54'),
(63,72,'cash_on_delivery',4000.00,'pending','TXN-20250730000729-124B3E',NULL,NULL,'2025-07-29 21:07:29','2025-07-29 21:07:29'),
(64,73,'mobile_money',1000.00,'pending','TXN-20250730001837-D5344B',NULL,NULL,'2025-07-29 21:18:37','2025-07-29 21:18:37'),
(65,74,'mobile_money',40000.00,'refunded','TXN-20250730002524-409E04',NULL,NULL,'2025-07-29 21:25:24','2025-07-29 21:33:55'),
(66,75,'card',500.00,'refunded','TXN-20250730004826-A9DF5E',NULL,NULL,'2025-07-29 21:48:26','2025-07-29 21:48:53'),
(67,76,'cash_on_delivery',900.00,'refunded','TXN-20250730005922-A1E2B7',NULL,NULL,'2025-07-29 21:59:22','2025-07-29 21:59:51'),
(68,77,'cash_on_delivery',850.00,'pending','TXN-20250730014050-25AB06',NULL,NULL,'2025-07-29 22:40:50','2025-07-29 22:40:50'),
(69,78,'cash_on_delivery',7000.00,'pending','TXN-20250730014906-25E5F3',NULL,NULL,'2025-07-29 22:49:06','2025-07-29 22:49:06'),
(70,79,'cash_on_delivery',3500.00,'pending','TXN-20250730015226-A18104',NULL,NULL,'2025-07-29 22:52:26','2025-07-29 22:52:26'),
(71,80,'cash_on_delivery',5000.00,'pending','TXN-20250730022125-5646E1',NULL,NULL,'2025-07-29 23:21:25','2025-07-29 23:21:25'),
(72,81,'cash_on_delivery',6200.00,'pending','TXN-20250730023654-61C1D6',NULL,NULL,'2025-07-29 23:36:54','2025-07-29 23:36:54'),
(73,82,'cash_on_delivery',4700.00,'pending','TXN-20250730024202-A2B365',NULL,NULL,'2025-07-29 23:42:02','2025-07-29 23:42:02'),
(74,83,'cash_on_delivery',70000.00,'refunded','TXN-20250730101600-0534A5',NULL,NULL,'2025-07-30 07:16:00','2025-07-30 07:16:13'),
(75,84,'cash_on_delivery',2000.00,'pending','TXN-20250731051153-93B12B',NULL,NULL,'2025-07-31 02:11:53','2025-07-31 02:11:53'),
(76,85,'cash_on_delivery',3000.00,'pending','TXN-20250802032452-43A9F6',NULL,NULL,'2025-08-02 00:24:52','2025-08-02 00:24:52'),
(77,86,'cash_on_delivery',160.00,'pending','TXN-20250803113657-9DE5B8',NULL,NULL,'2025-08-03 08:36:57','2025-08-03 08:36:57'),
(78,87,'cash_on_delivery',50.00,'pending','TXN-20250804065828-4584B7',NULL,NULL,'2025-08-04 03:58:28','2025-08-04 03:58:28'),
(79,88,'mobile_money',300.00,'pending','TXN-20250804072733-5073FE',NULL,NULL,'2025-08-04 04:27:33','2025-08-04 04:27:33'),
(80,89,'mobile_money',300.00,'pending','TXN-20250805103259-B30A5A',NULL,NULL,'2025-08-05 07:32:59','2025-08-05 07:32:59'),
(81,90,'mobile_money',70.00,'refunded','TXN-20250805103631-F58AE9',NULL,NULL,'2025-08-05 07:36:31','2025-08-05 07:42:39'),
(82,91,'cash_on_delivery',300.00,'pending','TXN-20250805104151-F672E4',NULL,NULL,'2025-08-05 07:41:51','2025-08-05 07:41:51'),
(83,92,'mobile_money',30000.00,'pending','TXN-20250805104710-E79776',NULL,NULL,'2025-08-05 07:47:10','2025-08-05 07:47:10'),
(84,93,'mobile_money',15000.00,'refunded','TXN-20250805123327-70EFB7',NULL,NULL,'2025-08-05 09:33:27','2025-08-08 23:21:00'),
(85,94,'mobile_money',400.00,'pending','TXN-20250805123618-28A428',NULL,NULL,'2025-08-05 09:36:18','2025-08-05 09:36:18'),
(86,95,'mobile_money',30.00,'pending','TXN-20250805123808-07DEE8',NULL,NULL,'2025-08-05 09:38:08','2025-08-05 09:38:08'),
(87,96,'mobile_money',3000.00,'pending','TXN-20250805124427-B3E097',NULL,NULL,'2025-08-05 09:44:27','2025-08-05 09:44:27'),
(88,97,'mobile_money',7000.00,'pending','TXN-20250805124837-5BFB3E',NULL,NULL,'2025-08-05 09:48:37','2025-08-05 09:48:37'),
(89,98,'mobile_money',300.00,'pending','TXN-20250805125511-F67F7D',NULL,NULL,'2025-08-05 09:55:11','2025-08-05 09:55:11'),
(90,99,'mobile_money',300.00,'pending','TXN-20250805130746-2210DE',NULL,NULL,'2025-08-05 10:07:46','2025-08-05 10:07:46'),
(91,100,'mobile_money',40.00,'pending','TXN-20250805131037-D2E0C0',NULL,NULL,'2025-08-05 10:10:37','2025-08-05 10:10:37'),
(92,101,'mobile_money',400.00,'pending','TXN-20250805131350-EA83F9',NULL,NULL,'2025-08-05 10:13:50','2025-08-05 10:13:50'),
(93,102,'mobile_money',9000.00,'refunded','TXN-20250805131726-64608D',NULL,NULL,'2025-08-05 10:17:26','2025-08-08 23:20:55'),
(94,103,'mobile_money',1500.00,'refunded','TXN-20250805170101-D21BB0',NULL,NULL,'2025-08-05 14:01:01','2025-08-08 23:20:52'),
(95,104,'mobile_money',16000.00,'refunded','TXN-20250805171535-707BD8',NULL,NULL,'2025-08-05 14:15:35','2025-08-08 23:20:49'),
(96,105,'mobile_money',10000.00,'pending','TXN-20250805171843-3CD904',NULL,NULL,'2025-08-05 14:18:43','2025-08-05 14:18:43'),
(97,106,'mobile_money',56000.00,'pending','TXN-20250805172358-E50DC4',NULL,NULL,'2025-08-05 14:23:58','2025-08-05 14:23:58'),
(98,107,'mobile_money',60.00,'pending','TXN-20250805172610-2B54E5',NULL,NULL,'2025-08-05 14:26:10','2025-08-05 14:26:10'),
(99,108,'cash_on_delivery',300.00,'pending','TXN-20250809014403-3C1CB4',NULL,NULL,'2025-08-08 22:44:03','2025-08-08 22:44:03'),
(100,109,'cash_on_delivery',2100.00,'pending','TXN-20250809021058-28A71C',NULL,NULL,'2025-08-08 23:10:58','2025-08-08 23:10:58'),
(101,110,'mobile_money',1350.00,'pending','TXN-20250809022226-23081D',NULL,NULL,'2025-08-08 23:22:26','2025-08-08 23:22:26');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=411 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES
(1,'App\\Models\\User',1,'auth_token','ba4a57df7ada0cebcad027a87b60693ee44935f99ecc5d2386920bd743f4f875','[\"*\"]','2025-07-09 11:42:19',NULL,'2025-07-09 11:34:01','2025-07-09 11:42:19'),
(2,'App\\Models\\User',7,'auth_token','c854d8a3e7fa8d72b5af4e59e0b2d48c7967d1b37d64cf1898a481562d57e10e','[\"*\"]',NULL,NULL,'2025-07-09 11:42:54','2025-07-09 11:42:54'),
(3,'App\\Models\\User',1,'auth_token','c39169af9c4c7b6d2d9f4c2e69597b6a0f8f86eeae6bb19b36732e4f40e09ff5','[\"*\"]',NULL,NULL,'2025-07-09 12:01:51','2025-07-09 12:01:51'),
(4,'App\\Models\\User',2,'auth_token','d6a9b3d9980e253dfd6c191d7b8e8ee28b7543ecf8dc01d973eecc8ee09598da','[\"*\"]',NULL,NULL,'2025-07-09 12:03:06','2025-07-09 12:03:06'),
(8,'App\\Models\\User',6,'auth_token','bece83a435609312c7282f6deec7362d6fc84b12f157a3ded24b60168b3915f8','[\"*\"]',NULL,NULL,'2025-07-09 13:05:45','2025-07-09 13:05:45'),
(10,'App\\Models\\User',28,'auth_token','bc6edd275d8fe10e6ae43beef1699de36a57de5714a66cc191f416128a9e63b7','[\"*\"]','2025-07-10 03:24:47',NULL,'2025-07-10 03:24:41','2025-07-10 03:24:47'),
(11,'App\\Models\\User',28,'auth_token','5e0092c2676d11e6400c05c7377ffdec5b23edcae3619cb1506dc025205945b8','[\"*\"]','2025-07-10 03:40:36',NULL,'2025-07-10 03:34:21','2025-07-10 03:40:36'),
(12,'App\\Models\\User',28,'auth_token','9e52a149991dbdeec231199bd77d24de58b657c14ac9d7c32141c240776d4d63','[\"*\"]','2025-07-10 04:10:01',NULL,'2025-07-10 04:09:58','2025-07-10 04:10:01'),
(13,'App\\Models\\User',4,'auth_token','628a3cae1a524a0095944f5da121b608c650a923a7101f3ba30a6d7db1714c0d','[\"*\"]','2025-07-10 04:11:43',NULL,'2025-07-10 04:11:41','2025-07-10 04:11:43'),
(14,'App\\Models\\User',28,'auth_token','739e6b4dcc890da41fe81c5fc87939910af081a39f6c8c345775b818da94e744','[\"*\"]','2025-07-10 16:32:48',NULL,'2025-07-10 16:14:51','2025-07-10 16:32:48'),
(15,'App\\Models\\User',29,'auth_token','7fba699ff659118dc2958dbd5c77539bf56b0f62e9680131d6401e25c9f39b1d','[\"*\"]','2025-07-10 16:36:08',NULL,'2025-07-10 16:36:04','2025-07-10 16:36:08'),
(16,'App\\Models\\User',30,'auth_token','bcb5d3af51eee0062b4a7ab86ab060bbd3d86ed117c4e24fda2122d9abd2de80','[\"*\"]','2025-07-10 16:40:24',NULL,'2025-07-10 16:39:33','2025-07-10 16:40:24'),
(17,'App\\Models\\User',31,'auth_token','7e0e9de5212442999576627cd03da0fe4ee8ba31ab240abbf890f89a7f43800f','[\"*\"]','2025-07-10 16:44:20',NULL,'2025-07-10 16:43:55','2025-07-10 16:44:20'),
(18,'App\\Models\\User',1,'auth_token','c7463cab8a2f34444a3b3fea2fadce119c7af63213d43c666f4abf8ffde71765','[\"*\"]','2025-07-10 16:48:44',NULL,'2025-07-10 16:46:41','2025-07-10 16:48:44'),
(19,'App\\Models\\User',2,'auth_token','800c5934a92b9563a55c16d08f242bd999f289037e32f02b82bb3dda44ec7e19','[\"*\"]','2025-07-10 16:49:30',NULL,'2025-07-10 16:49:28','2025-07-10 16:49:30'),
(20,'App\\Models\\User',6,'auth_token','0415873d396a404d03279e561ec7f27fc38ead66233b8402bba15f5216d558cd','[\"*\"]','2025-07-10 16:51:15',NULL,'2025-07-10 16:51:14','2025-07-10 16:51:15'),
(21,'App\\Models\\User',4,'auth_token','c25dc3e97798bcdad843a1ddcb0e6ecad90495e5644aa98ac87f97cebb3b4d60','[\"*\"]','2025-07-10 16:51:31',NULL,'2025-07-10 16:51:29','2025-07-10 16:51:31'),
(22,'App\\Models\\User',7,'auth_token','eecb073a073069695aa20e8fb7d54aa46552850be1ef426130a6e4fc55442c7b','[\"*\"]','2025-07-10 16:52:20',NULL,'2025-07-10 16:52:19','2025-07-10 16:52:20'),
(23,'App\\Models\\User',4,'auth_token','aeb2badf9ab2063cab2d826530369ac233ee2e81c78c86223037de42594928f5','[\"*\"]','2025-07-10 16:52:42',NULL,'2025-07-10 16:52:41','2025-07-10 16:52:42'),
(24,'App\\Models\\User',28,'auth_token','63e87bb2e877334d868e286efb37065b308bc51a76f6616f0fd99ff0565542ce','[\"*\"]',NULL,NULL,'2025-07-11 00:38:29','2025-07-11 00:38:29'),
(25,'App\\Models\\User',4,'auth_token','9eaa5188200e78fb62e3062416514848a239f8bcc3fde4a024da6b3f914228ad','[\"*\"]','2025-07-11 00:49:40',NULL,'2025-07-11 00:49:16','2025-07-11 00:49:40'),
(26,'App\\Models\\User',6,'auth_token','b1f80e03e5a93ef750fe383e3ab540a1bc9d56e615399c140300af52d11061b2','[\"*\"]','2025-07-11 00:52:46',NULL,'2025-07-11 00:52:20','2025-07-11 00:52:46'),
(27,'App\\Models\\User',7,'auth_token','ab77af9f75c4973bb2905409cadcab57d8030eed6a1a9298a3f37f32a48bc044','[\"*\"]','2025-07-11 00:53:18',NULL,'2025-07-11 00:53:15','2025-07-11 00:53:18'),
(28,'App\\Models\\User',1,'auth_token','9e9492e1ee2018c35202d774b0c34a4fb47006181530e115ea43c59488e3c9e5','[\"*\"]','2025-07-11 00:53:47',NULL,'2025-07-11 00:53:44','2025-07-11 00:53:47'),
(29,'App\\Models\\User',2,'auth_token','4200b90f71ef9e11d8e174432f4b43f11e5a04ba2eabb1f42cd25c5d5a5117f4','[\"*\"]','2025-07-11 01:04:03',NULL,'2025-07-11 01:03:25','2025-07-11 01:04:03'),
(30,'App\\Models\\User',4,'auth_token','47bd50a706f51734bc39831c3a9c174774680b9136cbbcfb460712d3526083a4','[\"*\"]','2025-07-11 01:05:35',NULL,'2025-07-11 01:05:32','2025-07-11 01:05:35'),
(31,'App\\Models\\User',6,'auth_token','b458306d07fc6791e05aac228382edaea80c6a87e8c5a86479e22baed9b731f0','[\"*\"]','2025-07-11 01:06:31',NULL,'2025-07-11 01:06:28','2025-07-11 01:06:31'),
(32,'App\\Models\\User',1,'auth_token','efc05c26798f5d933445ef4ac6b1849c1af610dffc436d599b6e69852acfc7e3','[\"*\"]','2025-07-11 01:17:56',NULL,'2025-07-11 01:06:47','2025-07-11 01:17:56'),
(33,'App\\Models\\User',28,'auth_token','0447e4d21af2f1775a720532fbe28400cb3f752358680ff6938d1a124659d414','[\"*\"]','2025-07-11 02:03:37',NULL,'2025-07-11 01:18:49','2025-07-11 02:03:37'),
(34,'App\\Models\\User',2,'auth_token','c96e6d2db8b70cee237cb5491938582cc28a969ff928a2bb57f84d42d7fb28bd','[\"*\"]',NULL,NULL,'2025-07-11 01:54:02','2025-07-11 01:54:02'),
(35,'App\\Models\\User',1,'auth_token','a8f15b5bca0e11939ea858d6883fd7e604cb68bb52bc4234a3fc5b37814fefa3','[\"*\"]','2025-07-11 02:19:54',NULL,'2025-07-11 02:19:51','2025-07-11 02:19:54'),
(36,'App\\Models\\User',4,'auth_token','c2a3f190d7d118db2e13a04a51f010ff9a8584a0d5c70270b86f8b8ac7726874','[\"*\"]','2025-07-11 02:21:17',NULL,'2025-07-11 02:20:13','2025-07-11 02:21:17'),
(37,'App\\Models\\User',1,'auth_token','51efa3d0e2e8cf622b014917a31961e1dc480f174534ec2f957b1af2d1c422d3','[\"*\"]','2025-07-11 02:24:26',NULL,'2025-07-11 02:23:52','2025-07-11 02:24:26'),
(38,'App\\Models\\User',1,'auth_token','d15e9b1947fd01031d18fdc619bd0f165fab0d39e01a1fdcd27d7d0b84c36448','[\"*\"]','2025-07-11 02:32:49',NULL,'2025-07-11 02:31:04','2025-07-11 02:32:49'),
(39,'App\\Models\\User',7,'auth_token','1be68b7d972dadadd9f1bc96c7e002bd6289ac667536f9e7cc617c1d112da3c6','[\"*\"]','2025-07-11 02:39:44',NULL,'2025-07-11 02:39:42','2025-07-11 02:39:44'),
(40,'App\\Models\\User',6,'auth_token','f3178884e6b3ec498a13c39cc3c4da294a8d938c99a7be98d9a7bc4252c95f9a','[\"*\"]','2025-07-11 02:44:44',NULL,'2025-07-11 02:40:00','2025-07-11 02:44:44'),
(41,'App\\Models\\User',28,'auth_token','b7cbc92aab3d6a869b432e6a877b405cd1254815b8f916a160461262c89b8fb4','[\"*\"]','2025-07-11 02:45:57',NULL,'2025-07-11 02:45:10','2025-07-11 02:45:57'),
(42,'App\\Models\\User',2,'auth_token','34fca05af1f6f27d7bd5678a3d46b3a17c15f0cd23c6e74030a9c1dfc5c6b5ad','[\"*\"]',NULL,NULL,'2025-07-11 02:47:18','2025-07-11 02:47:18'),
(43,'App\\Models\\User',28,'auth_token','8d895fbfcc6ddbd10b580fd7f2fc7de4d87afee333a666834a3b06b327e0f106','[\"*\"]',NULL,NULL,'2025-07-11 02:47:52','2025-07-11 02:47:52'),
(44,'App\\Models\\User',4,'auth_token','a1eb47df8759ba820ce34e0a5b173acd8ca25c25eeb9858c347a7ae942cefaf3','[\"*\"]','2025-07-11 02:57:49',NULL,'2025-07-11 02:57:47','2025-07-11 02:57:49'),
(45,'App\\Models\\User',4,'auth_token','586fadd24369de201a015b81ec799478af02bad7a6c3dd8c5379c00857673876','[\"*\"]','2025-07-11 02:58:24',NULL,'2025-07-11 02:58:22','2025-07-11 02:58:24'),
(46,'App\\Models\\User',1,'auth_token','57c3fbc48f8f153d78654202ed9369ae233cdcf1048c36ce8a47426193e5aeff','[\"*\"]','2025-07-11 02:58:40',NULL,'2025-07-11 02:58:38','2025-07-11 02:58:40'),
(47,'App\\Models\\User',28,'auth_token','d1a73acd7f9a604cc95c1f58cdb43cc5fff57b5a39ef6d23b51ed65cac646c79','[\"*\"]',NULL,NULL,'2025-07-11 03:00:35','2025-07-11 03:00:35'),
(48,'App\\Models\\User',2,'auth_token','5cba35e8f10e54782ddf136ca0d7811e1f24e2e59750aaffcd77eafb84d2d382','[\"*\"]',NULL,NULL,'2025-07-11 03:00:53','2025-07-11 03:00:53'),
(49,'App\\Models\\User',28,'auth_token','0ddc6b61e7abe6dcab381fe8a3a7f9aab56f8e7f3ce0f55eed69781c7710e42c','[\"*\"]',NULL,NULL,'2025-07-11 03:01:14','2025-07-11 03:01:14'),
(50,'App\\Models\\User',4,'auth_token','949974537292e9b2e914595649efc9e6de933ce5c2dc3e8bf0544ab2df3a30ad','[\"*\"]','2025-07-11 05:14:44',NULL,'2025-07-11 04:35:58','2025-07-11 05:14:44'),
(51,'App\\Models\\User',4,'auth_token','18d3f49b6e816cd9a9f76a43367e33569c7283d8d627f3236580de126a4b76d9','[\"*\"]','2025-07-11 05:17:16',NULL,'2025-07-11 05:15:16','2025-07-11 05:17:16'),
(52,'App\\Models\\User',28,'auth_token','2b2224c1bc25fb3ac5d80e81b65030316b3d33f1db5c231eeda60afa21c7998a','[\"*\"]','2025-07-12 14:18:37',NULL,'2025-07-12 14:17:45','2025-07-12 14:18:37'),
(53,'App\\Models\\User',4,'auth_token','a9929605679f1a53895ac3836dc06264950b4d951876686d7629c9b8185febc1','[\"*\"]','2025-07-12 14:20:03',NULL,'2025-07-12 14:20:01','2025-07-12 14:20:03'),
(54,'App\\Models\\User',6,'auth_token','b22c456cb1bcd7c6bf14af2d12af8ba44470f6965016321880a63e686220fada','[\"*\"]','2025-07-12 14:22:02',NULL,'2025-07-12 14:22:00','2025-07-12 14:22:02'),
(55,'App\\Models\\User',7,'auth_token','a4085a3004f34c9728edd4f47d35a31d419ddaf4931098992ccd06ee77a7ef34','[\"*\"]','2025-07-12 15:33:29',NULL,'2025-07-12 14:23:04','2025-07-12 15:33:29'),
(56,'App\\Models\\User',6,'auth_token','7360250e594cc976b012e83b7a4dba770457a16d1d02c4f8dc2e9bd952d8e645','[\"*\"]','2025-07-12 15:34:47',NULL,'2025-07-12 15:33:55','2025-07-12 15:34:47'),
(57,'App\\Models\\User',4,'auth_token','4d00b70947b00221bf2d3419b510a3d6a480e91e00dc0a662259ab6209b79f2b','[\"*\"]','2025-07-12 15:55:30',NULL,'2025-07-12 15:36:40','2025-07-12 15:55:30'),
(58,'App\\Models\\User',6,'auth_token','985c9e3505b73d4e4616f64bc4499042467d5f19e565028e48f3e8df2539083b','[\"*\"]','2025-07-12 16:05:14',NULL,'2025-07-12 15:55:50','2025-07-12 16:05:14'),
(59,'App\\Models\\User',7,'auth_token','25a02089d52a75f266792d5276a66fb2b2276beca34f8e184af10a2561ec4343','[\"*\"]','2025-07-12 16:06:03',NULL,'2025-07-12 16:06:01','2025-07-12 16:06:03'),
(60,'App\\Models\\User',6,'auth_token','4fa05648f2d09b21d8d1bd67c20758e1a18a20ee6acddc2fb74dc1b6bc57ea86','[\"*\"]','2025-07-12 16:10:35',NULL,'2025-07-12 16:06:33','2025-07-12 16:10:35'),
(61,'App\\Models\\User',1,'auth_token','d5452a6c991baabdb0729217c2381a49cf8cc150a84fa9900a5da35a1e6c1ed6','[\"*\"]','2025-07-12 16:30:34',NULL,'2025-07-12 16:11:49','2025-07-12 16:30:34'),
(62,'App\\Models\\User',4,'auth_token','b64dea1566db506b1d4c86381079ec61f2029823b2645446bed9a5a03eaa3837','[\"*\"]','2025-07-12 16:33:53',NULL,'2025-07-12 16:33:13','2025-07-12 16:33:53'),
(63,'App\\Models\\User',6,'auth_token','96bacccbda79547d78fef7743072cec73a4bf2dfed40c9133ec90ce488e87edb','[\"*\"]','2025-07-12 16:53:03',NULL,'2025-07-12 16:34:14','2025-07-12 16:53:03'),
(64,'App\\Models\\User',7,'auth_token','3937bd844a52d76185ab5f15d221add944ba08c81e603146f8e4ca6a13f98a9c','[\"*\"]','2025-07-12 16:53:25',NULL,'2025-07-12 16:53:23','2025-07-12 16:53:25'),
(65,'App\\Models\\User',28,'auth_token','80be4c2c25ed241abb0059805bb05ffe0ac08e346e0a443c80827e5c652f001b','[\"*\"]','2025-07-14 04:28:02',NULL,'2025-07-14 04:27:59','2025-07-14 04:28:02'),
(66,'App\\Models\\User',1,'auth_token','5db96bf8bdb706db9a471ed3de902050371d7db53b63cb653c4abe792ed46f57','[\"*\"]','2025-07-14 04:46:26',NULL,'2025-07-14 04:31:19','2025-07-14 04:46:26'),
(67,'App\\Models\\User',1,'auth_token','0f7e74608847740c3ab0d289abe09fc94713c8a6d2186deec8a100f67ff5c68a','[\"*\"]','2025-07-14 05:18:38',NULL,'2025-07-14 05:17:27','2025-07-14 05:18:38'),
(68,'App\\Models\\User',2,'auth_token','b16380c45aff9c0c67f5d23144909edd10b9174bdea7b4481ae23cb4978f4c19','[\"*\"]','2025-07-14 06:55:26',NULL,'2025-07-14 06:55:24','2025-07-14 06:55:26'),
(69,'App\\Models\\User',32,'auth_token','7bb2252eec655b12e914d33553766fbc8f12d3f0d6df70121d841e863a50afb3','[\"*\"]','2025-07-18 02:06:28',NULL,'2025-07-18 00:58:54','2025-07-18 02:06:28'),
(70,'App\\Models\\User',4,'auth_token','71b97fbceab45b603e3ed36500d0ac8e2bdce19bba7835395cc3c9f70ce5195c','[\"*\"]','2025-07-18 02:13:22',NULL,'2025-07-18 02:09:14','2025-07-18 02:13:22'),
(71,'App\\Models\\User',32,'auth_token','fd7db4d27acf52107cd78587f327b9e34938f90b1bdd85190ae75924766a7d23','[\"*\"]','2025-07-18 02:13:38',NULL,'2025-07-18 02:13:36','2025-07-18 02:13:38'),
(72,'App\\Models\\User',4,'auth_token','deeb585fcadbef7acaf20c4618d47995251365ab08116254d673c6cc2a6d3b4a','[\"*\"]','2025-07-18 02:16:03',NULL,'2025-07-18 02:14:29','2025-07-18 02:16:03'),
(73,'App\\Models\\User',32,'auth_token','7602863e2559a9fb9b2bd2e85d09d3070213ff08405b68182ebfbc5b649c2a05','[\"*\"]','2025-07-18 02:16:21',NULL,'2025-07-18 02:16:18','2025-07-18 02:16:21'),
(74,'App\\Models\\User',4,'auth_token','c892ac2f8484ca14dad02b1b09ef142d505bf4bbd71089712d43f6a82f47c42f','[\"*\"]','2025-07-18 02:20:53',NULL,'2025-07-18 02:20:50','2025-07-18 02:20:53'),
(75,'App\\Models\\User',6,'auth_token','0e2793c60195db7d84a6114d63c6235728e4bab6d2d21839afcea2448c38c345','[\"*\"]','2025-07-18 02:29:58',NULL,'2025-07-18 02:23:17','2025-07-18 02:29:58'),
(76,'App\\Models\\User',7,'auth_token','d9605a91efe6b9a0f1453153314c498256f66ecb97dc17bc2dc234f3607439ca','[\"*\"]','2025-07-18 02:37:18',NULL,'2025-07-18 02:37:16','2025-07-18 02:37:18'),
(77,'App\\Models\\User',1,'auth_token','db852852cb589ac5257eec6487d335f9c71257d46b143b4737606e6dd1700589','[\"*\"]','2025-07-18 02:46:30',NULL,'2025-07-18 02:39:15','2025-07-18 02:46:30'),
(78,'App\\Models\\User',1,'auth_token','f333e3e59b067b8aa7ccd247021a4083e1ed7422a94c60505490069c1eeaa2d1','[\"*\"]','2025-07-18 03:45:01',NULL,'2025-07-18 03:44:59','2025-07-18 03:45:01'),
(79,'App\\Models\\User',1,'auth_token','fec830adc3e2e880c5a1375a80ecc9571c8c9fc10ae133ac46381dc4f725be7d','[\"*\"]','2025-07-18 13:29:21',NULL,'2025-07-18 03:59:08','2025-07-18 13:29:21'),
(80,'App\\Models\\User',1,'auth_token','c10ee7e4ebea91dbaf21199666ce5db759b7e19bf97ab0bee92efeabb167ac44','[\"*\"]','2025-07-18 11:53:16',NULL,'2025-07-18 11:42:43','2025-07-18 11:53:16'),
(81,'App\\Models\\User',1,'auth_token','18f061b363914ee796450c4a032cbc4a08c15f10a8814eeda50404704d28f09a','[\"*\"]','2025-07-18 12:48:47',NULL,'2025-07-18 12:34:20','2025-07-18 12:48:47'),
(82,'App\\Models\\User',4,'auth_token','cc92aaceed679125309fb00cf221207f551f9c7232217478c92c0cae074895ad','[\"*\"]','2025-07-18 12:47:20',NULL,'2025-07-18 12:42:13','2025-07-18 12:47:20'),
(83,'App\\Models\\User',1,'auth_token','4342f480c2d4e5cd1ad59e14e72a27888d30d99fb03984dc1813252cd81aff9f','[\"*\"]',NULL,NULL,'2025-07-18 12:49:04','2025-07-18 12:49:04'),
(84,'App\\Models\\User',2,'auth_token','33002da14e93d4b1be8c5452f0dff37c9b3788a768b6b7e89c64f616e999af0b','[\"*\"]',NULL,NULL,'2025-07-18 12:49:19','2025-07-18 12:49:19'),
(85,'App\\Models\\User',2,'auth_token','975060a837073b5e204536384de2fd93ddb808e74bf7984a92701d610f17c2b9','[\"*\"]','2025-07-18 13:41:17',NULL,'2025-07-18 13:32:41','2025-07-18 13:41:17'),
(86,'App\\Models\\User',4,'auth_token','3a21c4791a10100e0dc552509a0b166a43dc3d67b91257025753a15a36ceef18','[\"*\"]','2025-07-18 13:36:04',NULL,'2025-07-18 13:33:48','2025-07-18 13:36:04'),
(87,'App\\Models\\User',6,'auth_token','ea3398804f0df4add2dbc3af2febf2a211685a85f918de20fa1cb16f9c2ea1c4','[\"*\"]','2025-07-18 13:43:47',NULL,'2025-07-18 13:41:48','2025-07-18 13:43:47'),
(88,'App\\Models\\User',7,'auth_token','a235fd62591e697ba23e5d714caf17bb99fda6a4836e4c00a10795ab6ead33ff','[\"*\"]','2025-07-18 13:45:36',NULL,'2025-07-18 13:45:33','2025-07-18 13:45:36'),
(89,'App\\Models\\User',1,'auth_token','b0767b69fd5c09a43ae4c1b34c79c026c02a52aea77c6d8bf82e9ab5ff5d6bc1','[\"*\"]',NULL,NULL,'2025-07-18 14:51:50','2025-07-18 14:51:50'),
(90,'App\\Models\\User',1,'auth_token','b02701b4d85116781d5f13e741ccb799d1ade864f11b0b257b7edd5429573cab','[\"*\"]','2025-07-18 14:59:20',NULL,'2025-07-18 14:57:25','2025-07-18 14:59:20'),
(91,'App\\Models\\User',28,'auth_token','913c9f200e79b810345d67c803583ffe4f0a31fb2053694b0c5aaf2b10a0cd23','[\"*\"]','2025-07-18 14:59:31',NULL,'2025-07-18 14:59:30','2025-07-18 14:59:31'),
(92,'App\\Models\\User',1,'auth_token','d6781e8c7c4feb2fc712aa4164be2a4a4bc4b6a5f1580c27ec6d6d632d040b20','[\"*\"]','2025-07-18 15:19:08',NULL,'2025-07-18 15:08:07','2025-07-18 15:19:08'),
(93,'App\\Models\\User',1,'auth_token','8ca4b2b6f5848b0c1eeaff2e2db2c2ad09c4e3b25497313d3d4e46cd39b0b0ec','[\"*\"]','2025-07-18 15:20:25',NULL,'2025-07-18 15:19:20','2025-07-18 15:20:25'),
(95,'App\\Models\\User',4,'auth_token','1780e7fbc848f3553cad441dbd64156335c5cbc5da3471b9eb5f25b3c330efa2','[\"*\"]','2025-07-18 15:24:22',NULL,'2025-07-18 15:23:19','2025-07-18 15:24:22'),
(96,'App\\Models\\User',4,'auth_token','3a3f5ac2bc3eff151ade6cc451489ba1047db51b9e6b3c0a280f8d3942272231','[\"*\"]','2025-07-18 15:25:51',NULL,'2025-07-18 15:25:49','2025-07-18 15:25:51'),
(97,'App\\Models\\User',1,'auth_token','848e9cb90f057a9723a4b5a863229bf82c689b05a89ad70857c8048fd5211864','[\"*\"]','2025-07-18 15:26:27',NULL,'2025-07-18 15:26:05','2025-07-18 15:26:27'),
(98,'App\\Models\\User',7,'auth_token','6124c78825d9688ca4d2d6f48e30410e66c9028321e80bc83acda95de5efb757','[\"*\"]','2025-07-18 15:26:43',NULL,'2025-07-18 15:26:41','2025-07-18 15:26:43'),
(99,'App\\Models\\User',6,'auth_token','b0ff76e7b27dcf2343be50ce4a67c8c001d0d667d56ad9ce4bf053d9942328c0','[\"*\"]','2025-07-18 15:27:44',NULL,'2025-07-18 15:27:06','2025-07-18 15:27:44'),
(100,'App\\Models\\User',33,'auth_token','c0cb32186e63d35c678d1dfd343841dc70261bd2c9be5626a974b9e334d21531','[\"*\"]','2025-07-18 15:28:40',NULL,'2025-07-18 15:28:38','2025-07-18 15:28:40'),
(101,'App\\Models\\User',1,'auth_token','45025620902bfd83e9a736cc067724d2777a3e9d10e6ca5fb8c3073c6968062e','[\"*\"]','2025-07-21 12:15:37',NULL,'2025-07-21 12:15:15','2025-07-21 12:15:37'),
(104,'App\\Models\\User',1,'auth_token','b184aa96583784ec8dcf3d4d3e20f4a768a8e168ee56102d9700eaa9946d0de1','[\"*\"]','2025-07-21 14:34:53',NULL,'2025-07-21 12:32:06','2025-07-21 14:34:53'),
(105,'App\\Models\\User',4,'auth_token','bd36cacee31acb96e4f2d154e20e4b6c00061c69579e2d92e50bd8b2fa851f5b','[\"*\"]','2025-07-21 14:41:24',NULL,'2025-07-21 14:37:28','2025-07-21 14:41:24'),
(106,'App\\Models\\User',6,'auth_token','3d49f0110a498e7d1e9490aebf53eb962639e116b4d724c9206c27d23b6eb273','[\"*\"]','2025-07-21 14:43:54',NULL,'2025-07-21 14:41:51','2025-07-21 14:43:54'),
(107,'App\\Models\\User',6,'auth_token','a6b9ee4ca8a3eb83ca9dbb3ea18b494d24d551c4dc15ced34644a7bfb7401f53','[\"*\"]','2025-07-21 15:19:56',NULL,'2025-07-21 14:51:40','2025-07-21 15:19:56'),
(108,'App\\Models\\User',7,'auth_token','bad91299714026d38ccca1f02731b3a80f502144e3b00592dfe8fdd8ea395857','[\"*\"]','2025-07-21 15:20:22',NULL,'2025-07-21 15:20:20','2025-07-21 15:20:22'),
(110,'App\\Models\\User',4,'auth_token','38056c7e703e5d85a86816e3a19c53c8de3da7f57d9345243637839b4d1b4eb3','[\"*\"]','2025-07-21 15:21:55',NULL,'2025-07-21 15:21:35','2025-07-21 15:21:55'),
(111,'App\\Models\\User',4,'auth_token','875964176d74e5e48c421d92f3348e3692e5f5f3c96895bbbdf25d5232e06990','[\"*\"]','2025-07-21 15:22:45',NULL,'2025-07-21 15:22:18','2025-07-21 15:22:45'),
(112,'App\\Models\\User',1,'auth_token','50ebff8bfc80d0729e4590f89835cfd11b0de8943a7d901ec2b14e80aec0bdcf','[\"*\"]','2025-07-21 15:23:15',NULL,'2025-07-21 15:23:12','2025-07-21 15:23:15'),
(113,'App\\Models\\User',6,'auth_token','a45f9e5482919db50a779e21be33aad62fb6d63643c52e935cce39c4c90eaa71','[\"*\"]','2025-07-21 15:28:00',NULL,'2025-07-21 15:23:44','2025-07-21 15:28:00'),
(114,'App\\Models\\User',7,'auth_token','d583136b6d1dd2b878c2e2a241bec3f139d061f084c5b94f20e67686790e40e2','[\"*\"]','2025-07-21 15:29:39',NULL,'2025-07-21 15:29:37','2025-07-21 15:29:39'),
(115,'App\\Models\\User',1,'auth_token','8e690b7a4931f70562ab7c35556b82600b3716e22c9a18d121e0c9b7642035da','[\"*\"]','2025-07-21 15:31:23',NULL,'2025-07-21 15:31:21','2025-07-21 15:31:23'),
(117,'App\\Models\\User',4,'auth_token','d8fbf90d19d68d1796f65feec0198fea2812270b8365d90f53a2cb4400de65f0','[\"*\"]','2025-07-21 15:45:56',NULL,'2025-07-21 15:45:09','2025-07-21 15:45:56'),
(119,'App\\Models\\User',4,'auth_token','9fbea10c8cb76b662248df00f51a716b1645b3509a26bd8a2beb5f4262f9ebf1','[\"*\"]','2025-07-21 16:01:18',NULL,'2025-07-21 15:47:36','2025-07-21 16:01:18'),
(120,'App\\Models\\User',1,'auth_token','6c3602c636ecc240eafd53068c5f8918e8b2f09a0f2c8809307fa429ac200b6c','[\"*\"]','2025-07-21 16:12:53',NULL,'2025-07-21 16:09:59','2025-07-21 16:12:53'),
(121,'App\\Models\\User',4,'auth_token','c6f097b302e6d2ee4b3a32bf173da9a1410c062ce1312e43106516c41e5eb97e','[\"*\"]','2025-07-22 07:33:12',NULL,'2025-07-22 07:30:02','2025-07-22 07:33:12'),
(122,'App\\Models\\User',7,'auth_token','06cad1ba4756798f7529b8fc7a9f3a86694278fbecf6d6096324f56c795b126e','[\"*\"]','2025-07-22 07:33:48',NULL,'2025-07-22 07:33:26','2025-07-22 07:33:48'),
(123,'App\\Models\\User',6,'auth_token','00501d12be6687d1019d06fc36df9273318b7bc0e127888c4a0e1229afd4e184','[\"*\"]','2025-07-22 07:48:26',NULL,'2025-07-22 07:48:00','2025-07-22 07:48:26'),
(124,'App\\Models\\User',4,'auth_token','371ef28453ecc198d28771369af5980e74017dc84cc44eead8cd4568910997c1','[\"*\"]','2025-07-22 08:32:11',NULL,'2025-07-22 07:50:22','2025-07-22 08:32:11'),
(125,'App\\Models\\User',1,'auth_token','37cd1a19b2fc922701ff47604484f5df2c4fa9f6b387acc0eb81ef8604f8c368','[\"*\"]','2025-07-22 08:05:17',NULL,'2025-07-22 08:03:07','2025-07-22 08:05:17'),
(126,'App\\Models\\User',7,'auth_token','a0e51e93dbeeaa066980e72e27b8ffda9ddad78974c484ad8d931c1c7a49d5a4','[\"*\"]','2025-07-22 08:24:21',NULL,'2025-07-22 08:10:21','2025-07-22 08:24:21'),
(127,'App\\Models\\User',1,'auth_token','10d3f780da15c9911a421d2181129547f7ca87b2e9a8df64398c8115024c345a','[\"*\"]','2025-07-22 08:34:00',NULL,'2025-07-22 08:11:50','2025-07-22 08:34:00'),
(128,'App\\Models\\User',7,'auth_token','eabbc4c57ecbd809351f7336e938515e85845dfb2d04b5df412502a41a8c63bf','[\"*\"]','2025-07-22 08:25:58',NULL,'2025-07-22 08:25:06','2025-07-22 08:25:58'),
(129,'App\\Models\\User',36,'auth_token','3a03b11ba2107d0dc6fea863157ee00775bd8893d76199a0d5ae04e880a4583e','[\"*\"]','2025-07-22 08:27:49',NULL,'2025-07-22 08:27:31','2025-07-22 08:27:49'),
(130,'App\\Models\\User',7,'auth_token','7c2a54a6621063bcefcde8611577321329a6868c3730a7521a5fba2f7db2db85','[\"*\"]','2025-07-22 08:29:05',NULL,'2025-07-22 08:28:49','2025-07-22 08:29:05'),
(131,'App\\Models\\User',4,'auth_token','088a583227ae5d8d778a58ce240b77b1f81705b3f6c375f5d5c8d7ea09daff94','[\"*\"]','2025-07-22 08:35:24',NULL,'2025-07-22 08:35:21','2025-07-22 08:35:24'),
(133,'App\\Models\\User',4,'auth_token','e56cf3ee61018ad5349fd070bf97d956ac8826d3942fc5af2e3b37da5d0dc744','[\"*\"]','2025-07-22 08:36:54',NULL,'2025-07-22 08:36:21','2025-07-22 08:36:54'),
(135,'App\\Models\\User',7,'auth_token','aaf839abf2f4e6cefe50a38610fbabd8f0e227840b90a30985676b5b00890bea','[\"*\"]','2025-07-22 08:38:35',NULL,'2025-07-22 08:37:39','2025-07-22 08:38:35'),
(136,'App\\Models\\User',6,'auth_token','53376e9fe44afff9b3918641f6046f00fea26a89b6e656b961e0990a2da5e641','[\"*\"]','2025-07-22 08:40:59',NULL,'2025-07-22 08:39:03','2025-07-22 08:40:59'),
(137,'App\\Models\\User',7,'auth_token','b63999ed38dd0ffed00b544efee5aeb851906dfc1c76ad8e8bf818608a71c663','[\"*\"]','2025-07-22 08:41:31',NULL,'2025-07-22 08:41:29','2025-07-22 08:41:31'),
(138,'App\\Models\\User',1,'auth_token','1684653aaf5e64d8d2f93cd7b4afae7c4a7c77841b63755124718fd312da6a0e','[\"*\"]','2025-07-22 08:45:34',NULL,'2025-07-22 08:41:56','2025-07-22 08:45:34'),
(139,'App\\Models\\User',7,'auth_token','1a8bf979cbe6eb4710d5ae65324a8e5b73524af0e4174efacd8363e1e9744baf','[\"*\"]','2025-07-22 08:47:13',NULL,'2025-07-22 08:47:11','2025-07-22 08:47:13'),
(140,'App\\Models\\User',4,'auth_token','fe41ec39d16b844681af6ffbf99bc97f958d8953f5e534129727fa60d3ce24cd','[\"*\"]','2025-07-22 08:49:04',NULL,'2025-07-22 08:49:02','2025-07-22 08:49:04'),
(145,'App\\Models\\User',1,'auth_token','a63e421a40e0c258691934aedea34a59d6308d902abd780300c9dff9852322f8','[\"*\"]','2025-07-22 09:04:37',NULL,'2025-07-22 09:04:35','2025-07-22 09:04:37'),
(147,'App\\Models\\User',1,'auth_token','04cd531127dbed932d430f096504bd3ad7f852c05e343041319696bf17893de5','[\"*\"]',NULL,NULL,'2025-07-22 09:39:30','2025-07-22 09:39:30'),
(148,'App\\Models\\User',1,'auth_token','f292f5dc6d08fdee2446d26e74338ac57108d11eb200e09733b1bee705a9704d','[\"*\"]','2025-07-22 10:21:55',NULL,'2025-07-22 09:50:33','2025-07-22 10:21:55'),
(150,'App\\Models\\User',4,'auth_token','748eb4d73a551db9eb3ceda228ba1e9acb55a87f60f76d598f1c0483968038c1','[\"*\"]','2025-07-22 10:34:55',NULL,'2025-07-22 10:26:41','2025-07-22 10:34:55'),
(151,'App\\Models\\User',1,'auth_token','6f42e4c02427a6c8921c0c0e7c5a3e87d711bfe9919362e42840e30fbf470e57','[\"*\"]','2025-07-22 10:43:22',NULL,'2025-07-22 10:36:13','2025-07-22 10:43:22'),
(152,'App\\Models\\User',4,'auth_token','1bb9981cacfb9b7e82c4f4211bedf6832562fed2b83f2a3ed1312e196b6c24d8','[\"*\"]','2025-07-22 10:47:06',NULL,'2025-07-22 10:47:04','2025-07-22 10:47:06'),
(154,'App\\Models\\User',4,'auth_token','24f84589634cb5cc5ab3476f616c79decfbd2af1c192eb71c97448bca578fb41','[\"*\"]','2025-07-23 10:20:00',NULL,'2025-07-23 10:14:46','2025-07-23 10:20:00'),
(156,'App\\Models\\User',4,'auth_token','6a2704bfcfb76651562796687dad065898efa3d82281198f410d35f294a21406','[\"*\"]','2025-07-23 10:24:08',NULL,'2025-07-23 10:23:24','2025-07-23 10:24:08'),
(158,'App\\Models\\User',6,'auth_token','961f554ae261563ba6322db4a974c1327661a0b0597fb4470534e1d7e137631e','[\"*\"]','2025-07-23 11:29:19',NULL,'2025-07-23 10:26:37','2025-07-23 11:29:19'),
(161,'App\\Models\\User',1,'auth_token','c57720cc910b99a588e72c885343bfdd66597c63ea382a31e1c3d11614ae54f2','[\"*\"]','2025-07-23 11:41:02',NULL,'2025-07-23 11:41:00','2025-07-23 11:41:02'),
(162,'App\\Models\\User',1,'auth_token','5e5c2f473899baf57bddc006b12a19b4088f0ce031a1665573babd526fa98290','[\"*\"]','2025-07-23 12:29:16',NULL,'2025-07-23 12:08:48','2025-07-23 12:29:16'),
(164,'App\\Models\\User',1,'auth_token','4ff7105cab590cf21c0e6125114e4d243d7cc093a18683cf2e9f6e55617cf4e6','[\"*\"]','2025-07-23 12:32:02',NULL,'2025-07-23 12:31:12','2025-07-23 12:32:02'),
(167,'App\\Models\\User',1,'auth_token','1cff90422032fceb07d32241ec8f3d91cdd84758481818ad2b34f9d8d98aacee','[\"*\"]','2025-07-23 12:41:41',NULL,'2025-07-23 12:41:39','2025-07-23 12:41:41'),
(168,'App\\Models\\User',1,'auth_token','f3c05f46a28b66b0313580656fafd21088d781acb38215661916e1a6523b8592','[\"*\"]','2025-07-24 01:08:43',NULL,'2025-07-24 00:20:18','2025-07-24 01:08:43'),
(169,'App\\Models\\User',1,'auth_token','a9c480f64d98657b665c73caf9d4629c9d7c4a5d0b0ba79a97cc74ece86dc8a0','[\"*\"]','2025-07-24 01:14:30',NULL,'2025-07-24 00:25:05','2025-07-24 01:14:30'),
(170,'App\\Models\\User',1,'auth_token','1ffb46eaddd2fbe1c48576699406e0c14cde3cde61a625d578ac64b30e743db7','[\"*\"]','2025-07-24 05:42:36',NULL,'2025-07-24 05:42:07','2025-07-24 05:42:36'),
(171,'App\\Models\\User',1,'auth_token','8e5137dc19147ac0ced6a336d3543ff3942b2a6a6dc76b8192edb9b62c2fa96c','[\"*\"]','2025-07-24 06:47:06',NULL,'2025-07-24 06:47:04','2025-07-24 06:47:06'),
(172,'App\\Models\\User',38,'auth_token','eb610780c94477884c94a0e50302ddf5780209a26877ae1e3e0ca148807706ef','[\"*\"]','2025-07-24 06:52:27',NULL,'2025-07-24 06:47:40','2025-07-24 06:52:27'),
(173,'App\\Models\\User',1,'auth_token','86d9f4c2258a7aca79a077a83e6b63d25213c70bb5c6c2aa65b3ffc214d3162f','[\"*\"]','2025-07-24 07:55:53',NULL,'2025-07-24 07:48:21','2025-07-24 07:55:53'),
(175,'App\\Models\\User',1,'auth_token','9097be743f1dd251f3d4fb6b9f491ce9884719e960f7cb63197d2e87f1022be8','[\"*\"]','2025-07-24 08:28:57',NULL,'2025-07-24 08:18:50','2025-07-24 08:28:57'),
(176,'App\\Models\\User',1,'auth_token','c542775b604fb3374cdb10e6b2a4cb91f27ab881af28301d44f6f086514d9c12','[\"*\"]','2025-07-24 11:13:02',NULL,'2025-07-24 10:09:53','2025-07-24 11:13:02'),
(179,'App\\Models\\User',4,'auth_token','fed80be24df5c2385f4afdd443e79576dafc9a68bc7608a6ef0788686dd97a55','[\"*\"]','2025-07-25 02:49:07',NULL,'2025-07-25 02:48:19','2025-07-25 02:49:07'),
(182,'App\\Models\\User',1,'auth_token','2d7379632001e0313c19e01de5ae01a670e19082f5a975abe1e39f6e50aff0f6','[\"*\"]',NULL,NULL,'2025-07-25 03:05:26','2025-07-25 03:05:26'),
(185,'App\\Models\\User',7,'auth_token','45fbdddcb420f1ea61adbca51bd5ef09ae3c7f3751579b382f84f6a5c02f6cda','[\"*\"]','2025-07-25 03:25:44',NULL,'2025-07-25 03:19:22','2025-07-25 03:25:44'),
(186,'App\\Models\\User',1,'auth_token','a97cfe16d72915d719e4241780d7473877ca7f7057ee578f190ba557d2240bf4','[\"*\"]','2025-07-25 03:22:00',NULL,'2025-07-25 03:21:26','2025-07-25 03:22:00'),
(189,'App\\Models\\User',1,'auth_token','53ed9696a27d62aac2c8386642eacaaa4e47b0d8c309e5fc5067b2b9012d0061','[\"*\"]','2025-07-25 04:04:17',NULL,'2025-07-25 03:31:10','2025-07-25 04:04:17'),
(190,'App\\Models\\User',6,'auth_token','c21fd934dce6b82cdb4d21cf6c582dc2ee49efda4b3128abcb2847cae2fe8e74','[\"*\"]','2025-07-25 03:35:13',NULL,'2025-07-25 03:33:15','2025-07-25 03:35:13'),
(192,'App\\Models\\User',4,'auth_token','c1c07337e1eb3fbfaf2c3b130a46d8962c798184ff3a7267d52f9c18e9cd5082','[\"*\"]','2025-07-25 03:39:22',NULL,'2025-07-25 03:36:54','2025-07-25 03:39:22'),
(196,'App\\Models\\User',1,'auth_token','0443091d32b3af5f731c2e4b1011d187b5b88e82a146e21165c39b67d3127e01','[\"*\"]','2025-07-25 04:04:17',NULL,'2025-07-25 03:44:27','2025-07-25 04:04:17'),
(197,'App\\Models\\User',1,'auth_token','4450be557501950b04849d7a83091fcdfee7cc24f3e6e0dd8c81c933a4c1db8d','[\"*\"]','2025-07-25 04:25:40',NULL,'2025-07-25 04:09:56','2025-07-25 04:25:40'),
(198,'App\\Models\\User',1,'auth_token','5bdf89659784031dfc12aad288d50f2567cff072414dc7e3304ac65f11ba5329','[\"*\"]','2025-07-25 04:36:29',NULL,'2025-07-25 04:32:43','2025-07-25 04:36:29'),
(199,'App\\Models\\User',36,'auth_token','706e682af55e764abbe3fefc6779720276d51676a51e6fbe746ae850f53de19c','[\"*\"]','2025-07-25 04:36:29',NULL,'2025-07-25 04:33:27','2025-07-25 04:36:29'),
(200,'App\\Models\\User',1,'auth_token','b9d2080ada488edb8018f4baa279e54c9a5c1189ff3ce3345fe8d2ab331025b0','[\"*\"]','2025-07-25 08:12:32',NULL,'2025-07-25 08:12:04','2025-07-25 08:12:32'),
(201,'App\\Models\\User',4,'auth_token','5e791ed3e114e3dc1eb405d3d85d53db97e346f6d2f62d521961fcdd812a137e','[\"*\"]','2025-07-25 08:13:00',NULL,'2025-07-25 08:12:47','2025-07-25 08:13:00'),
(202,'App\\Models\\User',1,'auth_token','448478b50eaf0949fb7863af9a4ab199827ad880dc3a471c2370b97a386382e2','[\"*\"]','2025-07-25 08:14:57',NULL,'2025-07-25 08:13:12','2025-07-25 08:14:57'),
(204,'App\\Models\\User',4,'auth_token','77e4edc6bcf30ff8c84b99f4e154944994dad092b593c6442bbcb079573c7cde','[\"*\"]','2025-07-25 08:22:37',NULL,'2025-07-25 08:16:38','2025-07-25 08:22:37'),
(205,'App\\Models\\User',1,'auth_token','44d03f66b986e049fc9b5a8f9935bc1753a146cea1011b8973c00846be305232','[\"*\"]','2025-07-25 08:23:15',NULL,'2025-07-25 08:22:58','2025-07-25 08:23:15'),
(206,'App\\Models\\User',4,'auth_token','015e26b161543948756ab2fba1356b5f0d369fc3e0f9fa6d351b094582b0ce9c','[\"*\"]','2025-07-25 08:23:29',NULL,'2025-07-25 08:23:27','2025-07-25 08:23:29'),
(207,'App\\Models\\User',6,'auth_token','aa4c72fd647749d930f6f6a5b264955932fd335745718a8daa850a8c8f3a2f6e','[\"*\"]','2025-07-25 08:25:02',NULL,'2025-07-25 08:24:14','2025-07-25 08:25:02'),
(208,'App\\Models\\User',1,'auth_token','fc06960eb1f3cfef5528735034e16f5b62549b62d62acbcc644ccd7e8f52e727','[\"*\"]','2025-07-25 08:27:12',NULL,'2025-07-25 08:25:28','2025-07-25 08:27:12'),
(210,'App\\Models\\User',1,'auth_token','b1b31e3264606e8bffd3b49455f3b524ce8f1ef6df2e7aa1b1bc2b75f8a4a20b','[\"*\"]','2025-07-25 08:30:48',NULL,'2025-07-25 08:28:24','2025-07-25 08:30:48'),
(211,'App\\Models\\User',6,'auth_token','52831856a798209717465879db5064ff790ae39ddbd9a77ec62fa6002efed6d9','[\"*\"]','2025-07-25 08:31:31',NULL,'2025-07-25 08:31:09','2025-07-25 08:31:31'),
(212,'App\\Models\\User',6,'auth_token','4f41dfe946fea434209b9e4874361a2c08c8370f9cee25759204ed84ec1a303d','[\"*\"]','2025-07-25 08:33:08',NULL,'2025-07-25 08:31:47','2025-07-25 08:33:08'),
(213,'App\\Models\\User',1,'auth_token','704e70ea0b7eed9dd7feae62e22098c6f4fe753b575ffffc0878ff72847359d4','[\"*\"]','2025-07-25 08:34:34',NULL,'2025-07-25 08:33:27','2025-07-25 08:34:34'),
(215,'App\\Models\\User',1,'auth_token','8745a6cd5d44d39c39919ec2352a38ebc3e0249514bc895e251d2e7eda408c6f','[\"*\"]','2025-07-25 08:57:37',NULL,'2025-07-25 08:49:30','2025-07-25 08:57:37'),
(216,'App\\Models\\User',6,'auth_token','b6090db04cb107e21e828a232906e620461b522694d77fecfd9e68146272a31d','[\"*\"]','2025-07-25 08:51:36',NULL,'2025-07-25 08:50:49','2025-07-25 08:51:36'),
(218,'App\\Models\\User',4,'auth_token','88f220bf6d50f2303ca375b7025561a938ab4834f755378512a7f24384267bbe','[\"*\"]','2025-07-25 08:57:36',NULL,'2025-07-25 08:56:42','2025-07-25 08:57:36'),
(220,'App\\Models\\User',1,'auth_token','e240f41789ec2ec88b9f417225b2c7adb0d3f3acc4778c8ef75003b0af60596c','[\"*\"]','2025-07-25 09:09:09',NULL,'2025-07-25 09:01:51','2025-07-25 09:09:09'),
(221,'App\\Models\\User',7,'auth_token','50d63ba2e3aa8c5d82c20f83d2a0dfb9cd674347f78ff8238855127d95c3e79e','[\"*\"]','2025-07-25 11:39:12',NULL,'2025-07-25 11:30:00','2025-07-25 11:39:12'),
(222,'App\\Models\\User',1,'auth_token','51f3e07c7859555d3f2ab15779a7befae28fca614734c84805e54d294ab948dc','[\"*\"]','2025-07-26 03:37:50',NULL,'2025-07-26 03:05:36','2025-07-26 03:37:50'),
(223,'App\\Models\\User',40,'auth_token','defa3d91095bd9297452e8141d429438464dfad1890a1f7a2fa9d7d19b53c877','[\"*\"]','2025-07-26 03:33:47',NULL,'2025-07-26 03:30:18','2025-07-26 03:33:47'),
(224,'App\\Models\\User',36,'auth_token','953c165ed38f7d33a788c203fd92c87f2f0cd2c9ebc2042f7f40601fdfb3dfe3','[\"*\"]','2025-07-26 03:54:25',NULL,'2025-07-26 03:40:18','2025-07-26 03:54:25'),
(226,'App\\Models\\User',1,'auth_token','99144495a278e6b097bf6d563ea3c877d1ce18f2aa2f00f260015d730689fd5a','[\"*\"]','2025-07-26 04:02:26',NULL,'2025-07-26 04:01:57','2025-07-26 04:02:26'),
(227,'App\\Models\\User',41,'auth_token','dea9a9f9a0395fc3db2a6ce5fde654e3c81730d258e26e082c9f3a1648745ebc','[\"*\"]','2025-07-26 04:04:46',NULL,'2025-07-26 04:03:00','2025-07-26 04:04:46'),
(228,'App\\Models\\User',1,'auth_token','32477b440846cf2eaffc0794b984cf70437460e956a215b605280f813d4c4a5e','[\"*\"]','2025-07-26 04:06:46',NULL,'2025-07-26 04:04:58','2025-07-26 04:06:46'),
(229,'App\\Models\\User',41,'auth_token','13588bc0dac37963ba731a3bb271c808138bc7e3eb0f6f077224ce12e8678687','[\"*\"]','2025-07-26 04:07:20',NULL,'2025-07-26 04:07:19','2025-07-26 04:07:20'),
(231,'App\\Models\\User',6,'auth_token','8c1916ae461a62823cbdb0c08763033340b6e6803562c240e785ae1367b96b1e','[\"*\"]','2025-07-26 04:26:49',NULL,'2025-07-26 04:25:30','2025-07-26 04:26:49'),
(233,'App\\Models\\User',1,'auth_token','7f0948a43624ff63cbe3c48d9368467ac68b497ec01eecbcca6612fbd8fbfa6a','[\"*\"]','2025-07-26 04:41:13',NULL,'2025-07-26 04:29:03','2025-07-26 04:41:13'),
(235,'App\\Models\\User',41,'auth_token','63df49d6633b7dba21a6320ef7507da2fdb3b039dd81a7141bc467377bf4e121','[\"*\"]','2025-07-26 14:36:32',NULL,'2025-07-26 14:34:58','2025-07-26 14:36:32'),
(236,'App\\Models\\User',1,'auth_token','3a4623d83203308756ec07ca9d733036aa3ec158acc97b632328f630c4dfd77c','[\"*\"]','2025-07-26 14:46:50',NULL,'2025-07-26 14:36:44','2025-07-26 14:46:50'),
(237,'App\\Models\\User',6,'auth_token','dc25e185895d9eb0c941eb87d4be119a149a4e8410db529c6d21f89e7257e2d7','[\"*\"]','2025-07-26 14:49:08',NULL,'2025-07-26 14:47:20','2025-07-26 14:49:08'),
(238,'App\\Models\\User',1,'auth_token','2f469418a4e348d4b69e722866f11d1bf87dda8d5d67d14c89cf378f5e55bdf3','[\"*\"]','2025-07-26 14:51:03',NULL,'2025-07-26 14:49:39','2025-07-26 14:51:03'),
(239,'App\\Models\\User',6,'auth_token','216a1f2e966dace2842d72fdb52e832b669a7fd8e8fde1f05ba4965933c083a8','[\"*\"]','2025-07-26 14:52:58',NULL,'2025-07-26 14:51:17','2025-07-26 14:52:58'),
(240,'App\\Models\\User',1,'auth_token','fe1bbaa83ad16cc7960e3466c17ce3594a5219eefc5e05a33db2a24e40bbdef8','[\"*\"]','2025-07-26 14:55:46',NULL,'2025-07-26 14:53:15','2025-07-26 14:55:46'),
(241,'App\\Models\\User',6,'auth_token','9b21cbada75ca9b82933c02591efd211e4f1c6a1835a9e8b7b087e2eec659eeb','[\"*\"]','2025-07-26 14:55:59',NULL,'2025-07-26 14:55:57','2025-07-26 14:55:59'),
(243,'App\\Models\\User',1,'auth_token','1b1b1763e83488f0331e3da31a944125dab6f15df63259919e3a39817987b7f4','[\"*\"]','2025-07-26 15:51:59',NULL,'2025-07-26 15:51:08','2025-07-26 15:51:59'),
(245,'App\\Models\\User',1,'auth_token','33af14142b360a306e8fcf3ecf9e10c3f1ec836dc7f249022af2ff569c4aa5bf','[\"*\"]','2025-07-26 15:53:27',NULL,'2025-07-26 15:53:24','2025-07-26 15:53:27'),
(247,'App\\Models\\User',7,'auth_token','1e29bf993c8a6023c8fd182ea06d6e9245a456ef0cdc8fdf245e185e9b240c07','[\"*\"]','2025-07-26 16:19:23',NULL,'2025-07-26 16:19:20','2025-07-26 16:19:23'),
(248,'App\\Models\\User',41,'auth_token','6cc97aec265b729382173bcf05138c89e74a76d118e3e2126f86b3557b717ac3','[\"*\"]','2025-07-29 09:55:34',NULL,'2025-07-29 09:51:49','2025-07-29 09:55:34'),
(249,'App\\Models\\User',6,'auth_token','17ca42ce8696e9ebb06f7fee971c03ee6aa88b6af4eca32883689c1f2c4dd329','[\"*\"]','2025-07-29 10:24:20',NULL,'2025-07-29 09:56:53','2025-07-29 10:24:20'),
(250,'App\\Models\\User',41,'auth_token','b4d49549e6deb7397ce173fafee772af698ea49ea61f4f38c099a1a0b3e2ed4a','[\"*\"]','2025-07-29 10:49:58',NULL,'2025-07-29 10:41:51','2025-07-29 10:49:58'),
(251,'App\\Models\\User',6,'auth_token','54ceaa95475638f5d270824b76397f095cfcb728e26fb266e2e763c289373164','[\"*\"]','2025-07-29 10:51:19',NULL,'2025-07-29 10:50:14','2025-07-29 10:51:19'),
(252,'App\\Models\\User',1,'auth_token','183efed56bf3ca94dfb795518d1393500e3bfd9425dfe3f1cffdcf668671f0ba','[\"*\"]','2025-07-29 10:52:44',NULL,'2025-07-29 10:51:34','2025-07-29 10:52:44'),
(255,'App\\Models\\User',41,'auth_token','ad4574acb69967ede64c6f63aaf30d6f7706d52a711add29a8e5eafc88f3b8a2','[\"*\"]','2025-07-29 20:18:25',NULL,'2025-07-29 20:18:22','2025-07-29 20:18:25'),
(256,'App\\Models\\User',6,'auth_token','e7f7396b92dfddcb48117ad2d5868846742321d9b381dcaaf803b19acb22e635','[\"*\"]','2025-07-29 20:21:12',NULL,'2025-07-29 20:20:31','2025-07-29 20:21:12'),
(257,'App\\Models\\User',41,'auth_token','af0f625a5e27afd9a228a9f575ba68143bf770674408dc9c2eed6f390388eeb0','[\"*\"]','2025-07-29 20:21:36',NULL,'2025-07-29 20:21:32','2025-07-29 20:21:36'),
(258,'App\\Models\\User',6,'auth_token','4cf15d828ee5eec6ee2ad03375e24bc96954f8e6ad2a6c00b032fc6278f23a24','[\"*\"]','2025-07-29 21:03:06',NULL,'2025-07-29 20:24:11','2025-07-29 21:03:06'),
(259,'App\\Models\\User',41,'auth_token','f40574dcad277e2cd1447ccee767c13c41910dce1de366cc554476d60548eeab','[\"*\"]','2025-07-29 21:20:11',NULL,'2025-07-29 21:03:24','2025-07-29 21:20:11'),
(260,'App\\Models\\User',1,'auth_token','4ea260a4b6d1318d35d902ecd0f50d255f34928694f8e06aea8bcc1cdf92095c','[\"*\"]','2025-07-29 21:20:12',NULL,'2025-07-29 21:17:25','2025-07-29 21:20:12'),
(261,'App\\Models\\User',1,'auth_token','652527754f7cf8a3e32c86385febce782cf35baef29b7c2afde7c6e9a886a9e3','[\"*\"]','2025-07-29 21:45:55',NULL,'2025-07-29 21:22:21','2025-07-29 21:45:55'),
(262,'App\\Models\\User',6,'auth_token','6a992dddcfe84117b1b17411cbf1236d0ce9cde6fea5cb53d73a500794de686d','[\"*\"]','2025-07-29 21:35:46',NULL,'2025-07-29 21:24:24','2025-07-29 21:35:46'),
(264,'App\\Models\\User',41,'auth_token','fbe8c67bab377547b083aac2dbef33f9ddfe97b14d7b270aa44f0f40b4890d89','[\"*\"]','2025-07-29 21:45:36',NULL,'2025-07-29 21:44:15','2025-07-29 21:45:36'),
(266,'App\\Models\\User',41,'auth_token','cbfb06a7e29c670268cb0ada045bf2130013553d7b3c2ad844111912f38591f4','[\"*\"]','2025-07-29 21:56:00',NULL,'2025-07-29 21:47:27','2025-07-29 21:56:00'),
(267,'App\\Models\\User',6,'auth_token','3cd910d5f97386f41506986b151899033cdc93cb564ff8eda0fcf251d4b17e02','[\"*\"]','2025-07-29 22:41:02',NULL,'2025-07-29 21:56:30','2025-07-29 22:41:02'),
(269,'App\\Models\\User',1,'auth_token','66069ce9166a678d7da8544c08fe0b71a0a5e5eec8ce61892d6d624ddaa4e084','[\"*\"]','2025-07-29 23:42:37',NULL,'2025-07-29 22:41:30','2025-07-29 23:42:37'),
(270,'App\\Models\\User',6,'auth_token','25acaec620efbde56a8b6bc7b71273f7fef8d7e89b68042ed0cac04d09f53c9a','[\"*\"]','2025-07-29 23:22:58',NULL,'2025-07-29 22:48:01','2025-07-29 23:22:58'),
(272,'App\\Models\\User',6,'auth_token','ab603d174fd8ea8edd3a77186d22bb287d4e8874b6679fa6549ea54610061155','[\"*\"]','2025-07-29 23:37:43',NULL,'2025-07-29 23:26:54','2025-07-29 23:37:43'),
(275,'App\\Models\\User',6,'auth_token','c367db1d9fdebd48e4f80817585aa4690c6b91c0793ae33ccb43fe4f446debdc','[\"*\"]','2025-07-29 23:39:34',NULL,'2025-07-29 23:39:32','2025-07-29 23:39:34'),
(276,'App\\Models\\User',41,'auth_token','6d5621194b2d4e4bffe08bf26ec2e503e77e8db5c129baab23ba92c7b35d24a0','[\"*\"]','2025-07-29 23:43:25',NULL,'2025-07-29 23:40:40','2025-07-29 23:43:25'),
(277,'App\\Models\\User',7,'auth_token','afc8360af127abddbd5294fced2b73aa62c39b29b0d74629c9a0dea534ef481a','[\"*\"]','2025-07-29 23:45:52',NULL,'2025-07-29 23:42:55','2025-07-29 23:45:52'),
(278,'App\\Models\\User',36,'auth_token','4e332c1dac81f2a333ff71e9a8f6a72374f6c4d93e9250d108d140d1354feced','[\"*\"]','2025-07-29 23:45:52',NULL,'2025-07-29 23:43:40','2025-07-29 23:45:52'),
(279,'App\\Models\\User',6,'auth_token','0105dbc044207f0eec7cf3c1fa54430a87a081c3113ae9d2ea7b510d587c733c','[\"*\"]','2025-07-30 04:50:14',NULL,'2025-07-30 04:50:12','2025-07-30 04:50:14'),
(281,'App\\Models\\User',41,'auth_token','f8560c56e3b0d6ceb9cc73af80562e9d231426e14c630b4f3ff27763b0416466','[\"*\"]','2025-07-30 07:14:03',NULL,'2025-07-30 07:14:01','2025-07-30 07:14:03'),
(282,'App\\Models\\User',6,'auth_token','59de2653fbe933620511b57b5b38f1e49dcb63ff19ee1c49fc090d3895100a00','[\"*\"]','2025-07-30 07:16:13',NULL,'2025-07-30 07:14:47','2025-07-30 07:16:13'),
(283,'App\\Models\\User',6,'auth_token','f181e4aa0e470237b5f29b8f098707eb70e3efa9c9c0e4fd96d1c873dd80c669','[\"*\"]','2025-07-30 07:57:30',NULL,'2025-07-30 07:57:29','2025-07-30 07:57:30'),
(285,'App\\Models\\User',6,'auth_token','9726bb01563d3c07987432392d016dd3769fd35ffbe915b7037dc3571c3fd43e','[\"*\"]','2025-07-30 10:20:59',NULL,'2025-07-30 10:20:58','2025-07-30 10:20:59'),
(286,'App\\Models\\User',36,'auth_token','c91be0aec28b7e62dea4163e98b6a73c81d59024b6c35a4a2ee66e5c4b33778b','[\"*\"]','2025-07-30 10:31:37',NULL,'2025-07-30 10:22:21','2025-07-30 10:31:37'),
(288,'App\\Models\\User',6,'auth_token','b0e8468c76c21ede541b3bab7cfaf77eedc81a5e2eb6884af98eece9ccf59642','[\"*\"]','2025-07-30 11:00:50',NULL,'2025-07-30 11:00:48','2025-07-30 11:00:50'),
(289,'App\\Models\\User',41,'auth_token','9123c61e9835d30cb35af16972824e71717013a4a4af79294bd5034d380960a5','[\"*\"]','2025-07-30 11:01:18',NULL,'2025-07-30 11:01:16','2025-07-30 11:01:18'),
(291,'App\\Models\\User',1,'auth_token','94a9ed78cf56f8afda143c3e6baddefdfff33df609cb5c6b51a6ec4edecb468c','[\"*\"]','2025-07-30 11:19:45',NULL,'2025-07-30 11:15:57','2025-07-30 11:19:45'),
(292,'App\\Models\\User',1,'auth_token','2c3ce9862c798fda9a64a8df617be9a8739e053ff2d947d14677788d50fee82a','[\"*\"]','2025-07-30 13:14:02',NULL,'2025-07-30 13:13:59','2025-07-30 13:14:02'),
(293,'App\\Models\\User',1,'auth_token','63a71190c349d3e1df162e7bda58102059860624dfe83940492a33e688b19d47','[\"*\"]','2025-07-30 13:47:20',NULL,'2025-07-30 13:47:17','2025-07-30 13:47:20'),
(294,'App\\Models\\User',1,'auth_token','629a1161a1cf0ab330dca006c81b7a4ef8a361aa3048ef89f413c10abd5f90f8','[\"*\"]','2025-07-30 14:08:57',NULL,'2025-07-30 14:08:55','2025-07-30 14:08:57'),
(296,'App\\Models\\User',6,'auth_token','855f69586584a4e5f33bed351ef642b9fbd8f7cad1393255b62fa41343a26e5e','[\"*\"]','2025-07-30 14:22:07',NULL,'2025-07-30 14:22:05','2025-07-30 14:22:07'),
(297,'App\\Models\\User',41,'auth_token','aa80867becacff0d5ddd4c41c48c8313e27abe53c41531c6e465d7d0e908e767','[\"*\"]','2025-07-30 14:22:36',NULL,'2025-07-30 14:22:35','2025-07-30 14:22:36'),
(300,'App\\Models\\User',41,'auth_token','d0ea6d639e38c6680cc71df4a967cef13fcd5b7abae2641333d64128b3531b57','[\"*\"]','2025-07-31 00:59:23',NULL,'2025-07-31 00:59:22','2025-07-31 00:59:23'),
(302,'App\\Models\\User',41,'auth_token','5db57d1466aaa8049de30ebf0e492a099862e3c2e66326b8ca9a86cfb2a05360','[\"*\"]','2025-07-31 01:05:02',NULL,'2025-07-31 01:05:00','2025-07-31 01:05:02'),
(304,'App\\Models\\User',41,'auth_token','eaed8338d4fa33e8f908e2e51eb42086e001b4d452af2d94ad286d6a9ec87c4a','[\"*\"]','2025-07-31 01:08:51',NULL,'2025-07-31 01:08:50','2025-07-31 01:08:51'),
(307,'App\\Models\\User',6,'auth_token','c25bf75e6c29635d740923c6865f9c04268a0f10a65a2a283f8526974b409613','[\"*\"]','2025-07-31 01:59:45',NULL,'2025-07-31 01:59:43','2025-07-31 01:59:45'),
(308,'App\\Models\\User',41,'auth_token','936d048c1039efaa565e0b1e8542f05d860eec0399ed623f663a36d4af83eb86','[\"*\"]','2025-07-31 02:00:47',NULL,'2025-07-31 02:00:45','2025-07-31 02:00:47'),
(309,'App\\Models\\User',1,'auth_token','0c32767159284a3a55d41ce68b0893510517c642994e47b1b098848f4f541586','[\"*\"]','2025-07-31 02:01:07',NULL,'2025-07-31 02:01:04','2025-07-31 02:01:07'),
(313,'App\\Models\\User',6,'auth_token','648b8bde5cf23e70ea5bbe5b24c3aa5a1a879799af76d5be655951be05b8af0a','[\"*\"]','2025-07-31 02:11:53',NULL,'2025-07-31 02:08:46','2025-07-31 02:11:53'),
(315,'App\\Models\\User',6,'auth_token','95fce25ea0840ad3a43fc07910f2d6743677399b419c2212e73b1b13247adb00','[\"*\"]','2025-07-31 02:13:02',NULL,'2025-07-31 02:13:00','2025-07-31 02:13:02'),
(318,'App\\Models\\User',6,'auth_token','91d13492e52d884a00331ab111233da8d87dd94bed426023238aa905b05cdbdb','[\"*\"]','2025-07-31 04:22:45',NULL,'2025-07-31 04:22:43','2025-07-31 04:22:45'),
(321,'App\\Models\\User',41,'auth_token','a2191f9f9cdd74dbf9b24762fa73e87ad28eaee96cd55aa979f587dac705f73b','[\"*\"]','2025-08-01 07:40:10',NULL,'2025-08-01 07:40:09','2025-08-01 07:40:10'),
(322,'App\\Models\\User',6,'auth_token','be4ab3fc81fdf4b56698a11268b1d98bd330c75d8fd759aefd0ab984b66e4be8','[\"*\"]','2025-08-01 07:42:31',NULL,'2025-08-01 07:41:36','2025-08-01 07:42:31'),
(323,'App\\Models\\User',1,'auth_token','8d2ab26a7b8ec935ecb558085bdf33fa41c4edc2ede53cc9e6b108cda83bbef4','[\"*\"]','2025-08-01 07:42:50',NULL,'2025-08-01 07:42:47','2025-08-01 07:42:50'),
(325,'App\\Models\\User',43,'auth_token','e0013e19e27fbc51ccfe252737904e730729f33d8426b6fa6daf1bd7321eb0b9','[\"*\"]','2025-08-01 23:27:50',NULL,'2025-08-01 23:27:48','2025-08-01 23:27:50'),
(327,'App\\Models\\User',45,'auth_token','5347973b4e4854da2b6906d348696512576b3dc4f40a05214d99fbbab54d2fdc','[\"*\"]','2025-08-01 23:34:00',NULL,'2025-08-01 23:33:33','2025-08-01 23:34:00'),
(328,'App\\Models\\User',1,'auth_token','306a03bdbbb9565a86308246719181536c5b16bc0040d3b703405ff0f55b7e78','[\"*\"]','2025-08-02 00:17:17',NULL,'2025-08-02 00:04:22','2025-08-02 00:17:17'),
(329,'App\\Models\\User',6,'auth_token','2ccfc9c50edc0304aa622522560e8f2569da564d8fda059d4063a49bb9be40ec','[\"*\"]','2025-08-02 00:17:40',NULL,'2025-08-02 00:17:38','2025-08-02 00:17:40'),
(332,'App\\Models\\User',41,'auth_token','a59c14a2621c3c0658cae21339b7ebd3f4e51c789bd39a6667b73b8118f157d8','[\"*\"]','2025-08-02 00:24:52',NULL,'2025-08-02 00:23:45','2025-08-02 00:24:52'),
(333,'App\\Models\\User',1,'auth_token','8279c692cae766960826f98a6a2b94d37713e5ece2a9b0738a2a3b65631f8966','[\"*\"]','2025-08-02 00:27:55',NULL,'2025-08-02 00:27:07','2025-08-02 00:27:55'),
(334,'App\\Models\\User',45,'auth_token','e388b5e475e43efd4b8794283e6e91ba0a82f846aee007510f6f7b60ee363c80','[\"*\"]','2025-08-02 00:31:30',NULL,'2025-08-02 00:29:43','2025-08-02 00:31:30'),
(335,'App\\Models\\User',1,'auth_token','31efeadcfc6cc6b6f8047a6f2f31064e2b526bd5a9ed2f0da6b77000c0786818','[\"*\"]','2025-08-02 00:31:30',NULL,'2025-08-02 00:31:05','2025-08-02 00:31:30'),
(337,'App\\Models\\User',41,'auth_token','32241323aa83b45da5190c65b173af6318a6e585cc864d0500f7adb9a51cf01a','[\"*\"]','2025-08-03 08:41:53',NULL,'2025-08-03 08:36:00','2025-08-03 08:41:53'),
(338,'App\\Models\\User',1,'auth_token','b6d073ea6d27c83b8eb698fe1d3f2e6536c188e59753a433e7226ab7efd4494d','[\"*\"]','2025-08-03 08:40:24',NULL,'2025-08-03 08:37:23','2025-08-03 08:40:24'),
(339,'App\\Models\\User',7,'auth_token','faef5562ef95df7ec2f40cc83bcec6167b4714b39aa65d1f982a1cad52491535','[\"*\"]','2025-08-03 08:41:43',NULL,'2025-08-03 08:40:50','2025-08-03 08:41:43'),
(340,'App\\Models\\User',36,'auth_token','e25eb9df98a2f786c830250cdbc5064df4c366853d8740a836a78c1c40eb1630','[\"*\"]','2025-08-03 08:53:44',NULL,'2025-08-03 08:42:10','2025-08-03 08:53:44'),
(343,'App\\Models\\User',41,'auth_token','ecddcd5016abf8c5052202c50979b83050e649cfd070951454055822a27a15ad','[\"*\"]','2025-08-04 02:47:24',NULL,'2025-08-04 01:18:53','2025-08-04 02:47:24'),
(345,'App\\Models\\User',1,'auth_token','2950a56a15885f82475982578471cced95fba0adec1448105fda556f3ef6411d','[\"*\"]','2025-08-04 02:48:34',NULL,'2025-08-04 02:48:15','2025-08-04 02:48:34'),
(346,'App\\Models\\User',41,'auth_token','ef5804840cb48bf6946688b41345b6619bdfd80b786c5dd9122768d1adf61826','[\"*\"]','2025-08-04 02:49:27',NULL,'2025-08-04 02:48:52','2025-08-04 02:49:27'),
(347,'App\\Models\\User',1,'auth_token','f189cbb9cb0323d71884b5f4eeb7292f3ae6fee2a47ae1e96a72a8f0b4554eb1','[\"*\"]','2025-08-04 02:51:26',NULL,'2025-08-04 02:49:59','2025-08-04 02:51:26'),
(349,'App\\Models\\User',41,'auth_token','1e27b34b63d1c9368b57e7f5afd7faf9f05262a20eec0d15b34dc5052da73e79','[\"*\"]','2025-08-04 03:58:44',NULL,'2025-08-04 03:57:13','2025-08-04 03:58:44'),
(350,'App\\Models\\User',1,'auth_token','89cdc39a1db6cc4288f3453593ca2c13924aa0467ca40b04a46fdc661abdc4f0','[\"*\"]','2025-08-04 04:07:19',NULL,'2025-08-04 04:06:30','2025-08-04 04:07:19'),
(351,'App\\Models\\User',41,'auth_token','49d6eed593624a157051d377025456175f0dde127f1d67f08acdf30a8f3843f1','[\"*\"]','2025-08-04 04:10:39',NULL,'2025-08-04 04:07:44','2025-08-04 04:10:39'),
(353,'App\\Models\\User',6,'auth_token','004b63d22015f635449594a526bb661c73a4019147d28506b4d3a7badd908003','[\"*\"]','2025-08-04 04:15:34',NULL,'2025-08-04 04:15:32','2025-08-04 04:15:34'),
(354,'App\\Models\\User',41,'auth_token','b52d65ca2f069f7b2203b8f374fcafbb8f8ba8da54eb930edfab4b195d860c5d','[\"*\"]','2025-08-05 03:13:25',NULL,'2025-08-04 04:18:25','2025-08-05 03:13:25'),
(355,'App\\Models\\User',1,'auth_token','1d4213ea56db64c26e2f3784ac54281128e197f35d21bcdd63afec070983aaa5','[\"*\"]','2025-08-04 04:32:21',NULL,'2025-08-04 04:29:59','2025-08-04 04:32:21'),
(356,'App\\Models\\User',36,'auth_token','e19aa2939b168a9a8a3b68ef83f65952f51b136f92da7ceb6dd39796b34495b7','[\"*\"]','2025-08-04 04:45:53',NULL,'2025-08-04 04:45:52','2025-08-04 04:45:53'),
(358,'App\\Models\\User',48,'auth_token','b0a8490b84fc1168b952607f5036a4b31055c2758c48a6a48ee3677347fff30e','[\"*\"]','2025-08-04 12:54:26',NULL,'2025-08-04 12:42:36','2025-08-04 12:54:26'),
(359,'App\\Models\\User',49,'auth_token','d464129b9e1f3c58a73ac87bab31f4469484d1e0f7ef12ac64671fdbed04edb5','[\"*\"]','2025-08-04 13:00:26',NULL,'2025-08-04 13:00:23','2025-08-04 13:00:26'),
(360,'App\\Models\\User',41,'auth_token','07577d361ceb18490d075f0218768b30abc29f44b3877d7600855ad47d0c85c5','[\"*\"]','2025-08-04 14:09:37',NULL,'2025-08-04 14:09:26','2025-08-04 14:09:37'),
(362,'App\\Models\\User',51,'auth_token','0d652d234aed59788c69341410504242b9a59b2d09bab7690663ab21c1a9d554','[\"*\"]','2025-08-04 14:12:52',NULL,'2025-08-04 14:12:50','2025-08-04 14:12:52'),
(363,'App\\Models\\User',1,'auth_token','c4c44cb920eae4dd4b104016d6aa78a2bce8606ea6cac6d5f1b9ec1222264b31','[\"*\"]','2025-08-05 03:16:52',NULL,'2025-08-05 03:15:30','2025-08-05 03:16:52'),
(364,'App\\Models\\User',41,'auth_token','8a91deb2995157cc7df186c103abee0b9f28bda264fb4bdc84072bd8cedde72c','[\"*\"]','2025-08-05 03:19:13',NULL,'2025-08-05 03:17:48','2025-08-05 03:19:13'),
(366,'App\\Models\\User',41,'auth_token','8392be823971f002a9f00036fbf807872133cd1f9a81e206166b5f7f6d37fbc5','[\"*\"]','2025-08-05 07:43:02',NULL,'2025-08-05 07:31:32','2025-08-05 07:43:02'),
(367,'App\\Models\\User',1,'auth_token','56930623c3fc012face2abe385bb48db3ac1f8bc2bb7fb2fdfffb82558252022','[\"*\"]','2025-08-05 07:49:50',NULL,'2025-08-05 07:40:22','2025-08-05 07:49:50'),
(368,'App\\Models\\User',6,'auth_token','4b2058c35a8830bc70fe495a67e235f573a07e05f4cc6bb86a1867b12795339d','[\"*\"]','2025-08-05 09:33:27',NULL,'2025-08-05 07:44:54','2025-08-05 09:33:27'),
(369,'App\\Models\\User',41,'auth_token','878af54c803f3c13a0283f4f33e1bf2a941e8b9ac8fa4ecbea2fb032582284b7','[\"*\"]','2025-08-05 10:13:54',NULL,'2025-08-05 09:35:41','2025-08-05 10:13:54'),
(370,'App\\Models\\User',6,'auth_token','31f8cfd8f4cada508ab3d5ba2d7a237e891ce8d8da845cea6a86e313efed84f6','[\"*\"]','2025-08-05 10:17:26',NULL,'2025-08-05 10:14:10','2025-08-05 10:17:26'),
(371,'App\\Models\\User',6,'auth_token','2d7b6c1fa9486639dcf2591d9bed2520d3656c92e7b0e4924d5d35b5c37aa90c','[\"*\"]','2025-08-05 14:18:56',NULL,'2025-08-05 13:57:43','2025-08-05 14:18:56'),
(372,'App\\Models\\User',41,'auth_token','fb30be188b0ba0b17e69874d5315460b939accd38c2b717697782c0a869b0902','[\"*\"]','2025-08-05 16:47:27',NULL,'2025-08-05 14:22:15','2025-08-05 16:47:27'),
(374,'App\\Models\\User',41,'auth_token','868edfe7e09565fd163a2beece1724b78a744dc98322de0aad650451daa55147','[\"*\"]','2025-08-06 00:08:56',NULL,'2025-08-06 00:08:34','2025-08-06 00:08:56'),
(375,'App\\Models\\User',6,'auth_token','1d7a914591eea1418a28228fdfaec076f3f37da5f6274a6f4c0de9b5e12fa087','[\"*\"]','2025-08-06 00:09:42',NULL,'2025-08-06 00:09:20','2025-08-06 00:09:42'),
(376,'App\\Models\\User',1,'auth_token','5c5ab9b047bcdb590c020807d4556a04a5095f8473e9759f681074c11ee8e142','[\"*\"]','2025-08-06 00:11:14',NULL,'2025-08-06 00:09:57','2025-08-06 00:11:14'),
(379,'App\\Models\\User',41,'auth_token','407506cb9cfd234b705e5e19683e00a7a243c8e12c99ab678e1fe4bbe4632f4d','[\"*\"]','2025-08-08 22:14:32',NULL,'2025-08-08 22:00:26','2025-08-08 22:14:32'),
(381,'App\\Models\\User',1,'auth_token','34f7dfb7032c39010e14c24e892d691ff965fdcbec1cc248ea58dd606cbabd42','[\"*\"]','2025-08-08 22:36:13',NULL,'2025-08-08 22:30:13','2025-08-08 22:36:13'),
(382,'App\\Models\\User',41,'auth_token','7928f4eae1fd0a14b40ee3ac5520355b17a60cdc255321dd8d9afc8600b9b1ab','[\"*\"]','2025-08-08 22:51:02',NULL,'2025-08-08 22:32:53','2025-08-08 22:51:02'),
(383,'App\\Models\\User',7,'auth_token','8f1a5db215a1a831ee92a4b96769dfc3ec7313fd5e81e6925544d15e09e22b9f','[\"*\"]','2025-08-08 22:39:10',NULL,'2025-08-08 22:36:31','2025-08-08 22:39:10'),
(385,'App\\Models\\User',1,'auth_token','a9885a6415ef1ad789e47b3325cd6402b1b448368030006fa50d2d91bf167e6a','[\"*\"]','2025-08-08 22:44:44',NULL,'2025-08-08 22:40:12','2025-08-08 22:44:44'),
(387,'App\\Models\\User',1,'auth_token','6961d43c95f97cd227bcbea0013f3ce8c693a29ae4e00195e8c9b3ac23529704','[\"*\"]','2025-08-08 22:45:55',NULL,'2025-08-08 22:45:46','2025-08-08 22:45:55'),
(388,'App\\Models\\User',7,'auth_token','c571093a6011ae4f459bc7a8db59647507ab3e8f96d14ea6a40611eefea11560','[\"*\"]','2025-08-08 22:46:17',NULL,'2025-08-08 22:46:15','2025-08-08 22:46:17'),
(390,'App\\Models\\User',53,'auth_token','a855d1e0f45911a18dc133bc7be559fbafd6c95cf2aa5d85b55a7a18ecec3746','[\"*\"]','2025-08-08 22:50:16',NULL,'2025-08-08 22:50:13','2025-08-08 22:50:16'),
(391,'App\\Models\\User',1,'auth_token','0b37b1f8f95ca670906c750cab9b7a0586b972a84975f700c5a7b33c2b559424','[\"*\"]','2025-08-08 22:51:05',NULL,'2025-08-08 22:50:30','2025-08-08 22:51:05'),
(392,'App\\Models\\User',53,'auth_token','e0fe3f243213fd3974553e296be01aa5a88cebe2c73fd7556e4c827cd5755c94','[\"*\"]','2025-08-08 22:52:10',NULL,'2025-08-08 22:51:21','2025-08-08 22:52:10'),
(393,'App\\Models\\User',1,'auth_token','65d88e1c01fcec24d9871e9c2fc5c7309bdb7853b790a63f71e539a5da5b303f','[\"*\"]','2025-08-08 22:53:03',NULL,'2025-08-08 22:52:41','2025-08-08 22:53:03'),
(395,'App\\Models\\User',1,'auth_token','0117f6bf46d5e16ae8cead587eb93e8fcb3d4cd581a58805f9112914309f4d16','[\"*\"]','2025-08-08 22:56:25',NULL,'2025-08-08 22:55:17','2025-08-08 22:56:25'),
(396,'App\\Models\\User',6,'auth_token','f5cf5044d8e11ea8a945e3d00f3c47f6cfaf8147c7f1715008d26c20d48a8160','[\"*\"]','2025-08-08 23:17:52',NULL,'2025-08-08 23:00:11','2025-08-08 23:17:52'),
(397,'App\\Models\\User',1,'auth_token','451fd929170432af5b97a3dbc352b3f37fd54597d870bae7ac0b49adcd31430f','[\"*\"]','2025-08-08 23:03:55',NULL,'2025-08-08 23:01:41','2025-08-08 23:03:55'),
(398,'App\\Models\\User',53,'auth_token','4a74c8862d6273b2f95f7dfc644d9a09478d8ddd0e307c41822b83fa3011188b','[\"*\"]','2025-08-08 23:04:10',NULL,'2025-08-08 23:04:02','2025-08-08 23:04:10'),
(399,'App\\Models\\User',1,'auth_token','c077839cf6e85914b41feafa41444b45b6808313aaa349704cb31025c5461ba1','[\"*\"]','2025-08-08 23:13:43',NULL,'2025-08-08 23:05:18','2025-08-08 23:13:43'),
(400,'App\\Models\\User',53,'auth_token','0bc3c793c6180073d54294c41aa48a7f468514e715953afb72d9b82b5f81eb98','[\"*\"]','2025-08-08 23:14:50',NULL,'2025-08-08 23:13:52','2025-08-08 23:14:50'),
(401,'App\\Models\\User',1,'auth_token','b7142111136d687cdfd1c16daba6c9990df191eb463a96f2b379849f63ad9c13','[\"*\"]','2025-08-08 23:16:17',NULL,'2025-08-08 23:15:14','2025-08-08 23:16:17'),
(402,'App\\Models\\User',53,'auth_token','eb7acd73cf820a76b58026c2c414b5a81fb4a1543943581d329e8793eeb7c540','[\"*\"]','2025-08-08 23:16:43',NULL,'2025-08-08 23:16:22','2025-08-08 23:16:43'),
(403,'App\\Models\\User',1,'auth_token','e6a4b72b1643b4e9832326f25549b6ddebb34cbcb4962470176723c63fe2b1ee','[\"*\"]','2025-08-08 23:17:55',NULL,'2025-08-08 23:16:57','2025-08-08 23:17:55'),
(405,'App\\Models\\User',53,'auth_token','52d83df622bbcf648cfba7fdd0e9811d66958c789ab54fdc23703de0dc838f83','[\"*\"]','2025-08-08 23:19:12',NULL,'2025-08-08 23:18:24','2025-08-08 23:19:12'),
(406,'App\\Models\\User',1,'auth_token','066a1c413a29cc85085d1ed389922265c94b0c043543706521997a54bcfd921d','[\"*\"]','2025-08-08 23:23:07',NULL,'2025-08-08 23:19:29','2025-08-08 23:23:07'),
(407,'App\\Models\\User',6,'auth_token','306b0a70966d399197ee40d7ef1ebb36524b52057fd40d0902be733f4a3f284c','[\"*\"]','2025-08-08 23:23:38',NULL,'2025-08-08 23:20:30','2025-08-08 23:23:38'),
(408,'App\\Models\\User',53,'auth_token','0fd539e1c61273a670857ea8407b786cee9c181771062eea7ec0a8d2808dbabe','[\"*\"]','2025-08-08 23:24:34',NULL,'2025-08-08 23:23:16','2025-08-08 23:24:34'),
(410,'App\\Models\\User',1,'auth_token','9ec9ff71d0af04bd30279332eb7abb60c4f5b0d39c93f2d819c443656292124a','[\"*\"]','2025-08-08 23:27:23',NULL,'2025-08-08 23:25:21','2025-08-08 23:27:23');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `farmer_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` enum('vegetables','fruits','grains','dairy','spices','seafood','poultry','livestock') NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL DEFAULT 'kg',
  `image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_farmer_id_status_index` (`farmer_id`,`status`),
  KEY `products_category_index` (`category`),
  CONSTRAINT `products_farmer_id_foreign` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
(2,3,'Sweet Corn','vegetables','Sweet and tender corn, locally grown',35.00,2,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-29 22:52:26'),
(4,3,'Amaranth (Mchicha)','vegetables','Locally grown leafy greens rich in nutrients',25.00,200,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-29 23:21:25'),
(22,3,'Black Pepper','spices','Locally sourced produce from Kwale',62.00,27,'liter',NULL,'active','2025-07-08 20:53:12','2025-07-29 23:36:54'),
(40,3,'Cinnamon','spices','Locally sourced produce from Kwale',121.00,194,'bag',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(57,3,'Buckwheat','grains','Organic buckwheat from Kenyan farms',429.00,610,'gram',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(58,3,'Quinoa','grains','Asperiores rerum blanditiis ea sed esse autem.',121.00,367,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(60,3,'Bananas','fruits','Ripe bananas from Kwale, sweet and ready to eat or cook.',173.00,628,'bag',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(74,36,'Fresh Milk','dairy','fresh milk from msambweni!',60.00,0,'kg',NULL,'out_of_stock','2025-07-23 10:09:53','2025-07-23 11:29:00'),
(75,36,'testproduct','spices','product',30.00,0,'kg',NULL,'out_of_stock','2025-07-23 10:23:07','2025-07-23 10:24:04'),
(77,36,'cashew nuts','fruits','fresh nuts',200.00,0,'kg',NULL,'out_of_stock','2025-07-25 08:16:07','2025-07-25 08:24:43'),
(78,36,'Cabbage','vegetables','fresh weekend cabbages',50.00,2,'kg',NULL,'active','2025-07-26 04:00:37','2025-07-29 22:40:50'),
(80,36,'Maize','grains','soft',700.00,569,'kg',NULL,'active','2025-07-26 14:34:13','2025-07-30 07:16:13'),
(83,36,'Cassava','vegetables','Fresh Cassava Roots',60.00,98,'kg',NULL,'active','2025-07-31 01:01:29','2025-08-05 14:26:10'),
(84,36,'Sheep','livestock','Fat tail sheep',10000.00,15,'kg',NULL,'active','2025-07-31 01:02:56','2025-07-31 01:02:56'),
(85,36,'Cattle','livestock','Local breed cattle',40000.00,10,'kg',NULL,'active','2025-07-31 01:04:39','2025-07-31 01:04:39'),
(86,36,'Tilapia','seafood','Fresh fish',500.00,50,'kg',NULL,'active','2025-07-31 01:06:57','2025-07-31 01:06:57'),
(87,36,'Mangoes','fruits','Sweet Mangoes',30.00,5,'kg',NULL,'active','2025-07-31 01:08:17','2025-08-08 23:22:26'),
(88,36,'Milk','dairy','Fresh goat milk',70.00,10,'liters',NULL,'active','2025-07-31 01:59:26','2025-08-08 23:10:58'),
(89,42,'Tilapia','seafood','fresh Tilapia from the inner coast',100.00,39,'kg',NULL,'active','2025-08-01 23:23:20','2025-08-03 08:36:57'),
(90,47,'Wheat','grains','featherly wheat',300.00,28,'kg',NULL,'active','2025-08-02 00:23:08','2025-08-05 07:32:59'),
(92,36,'Goat Milk','dairy','fresh goat milk',400.00,3,'liters',NULL,'active','2025-08-04 03:46:24','2025-08-05 14:18:43'),
(93,36,'Omena','seafood','fresh tilapia',50.00,2999,'g',NULL,'active','2025-08-04 03:55:53','2025-08-04 03:58:28'),
(94,50,'Cows','livestock','fat bulls',7000.00,31,'kg',NULL,'active','2025-08-04 14:11:49','2025-08-05 14:23:58'),
(95,52,'Tilapia','seafood','just tilapia',300.00,86,'kg',NULL,'active','2025-08-05 04:19:13','2025-08-08 23:21:00'),
(96,52,'Guavas','fruits','fresh cultural guavas',30.00,399,'pcs',NULL,'active','2025-08-05 04:19:13','2025-08-05 09:38:08'),
(98,52,'Mangoes','fruits','fresh and ripe',40.00,499,'pcs',NULL,'active','2025-08-05 04:19:13','2025-08-08 23:20:49'),
(99,52,'cashewnuts','fruits','not so hard not so soft nuts',300.00,700,'kg',NULL,'active','2025-08-05 04:19:13','2025-08-05 04:19:13');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `status` enum('active','inactive','expired') NOT NULL DEFAULT 'active',
  `applicable_to` enum('all','farmers','consumers','retailers') NOT NULL DEFAULT 'all',
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `promotions_status_start_date_end_date_index` (`status`,`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES
(1,'New Year Special','Get 15% off on all orders above KSh 1000',15.00,NULL,'2024-12-31 21:00:00','2025-01-14 21:00:00','active','all',1000.00,500.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(2,'Farmer Support Program','Special discount for farmers on agricultural tools',NULL,200.00,'2025-07-03 20:53:12','2025-08-07 20:53:12','active','farmers',500.00,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(3,'Bulk Order Discount','10% off for retailers on bulk orders',10.00,NULL,'2025-08-09 21:00:00','2025-08-30 21:00:00','active','retailers',2000.00,1000.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(4,'Welcome Bonus','KSh 100 off for new consumers',NULL,100.00,'2025-08-09 21:00:00','2025-08-30 21:00:00','active','consumers',300.00,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(5,'End of Season Sale','Massive 25% discount on selected items',25.00,NULL,'2025-08-07 20:53:12','2025-08-22 20:53:12','inactive','all',800.00,800.00,'2025-07-08 20:53:12','2025-07-08 20:53:12');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `reviewer_id` bigint(20) unsigned NOT NULL,
  `reviewee_id` bigint(20) unsigned NOT NULL,
  `rating` int(10) unsigned NOT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('pending','approved','flagged','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_order_id_reviewer_id_reviewee_id_unique` (`order_id`,`reviewer_id`,`reviewee_id`),
  KEY `reviews_reviewer_id_foreign` (`reviewer_id`),
  KEY `reviews_approved_by_foreign` (`approved_by`),
  KEY `reviews_order_id_reviewer_id_index` (`order_id`,`reviewer_id`),
  KEY `reviews_reviewee_id_status_index` (`reviewee_id`,`status`),
  KEY `reviews_status_created_at_index` (`status`,`created_at`),
  CONSTRAINT `reviews_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_reviewee_id_foreign` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES
(1,86,41,36,3,'the products were state of the art','approved',NULL,'2025-08-04 02:47:05',NULL,'2025-08-04 02:47:05','2025-08-04 02:47:05'),
(2,82,41,7,2,'he was late','flagged','Tester was suspended pending investigations for scam allegations',NULL,NULL,'2025-08-04 02:49:10','2025-08-08 23:09:36'),
(4,88,41,47,5,'perfect','approved',NULL,'2025-08-05 03:18:10',NULL,'2025-08-05 03:18:10','2025-08-05 03:18:10'),
(5,87,41,36,2,'just bad','rejected','false',NULL,NULL,'2025-08-06 00:08:56','2025-08-06 00:10:58'),
(6,77,6,7,3,NULL,'approved',NULL,'2025-08-06 00:09:33',NULL,'2025-08-06 00:09:33','2025-08-06 00:09:33'),
(7,87,36,41,5,'The consumer made the payment','approved',NULL,'2025-08-08 22:29:39',NULL,'2025-08-08 22:29:39','2025-08-08 22:29:39'),
(8,57,7,6,4,'Sarah picked up the delivery promptly,the payment process was seamless and easy','approved',NULL,'2025-08-08 22:37:56',NULL,'2025-08-08 22:37:56','2025-08-08 22:37:56'),
(9,106,53,41,2,'They were abit late to pick up the products','approved',NULL,'2025-08-08 22:56:25',1,'2025-08-08 22:54:12','2025-08-08 22:56:25'),
(10,105,6,53,5,'Debby is very kind,keeps you up to date on how far the delivery is','approved',NULL,'2025-08-08 23:04:48',NULL,'2025-08-08 23:04:48','2025-08-08 23:04:48');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('farmer','consumer','retailer','logistics','admin') NOT NULL DEFAULT 'consumer',
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Admin User','admin@agrilink.com','+254700000001',NULL,'$2y$12$t3VGwEuIz0lBPO4n8JaHMOHNET2m8HuiA.nKSr3m5G/dvA0dQro.u','admin','active',NULL,'2025-07-08 20:53:09','2025-07-08 20:53:09'),
(3,'Mary Wanjiku','mary.farmer@agrilink.com','+254700000003',NULL,'$2y$12$h8WH20slgn8YL6gynGgrtumbOE3zS5kzxMH0CJbr2ZzEp3jyHTL1e','farmer','suspended',NULL,'2025-07-08 20:53:10','2025-07-21 14:18:22'),
(6,'Sarah Retailer','retailer@agrilink.com','+254700000006',NULL,'$2y$12$DdD.AJkonCw6zX8Pc5GMtezyjf4ZJJa10jBsfIjYAAt6wJjWTDsbO','retailer','active',NULL,'2025-07-08 20:53:11','2025-07-21 14:19:08'),
(7,'tester','tests@tests.com','+254700000007',NULL,'$2y$12$awdNRhYc4g.1YL0yBFW7Sehj2v3i7lDFBeNcqvtiog2NJt.O.Gn.O','consumer','suspended',NULL,'2025-07-08 20:53:11','2025-08-08 23:02:48'),
(12,'Markus Bins','carley39@example.net','+254784960177','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','retailer','suspended','T3YrlYNFK0','2025-07-08 20:53:11','2025-07-18 15:20:22'),
(18,'Leopold Deckow','amorar@example.com','+254736097520','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','logistics','inactive','Dp1N31NzBs','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(19,'Ivory Paucek','zaria.batz@example.com','+254763621366','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','consumer','suspended','jyN7Coe7gp','2025-07-08 20:53:11','2025-07-21 14:18:20'),
(36,'Bri Farmer','farmer@agrilink.com','0123456',NULL,'$2y$12$HSpT1Us8lcBJCm3z6TjsZO8kQSLjhE7j9ZqWQP7lPnyP3aGYwFEbG','farmer','active',NULL,'2025-07-21 15:21:14','2025-07-21 15:21:14'),
(41,'consumer agrilink','consumer@agrilink.com','0712345678',NULL,'$2y$12$HJiKv.P7uZsAoETyhXkj3O6JaP1m4.zpRUI/e4g3nN/PmUS0v.69K','consumer','active',NULL,'2025-07-26 04:03:00','2025-07-26 04:03:00'),
(42,'Holly Flux','holly@mail.com','0712345678',NULL,'$2y$12$2o6uQM.XrC26x/TxmODRi.6H25tt.DI8I8ic23fQN3xTgq/g1vNCG','farmer','active',NULL,'2025-08-01 23:23:20','2025-08-01 23:23:20'),
(44,'Darel Last','darel@mail.com','0712367890',NULL,'$2y$12$mB1ZxATgDlED9ACAX.GQoeb8IjetUE1D4S0UpvUW6PSJcFeKNxH/q','logistics','active',NULL,'2025-08-01 23:32:10','2025-08-01 23:32:10'),
(45,'sam smith','sam@mail.com','0798773829',NULL,'$2y$12$pb/upB8OBB5h4xOJIOgBW.B5GlI0RuMvxM.igRrIHpu89HRq3uZoe','logistics','active',NULL,'2025-08-01 23:33:33','2025-08-01 23:33:33'),
(46,'Stan Lee','stan@mail.com','0712345678',NULL,'$2y$12$lHQCzkl88ph1Qhe4xW7ZZOppJGUHoVSJ/CJNoMKBjsbWeRBAfQ6PS','farmer','active',NULL,'2025-08-02 00:21:19','2025-08-02 00:21:19'),
(47,'Chris Black','chris@mail.com','0712345678',NULL,'$2y$12$Bpe0bVm8/YcibEiu7RO3R.opZQ/hjXvKP.Gq7RSLBEpa4.n1//FJy','farmer','active',NULL,'2025-08-02 00:23:07','2025-08-02 00:23:07'),
(48,'Raymond Ali','rayymond@gmail.com','0735678902',NULL,'$2y$12$8HQIMUolwQ4WlZSSXs3i4e4jU5caKpL2AX7KVD1UxbmO414zNqPv.','retailer','active',NULL,'2025-08-04 12:42:36','2025-08-04 12:42:36'),
(49,'John Chloe','john@gmail.com','0789765789',NULL,'$2y$12$kPOtUqbMGLa5HlW2OLUyH.wTYmjh159TIOP9a6540ubcmi0nJmpi2','logistics','active',NULL,'2025-08-04 13:00:23','2025-08-04 13:00:23'),
(50,'Faith Njoki','faith@gmail.com','0735678902',NULL,'$2y$12$dLn.FG682hqstOvzHk7xy.bvlT61pC/OGddI5/Q5SDc6QjJ8.ELZy','farmer','active',NULL,'2025-08-04 14:11:49','2025-08-04 14:11:49'),
(51,'Ann Njeri','ann@mail.com','0786780599',NULL,'$2y$12$luwxWfZrLTpKH1yzlXy9xeNtAW3ECTiB/88Ien7m5RTGqWLHohhy2','retailer','active',NULL,'2025-08-04 14:12:50','2025-08-04 14:12:50'),
(52,'Brian Njuguna','briian@gmail.com','0789767997',NULL,'$2y$12$uykjsugmCIW6VsqJDDruhekdZYwJnGn6UCFV3NXtHMxZEUdYEnWT2','farmer','active',NULL,'2025-08-05 04:19:13','2025-08-05 04:19:13'),
(53,'Debby Marthers','debby@logistics.com',NULL,NULL,'$2y$12$FxDbuCDvnO3bGVnMun9DHOCyWyMmK96w4bHZtzgWWs7nm/qwZwdoi','logistics','active',NULL,'2025-08-08 22:49:17','2025-08-08 22:49:17');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-09  6:35:36
