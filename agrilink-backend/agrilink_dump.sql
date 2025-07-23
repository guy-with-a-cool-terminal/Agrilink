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
INSERT INTO `cache` VALUES
('agrilink-backend-cache-0a57cb53ba59c46fc4b692527a38a87c78d84028','i:1;',1752131461),
('agrilink-backend-cache-0a57cb53ba59c46fc4b692527a38a87c78d84028:timer','i:1752131461;',1752131461),
('agrilink-backend-cache-1b6453892473a467d07372d45eb05abc2031647a','i:1;',1752131563),
('agrilink-backend-cache-1b6453892473a467d07372d45eb05abc2031647a:timer','i:1752131563;',1752131563),
('agrilink-backend-cache-356a192b7913b04c54574d18c28d46e6395428ab','i:1;',1752076428),
('agrilink-backend-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer','i:1752076428;',1752076428),
('agrilink-backend-cache-5c785c036466adea360111aa28563bfd556b5fba','i:1;',1752131561),
('agrilink-backend-cache-5c785c036466adea360111aa28563bfd556b5fba:timer','i:1752131561;',1752131561),
('agrilink-backend-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0','i:1;',1752076899),
('agrilink-backend-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0:timer','i:1752076899;',1752076899);
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
INSERT INTO `deliveries` VALUES
(1,1,8,'Ukunda Town, Kwale County, Kenya','2025-07-11 07:41:27','2025-07-04 06:47:48','delivered','high','TRK-2025-F6837C28',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(2,2,7,'Msambweni Sub-County Hospital, Kwale','2025-07-15 13:26:32',NULL,'assigned','urgent','TRK-2025-F683B722',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(3,3,7,'Gazi Village, Kwale','2025-07-13 03:54:18',NULL,'in_transit','urgent','TRK-2025-F683E1C5',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(4,4,8,'Diani Beach Road, opposite Nakumatt','2025-07-13 19:32:07',NULL,'in_transit','low','TRK-2025-F6841C22',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(5,5,14,'Kinondo, Msambweni','2025-07-13 19:20:26',NULL,'in_transit','urgent','TRK-2025-F684671F',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(6,6,18,'Ukunda Town, Kwale County, Kenya','2025-07-10 18:09:23',NULL,'in_transit','high','TRK-2025-F6849D36',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(7,7,8,'Msambweni Sub-County Hospital, Kwale','2025-07-13 11:38:39',NULL,'assigned','low','TRK-2025-F685006A',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(8,8,8,'Gazi Village, Kwale','2025-07-11 05:08:44',NULL,'in_transit','urgent','TRK-2025-F685395E',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(9,9,22,'741 Elyssa Dale Apt. 916\nHymanside, RI 14838-8630','2025-07-15 12:02:50',NULL,'assigned','medium','TRK-2025-F6857A08',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,10,22,'97301 Langworth Fall\nMarianamouth, KY 78118','2025-07-13 23:51:52',NULL,'in_transit','medium','TRK-2025-F685C031',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,11,22,'16539 Balistreri Field\nEfrainborough, TX 47712-5116','2025-07-14 20:38:46',NULL,'assigned','medium','TRK-2025-F685FCE7',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(12,12,22,'91077 Stehr Heights Suite 861\nRyanhaven, MI 46216-4314','2025-07-14 19:18:03','2025-06-21 08:42:31','delivered','low','TRK-2025-F686595D',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(13,13,27,'910 Braun River Suite 980\nHudsonside, AL 63070-5664','2025-07-14 09:48:57',NULL,'assigned','urgent','TRK-2025-F686AF46',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(14,14,7,'9671 Carroll Junction\nNorth Mollie, NY 64573','2025-07-15 13:12:52',NULL,'in_transit','low','TRK-2025-F686E2C3',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,15,8,'4418 Beer Terrace Apt. 675\nLake Barrettstad, AK 89013-0718','2025-07-15 02:57:37',NULL,'assigned','medium','TRK-2025-F68715E0',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(16,16,14,'16532 Lowe Brook\nEast Margarette, WY 04910-6108','2025-07-10 03:09:43',NULL,'assigned','low','TRK-2025-F6874A09',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(17,17,8,'76528 Bradtke Garden Apt. 792\nLake Adell, HI 98437','2025-07-12 16:12:22',NULL,'assigned','urgent','TRK-2025-F68795F2',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(18,18,22,'19909 Lockman Underpass\nLake Alf, MD 66473-5703','2025-07-10 16:29:14',NULL,'in_transit','high','TRK-2025-F687E184',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(19,19,8,'796 DuBuque Junctions\nRodrigueztown, KY 73111','2025-07-13 06:45:59','2025-06-16 09:39:34','delivered','medium','TRK-2025-F688334E',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(20,20,18,'4981 Ondricka Canyon Apt. 055\nStarkland, ID 12338-1171','2025-07-14 14:14:16','2025-06-19 09:26:04','delivered','high','TRK-2025-F68865F9',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(21,21,NULL,'jjj',NULL,NULL,'assigned','medium','TRK-2025-FA2A2A7B',NULL,'2025-07-12 15:55:30','2025-07-12 15:55:30'),
(22,25,NULL,'Bulk delivery address will be provided','2025-07-17 21:00:00',NULL,'assigned','medium','TRK-2025-2C401B3B',NULL,'2025-07-12 16:08:52','2025-07-12 16:08:52'),
(23,28,NULL,'jsjss',NULL,NULL,'assigned','medium','TRK-2025-8A125E75',NULL,'2025-07-12 16:33:53','2025-07-12 16:33:53');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_status_updates`
--

LOCK TABLES `delivery_status_updates` WRITE;
/*!40000 ALTER TABLE `delivery_status_updates` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
(11,'2024_01_01_000008_create_promotions_table',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES
(1,1,14,4,497.00,1988.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(2,2,6,9,90.00,810.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(3,2,9,7,150.00,1050.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(4,3,14,6,497.00,2982.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(5,4,5,6,120.00,720.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(6,4,6,7,90.00,630.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(7,5,24,1,210.00,210.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(8,5,22,7,62.00,434.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(9,5,51,9,140.00,1260.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,5,51,7,140.00,980.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,6,25,3,344.00,1032.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(12,7,20,5,233.00,1165.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(13,7,20,5,233.00,1165.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(14,7,56,3,489.00,1467.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,7,2,3,35.00,105.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(16,8,10,4,45.00,180.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(17,8,53,9,137.00,1233.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(18,8,20,5,233.00,1165.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(19,9,35,6,250.00,1500.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(20,9,56,6,489.00,2934.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(21,9,3,9,80.00,720.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(22,10,2,1,35.00,35.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(23,10,23,1,406.00,406.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(24,10,8,8,200.00,1600.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(25,11,10,8,45.00,360.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(26,11,6,5,90.00,450.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(27,11,2,7,35.00,245.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(28,12,51,6,140.00,840.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(29,12,7,9,60.00,540.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(30,12,3,3,80.00,240.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(31,12,6,4,90.00,360.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(32,13,23,2,406.00,812.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(33,13,53,9,137.00,1233.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(34,13,49,7,482.00,3374.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(35,13,8,8,200.00,1600.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(36,13,14,3,497.00,1491.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(37,14,14,2,497.00,994.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(38,15,5,6,120.00,720.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(39,16,4,5,25.00,125.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(40,16,9,7,150.00,1050.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(41,17,8,6,200.00,1200.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(42,17,10,5,45.00,225.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(43,17,56,9,489.00,4401.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(44,17,20,7,233.00,1631.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(45,18,7,6,60.00,360.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(46,18,1,4,40.00,160.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(47,18,3,1,80.00,80.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(48,18,24,7,210.00,1470.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(49,18,8,2,200.00,400.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(50,19,1,8,40.00,320.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(51,19,14,1,497.00,497.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(52,19,21,3,489.00,1467.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(53,19,14,4,497.00,1988.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(54,19,5,4,120.00,480.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(55,20,24,3,210.00,630.00,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(56,21,65,1,100.02,100.02,'2025-07-12 15:55:30','2025-07-12 15:55:30'),
(57,25,8,11,200.00,2200.00,'2025-07-12 16:08:52','2025-07-12 16:08:52'),
(58,28,1,1,40.00,40.00,'2025-07-12 16:33:53','2025-07-12 16:33:53'),
(59,28,2,1,35.00,35.00,'2025-07-12 16:33:53','2025-07-12 16:33:53');
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES
(1,21,'ORD-2025-000001',1988.00,'delivered','Ukunda Town, Kwale County, Kenya','2025-07-11 07:41:27','Please call before delivery, access via back gate','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(2,6,'ORD-2025-000002',1860.00,'pending','Msambweni Sub-County Hospital, Kwale','2025-07-15 13:26:32','Urgent delivery before noon','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(3,11,'ORD-2025-000003',2982.00,'shipped','Gazi Village, Kwale','2025-07-13 03:54:18','Leave at gate, customer will collect','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(4,5,'ORD-2025-000004',1350.00,'processing','Diani Beach Road, opposite Nakumatt','2025-07-13 19:32:07','Avoid lunchtime traffic if possible','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(5,5,'ORD-2025-000005',2884.00,'processing','Kinondo, Msambweni','2025-07-13 19:20:26','Handle with care, fragile items','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(6,26,'ORD-2025-000006',1032.00,'processing','Ukunda Town, Kwale County, Kenya','2025-07-10 18:09:23','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(7,6,'ORD-2025-000007',3902.00,'pending','Ukunda Town, Kwale County, Kenya','2025-07-13 11:38:39','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(8,6,'ORD-2025-000008',2578.00,'processing','Ukunda Town, Kwale County, Kenya','2025-07-11 05:08:44','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(9,16,'ORD-2025-000009',5154.00,'pending','Ukunda Town, Kwale County, Kenya','2025-07-15 12:02:50','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,12,'ORD-2025-000010',2041.00,'processing','Ukunda Town, Kwale County, Kenya','2025-07-13 23:51:52','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,12,'ORD-2025-000011',1055.00,'confirmed','Ukunda Town, Kwale County, Kenya','2025-07-14 20:38:46','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(12,13,'ORD-2025-000012',1980.00,'delivered','Ukunda Town, Kwale County, Kenya','2025-07-14 19:18:03','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(13,13,'ORD-2025-000013',8510.00,'confirmed','Ukunda Town, Kwale County, Kenya','2025-07-14 09:48:57','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(14,16,'ORD-2025-000014',994.00,'shipped','9671 Carroll Junction\nNorth Mollie, NY 64573','2025-07-15 13:12:52','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,6,'ORD-2025-000015',720.00,'pending','4418 Beer Terrace Apt. 675\nLake Barrettstad, AK 89013-0718','2025-07-15 02:57:37','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(16,13,'ORD-2025-000016',1175.00,'confirmed','16532 Lowe Brook\nEast Margarette, WY 04910-6108','2025-07-10 03:09:43','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(17,6,'ORD-2025-000017',7457.00,'pending','76528 Bradtke Garden Apt. 792\nLake Adell, HI 98437','2025-07-12 16:12:22','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(18,21,'ORD-2025-000018',2470.00,'shipped','19909 Lockman Underpass\nLake Alf, MD 66473-5703','2025-07-10 16:29:14','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(19,16,'ORD-2025-000019',4752.00,'delivered','796 DuBuque Junctions\nRodrigueztown, KY 73111','2025-07-13 06:45:59','Standard delivery instructions','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(20,11,'ORD-2025-000020',630.00,'delivered','4981 Ondricka Canyon Apt. 055\nStarkland, ID 12338-1171','2025-07-14 14:14:16','Voluptas ab nesciunt quaerat et.','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(21,4,'ORD-2025-000021',100.02,'pending','jjj',NULL,'Standard delivery instructions','2025-07-12 15:55:30','2025-07-12 15:55:30'),
(25,6,'ORD-2025-000022',2200.00,'pending','Bulk delivery address will be provided','2025-07-17 21:00:00','Standard delivery instructions','2025-07-12 16:08:51','2025-07-12 16:08:52'),
(28,4,'ORD-2025-000023',75.00,'pending','jsjss',NULL,NULL,'2025-07-12 16:33:53','2025-07-12 16:33:53');
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
  `payment_method` enum('cash','card','mobile_money','bank_transfer') NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES
(1,1,'bank_transfer',1988.00,'processing','TXN-20250708235312-836556','2025-07-08 08:29:52',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(2,2,'bank_transfer',1860.00,'completed','TXN-20250708235312-83A8E6',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(3,3,'card',2982.00,'completed','TXN-20250708235312-83DB7D','2025-06-10 04:41:58',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(4,4,'mobile_money',1350.00,'completed','TXN-20250708235312-841557',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(5,5,'bank_transfer',2884.00,'processing','TXN-20250708235312-845FF9',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(6,6,'mobile_money',1032.00,'failed','TXN-20250708235312-849645',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(7,7,'cash',3902.00,'processing','TXN-20250708235312-84E06A',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(8,8,'mobile_money',2578.00,'processing','TXN-20250708235312-852D2C',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(9,9,'card',5154.00,'pending','TXN-20250708235312-856D9B',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,10,'bank_transfer',2041.00,'failed','TXN-20250708235312-85B099',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,11,'mobile_money',1055.00,'failed','TXN-20250708235312-85F0A4',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(12,12,'mobile_money',1980.00,'completed','TXN-20250708235312-8650CE','2025-06-28 18:33:49',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(13,13,'bank_transfer',8510.00,'processing','TXN-20250708235312-86A8E7',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(14,14,'cash',994.00,'failed','TXN-20250708235312-86DBBF','2025-06-15 21:20:46',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,15,'cash',720.00,'processing','TXN-20250708235312-870BF9',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(16,16,'bank_transfer',1175.00,'completed','TXN-20250708235312-87388B',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(17,17,'card',7457.00,'completed','TXN-20250708235312-878C82',NULL,NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(18,18,'bank_transfer',2470.00,'failed','TXN-20250708235312-87DB65','2025-07-03 03:21:55',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(19,19,'card',4752.00,'completed','TXN-20250708235312-882B20','2025-06-26 05:33:36',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(20,20,'bank_transfer',630.00,'completed','TXN-20250708235312-885F26','2025-07-05 18:14:40',NULL,'2025-07-08 20:53:12','2025-07-08 20:53:12'),
(21,21,'card',100.02,'pending','TXN-20250712185530-2A26C2',NULL,NULL,'2025-07-12 15:55:30','2025-07-12 15:55:30'),
(22,28,'mobile_money',75.00,'pending','TXN-20250712193353-125B10',NULL,NULL,'2025-07-12 16:33:53','2025-07-12 16:33:53');
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
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
(66,'App\\Models\\User',1,'auth_token','5db96bf8bdb706db9a471ed3de902050371d7db53b63cb653c4abe792ed46f57','[\"*\"]','2025-07-14 04:41:37',NULL,'2025-07-14 04:31:19','2025-07-14 04:41:37');
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
  `category` enum('vegetables','fruits','grains','dairy','spices') NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
(1,17,'Coconuts','fruits','Fresh coastal coconuts from Kwale region',40.00,499,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-12 16:33:53'),
(2,3,'Sweet Corn','vegetables','Sweet and tender corn, locally grown',35.00,299,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-12 16:33:53'),
(3,24,'Pawpaw (Papaya)','fruits','Sweet ripe pawpaw from Msambweni farmers',80.00,200,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(4,3,'Amaranth (Mchicha)','vegetables','Locally grown leafy greens rich in nutrients',25.00,400,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(5,9,'White Rice','grains','Premium quality white rice',120.00,1000,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(6,20,'Wheat Flour','grains','Fine wheat flour for baking',90.00,800,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(7,2,'Fresh Milk','dairy','Fresh cow milk from grass-fed cows',60.00,100,'liter',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(8,17,'Black Pepper','spices','Aromatic black pepper spice',200.00,39,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-12 16:08:52'),
(9,17,'Coriander Seeds','spices','Fresh coriander seeds for cooking',150.00,30,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(10,24,'Green Beans','vegetables','Fresh green beans, great for stir-fry',45.00,250,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(11,15,'Cabbage','vegetables','Molestiae qui et numquam quibusdam nihil quisquam quidem earum in.',419.00,616,'kg',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(12,2,'Butter','dairy','Locally sourced produce from Kwale',341.00,891,'bag',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(13,15,'Cumin','spices','Locally sourced produce from Kwale',464.00,906,'piece',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(14,20,'Cucumbers','vegetables','Locally grown nutritious vegetables from Msambweni',497.00,33,'bag',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(15,17,'Kale','vegetables','Locally sourced produce from Kwale',309.00,581,'liter',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(16,10,'Kale','vegetables','Locally sourced produce from Kwale',98.00,759,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(17,15,'Black Pepper','spices','Locally sourced produce from Kwale',335.00,207,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(18,2,'Chili Powder','spices','Locally sourced produce from Kwale',489.00,727,'bag',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(19,10,'Ginger','spices','Locally sourced produce from Kwale',64.00,712,'kg',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(20,9,'Cream','dairy','Rich cream made from locally sourced milk, ideal for baking and cooking.',233.00,271,'gram',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(21,15,'Quinoa','grains','Excepturi impedit nihil illo quis sit distinctio minima.',489.00,595,'bag',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(22,3,'Black Pepper','spices','Locally sourced produce from Kwale',62.00,128,'liter',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(23,10,'Quinoa','grains','Sed repudiandae magnam nostrum temporibus aperiam rerum velit ab modi quae nostrum.',406.00,691,'gram',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(24,24,'Mangoes','fruits','Reprehenderit praesentium sunt quod velit rem enim suscipit.',210.00,86,'liter',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(25,9,'Cream','dairy','Commodi aliquam adipisci ea libero unde quis quas natus tenetur nihil sed qui ad.',344.00,884,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(26,10,'Rice','grains','Organically farmed wheat suitable for export',236.00,925,'liter',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(27,24,'Yogurt','dairy','Popular fermented milk product from Msambweni dairies',185.00,600,'kg',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(28,17,'Sorghum','grains','High-quality sorghum from the coastal region',230.00,772,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(29,15,'Spinach','vegetables','Locally sourced produce from Kwale',81.00,509,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(30,15,'Cumin','spices','Locally sourced produce from Kwale',298.00,825,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(31,17,'Rice','grains','Premium grade rice harvested from Kenyan highlands',240.00,776,'kg',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(32,10,'Mangoes','fruits','Locally sourced produce from Kwale',307.00,776,'kg',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(33,9,'Cucumbers','vegetables','Cum maiores ad iste ut quos dignissimos assumenda quisquam inventore.',390.00,888,'bag',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(34,2,'Cumin','spices','Locally grown cumin spice, ideal for coastal dishes',59.00,620,'gram',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(35,9,'Oranges','fruits','Locally sourced produce from Kwale',250.00,634,'gram',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(36,24,'Watermelons','fruits','Juicy watermelons from the Kenyan coast, perfect for hot days.',51.00,119,'kg',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(37,24,'Ginger','spices','Locally sourced produce from Kwale',483.00,169,'kg',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(38,17,'Potatoes','vegetables','Locally sourced produce from Kwale',203.00,223,'liter',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(39,2,'Oats','grains','Locally sourced produce from Kwale',472.00,467,'kg',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(40,3,'Cinnamon','spices','Locally sourced produce from Kwale',121.00,194,'bag',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(41,20,'Oranges','fruits','Locally sourced produce from Kwale',246.00,946,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(42,15,'Cardamom','spices','Et iure provident eligendi et sed quo quo incidunt incidunt debitis eum.',183.00,663,'piece',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(43,2,'Cucumbers','vegetables','Fresh cucumbers grown near Msambweni, great for salads and hydration.',207.00,345,'kg',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(44,20,'Cucumbers','vegetables','Fresh cucumbers grown using sustainable practices',233.00,444,'kg',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(45,20,'Paprika','spices','Locally sourced produce from Kwale',172.00,435,'kg',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(46,2,'Oranges','fruits','Sweet oranges cultivated near Msambweni',329.00,454,'gram',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(47,10,'Cloves','spices','Rich and aromatic cloves used in Swahili cuisine',61.00,33,'piece',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(48,2,'Oranges','fruits','Locally sourced produce from Kwale',359.00,691,'bag',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(49,20,'Turmeric','spices','Naturally grown turmeric roots from Msambweni farms',482.00,791,'bag',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(50,15,'Sour Cream','dairy','Sour cream made fresh from local dairy cooperatives',105.00,395,'piece',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(51,15,'Pineapples','fruits','Pineapples sourced from Msambweni plantations',140.00,324,'liter',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(52,2,'Pineapples','fruits','Pineapples sourced from Msambweni plantations',256.00,253,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(53,17,'Turmeric','spices','Alias molestiae quae aliquid sit sed culpa laborum minima.',137.00,439,'kg',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(54,24,'Rice','grains','Locally sourced produce from Kwale',286.00,432,'liter',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(55,24,'Cottage Cheese','dairy','Locally sourced produce from Kwale',379.00,344,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(56,10,'Pineapples','fruits','Locally sourced produce from Kwale',489.00,615,'piece',NULL,'active','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(57,3,'Buckwheat','grains','Organic buckwheat from Kenyan farms',429.00,610,'gram',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(58,3,'Quinoa','grains','Asperiores rerum blanditiis ea sed esse autem.',121.00,367,'gram',NULL,'out_of_stock','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(59,17,'Green Beans','vegetables','Locally sourced produce from Kwale',115.00,419,'kg',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(60,3,'Bananas','fruits','Ripe bananas from Kwale, sweet and ready to eat or cook.',173.00,628,'bag',NULL,'inactive','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(61,2,'potatata','vegetables','potatoes',70.00,3,'kg',NULL,'active','2025-07-11 01:04:03','2025-07-11 01:04:03'),
(65,28,'Tomato','fruits','hahaah',100.02,2,'kg',NULL,'active','2025-07-12 14:18:37','2025-07-12 15:55:30');
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Admin User','admin@agrilink.com','+254700000001',NULL,'$2y$12$t3VGwEuIz0lBPO4n8JaHMOHNET2m8HuiA.nKSr3m5G/dvA0dQro.u','admin','active',NULL,'2025-07-08 20:53:09','2025-07-08 20:53:09'),
(2,'John Farmer','farmer@agrilink.com','+254700000002',NULL,'$2y$12$GwHmzRHx4j4Lr6hJkE4mR.TL5ODKq1K3XIgopMBUoIY5zDumTDQNO','farmer','active',NULL,'2025-07-08 20:53:10','2025-07-08 20:53:10'),
(3,'Mary Wanjiku','mary.farmer@agrilink.com','+254700000003',NULL,'$2y$12$h8WH20slgn8YL6gynGgrtumbOE3zS5kzxMH0CJbr2ZzEp3jyHTL1e','farmer','active',NULL,'2025-07-08 20:53:10','2025-07-08 20:53:10'),
(4,'Jane Consumer','consumer@agrilink.com','+254700000004',NULL,'$2y$12$i89ifpFvv41FOBrSw56bJeUlK.GVjtMOXcMCswgyDIxwuXSbPOgUa','consumer','active',NULL,'2025-07-08 20:53:10','2025-07-08 20:53:10'),
(5,'Peter Kimani','peter.consumer@agrilink.com','+254700000005',NULL,'$2y$12$lPSvGpMhU6JFepWJ0JICw.7jH9x8GLFhxuqthLWlgXWAAZwB1uCXe','consumer','active',NULL,'2025-07-08 20:53:11','2025-07-08 20:53:11'),
(6,'Sarah Retailer','retailer@agrilink.com','+254700000006',NULL,'$2y$12$DdD.AJkonCw6zX8Pc5GMtezyjf4ZJJa10jBsfIjYAAt6wJjWTDsbO','retailer','active',NULL,'2025-07-08 20:53:11','2025-07-08 20:53:11'),
(7,'David Logistics','logistics@agrilink.com','+254700000007',NULL,'$2y$12$awdNRhYc4g.1YL0yBFW7Sehj2v3i7lDFBeNcqvtiog2NJt.O.Gn.O','logistics','active',NULL,'2025-07-08 20:53:11','2025-07-08 20:53:11'),
(8,'Mr. David Weissnat','altenwerth.haylee@example.com','+254773524125','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','logistics','inactive','EhwfNKBW6d','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(9,'Rosalee McCullough','hintz.christina@example.com','+254730511183','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','farmer','inactive','wFOeL3G8do','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(10,'Braeden Bins','daniella.kozey@example.net','+254705578990','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','farmer','inactive','JENh60fW9L','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(11,'Moses Schulist III','von.morgan@example.com','+254783607397','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','consumer','active','GI0Dx3BNXn','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(12,'Markus Bins','carley39@example.net','+254784960177','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','retailer','active','T3YrlYNFK0','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(13,'Koby Jacobson','bledner@example.net','+254761747129','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','retailer','active','FjGtqiFKrr','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(14,'Elbert Schoen I','hailee31@example.com','+254774224269','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','logistics','inactive','e18xi7W00H','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(15,'Lavinia Romaguera','umills@example.org','+254725640068','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','farmer','inactive','Wt5r4Dmieq','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(16,'Reba O\'Conner','franecki.eldora@example.org','+254743108408','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','retailer','active','9p2RwhenV0','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(17,'Giuseppe Kuhic','joshuah.lind@example.org','+254727289578','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','farmer','active','OHCm714BdQ','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(18,'Leopold Deckow','amorar@example.com','+254736097520','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','logistics','inactive','Dp1N31NzBs','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(19,'Ivory Paucek','zaria.batz@example.com','+254763621366','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','consumer','active','jyN7Coe7gp','2025-07-08 20:53:11','2025-07-08 20:53:11'),
(20,'Vada Streich','asha68@example.org','+254716818485','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','farmer','active','dCu7dFhsxc','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(21,'Prof. Vena Spinka I','ymayer@example.com','+254790510635','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','retailer','active','YzxVi9Kuvm','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(22,'Collin Prohaska IV','johnny.friesen@example.com','+254754197105','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','logistics','inactive','VWJ6AByyWz','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(23,'Dorian Morissette','rtremblay@example.com','+254784541234','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','consumer','inactive','K5fih1Aj3e','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(24,'Abigale Schinner','dean26@example.com','+254748780500','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','farmer','active','U4dxT9ugqY','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(25,'Prof. Alexander McKenzie','maegan55@example.net','+254742039199','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','retailer','active','UElBtnStTg','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(26,'Prudence Treutel','ygislason@example.com','+254772521822','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','retailer','inactive','XjKZBJkVbc','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(27,'Cicero Wisozk','langosh.maya@example.net','+254704033966','2025-07-08 20:53:11','$2y$12$LdcYVbc54gE.U.r.w0fcOuBNr0H9t.t1OGbiyZNflWdBUIekTo4Vu','logistics','active','EIEOU8ldcO','2025-07-08 20:53:12','2025-07-08 20:53:12'),
(28,'Brian Njuguna','brian@mail.com','0112358234',NULL,'$2y$12$.TYaKBZxdrNdSwWSiK3aD.vMexnCWZLaCYw4lk1hb5dieE8JCJnTG','farmer','active',NULL,'2025-07-10 03:14:54','2025-07-10 03:14:54'),
(29,'Brian Consumer','brianconsumer@mail.com','012345678',NULL,'$2y$12$deJRS1.dAqgxzyEvytlYT.hgTpomU1tKQwcu1B8WhwghvTbpKTtiu','consumer','active',NULL,'2025-07-10 16:36:04','2025-07-10 16:36:04'),
(30,'Brian Retailer','brianretailer@mail.com','012345678',NULL,'$2y$12$9Z5Bx37h21D6vOBk9PX8F.EfUzx9b2yF9JA3STIhY/RE9SNuSRAHO','retailer','active',NULL,'2025-07-10 16:39:33','2025-07-10 16:39:33'),
(31,'Brian Logistics','brianlogistics@mail.com','01',NULL,'$2y$12$0cqodLmILsYAQjDz2xJPzuBHdjTMB.9O9LXcrVqpfSImsqwIEtxrq','logistics','active',NULL,'2025-07-10 16:43:55','2025-07-10 16:43:55');
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

-- Dump completed on 2025-07-14 10:41:40
