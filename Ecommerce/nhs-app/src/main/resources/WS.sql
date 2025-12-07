-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: WebServices
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(255) DEFAULT NULL,
  `provider` tinyint DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_h6dr47em6vg85yuwt4e2roca4` (`user_id`),
  CONSTRAINT `FK7m8ru44m93ukyb61dfxw0apf6` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `account_chk_1` CHECK ((`provider` between 0 and 1))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'$2a$10$KYmjzsLMr5xfZopZNtrOoe2AxXAp5p.PM5SgJEIYiJwYcbVQf18vG',0,1,'minhnhb',1),(2,'$2a$10$DJNsgDeaTvhZg1vBQfJW8uOftmOi3gNilgxtkaSnn7vZnitpmRDZy',0,1,'test101',2),(3,'$2a$10$KsGhsas6meLvxS4P2fjZgOvymN3hJcEsZ4Iwo5irNgMW5BSN.tihK',0,1,'test102',3);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_role`
--

DROP TABLE IF EXISTS `account_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_role` (
  `account_id` int NOT NULL,
  `role_id` int NOT NULL,
  KEY `FKrs2s3m3039h0xt8d5yhwbuyam` (`role_id`),
  KEY `FK1f8y4iy71kb1arff79s71j0dh` (`account_id`),
  CONSTRAINT `FK1f8y4iy71kb1arff79s71j0dh` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  CONSTRAINT `FKrs2s3m3039h0xt8d5yhwbuyam` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_role`
--

LOCK TABLES `account_role` WRITE;
/*!40000 ALTER TABLE `account_role` DISABLE KEYS */;
INSERT INTO `account_role` VALUES (1,2),(2,3),(3,1);
/*!40000 ALTER TABLE `account_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accountstatisticsview`
--

DROP TABLE IF EXISTS `accountstatisticsview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accountstatisticsview` (
  `total_accounts` bigint NOT NULL,
  `total_status_1` decimal(22,0) DEFAULT NULL,
  `total_status_2` decimal(22,0) DEFAULT NULL,
  `total_status_3` decimal(22,0) DEFAULT NULL,
  PRIMARY KEY (`total_accounts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accountstatisticsview`
--

LOCK TABLES `accountstatisticsview` WRITE;
/*!40000 ALTER TABLE `accountstatisticsview` DISABLE KEYS */;
/*!40000 ALTER TABLE `accountstatisticsview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `address_line_1` varchar(45) DEFAULT NULL,
  `address_line_2` varchar(45) DEFAULT NULL,
  `building` varchar(45) DEFAULT NULL,
  `business_address` tinyint DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `region` varchar(45) DEFAULT NULL,
  `country_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKe54x81nmccsk5569hsjg1a6ka` (`country_id`),
  CONSTRAINT `FKe54x81nmccsk5569hsjg1a6ka` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `qty` int DEFAULT NULL,
  `product_item_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKj46f52s31n4pbpgucd6x2ci46` (`product_item_id`),
  KEY `FKjnaj4sjyqjkr4ivemf9gb25w` (`user_id`),
  CONSTRAINT `FKj46f52s31n4pbpgucd6x2ci46` FOREIGN KEY (`product_item_id`) REFERENCES `product_item` (`id`),
  CONSTRAINT `FKjnaj4sjyqjkr4ivemf9gb25w` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `cart_item_chk_1` CHECK ((`qty` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `parent_category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKs2ride9gvilxy2tcuv7witnxc` (`parent_category_id`),
  CONSTRAINT `FKs2ride9gvilxy2tcuv7witnxc` FOREIGN KEY (`parent_category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'This is root category! Don\'t add anything','root',NULL),(2,'Collection of laptop devices','Laptop',1),(3,'Collection of smartphone devices','Smartphone',1),(4,'Collection of software devices','Software',1),(5,'Collection of speaker devices','Speaker',1),(6,'Collection of display devices','Display',1),(7,'Collection of Accessories','Accessories',1),(8,'APPLE laptops (MACBOOK)','Apple',2),(9,'Acer laptops','Acer',2),(10,'HP laptops','HP',2),(11,'DELL laptops','DELL',2),(12,'iPhone','Apple',3),(13,'Galaxy phones','Samsung',3),(14,'Xiaomi phones','Xiaomi',3),(15,'Oppo phones','Oppo',3),(16,'Sony phones','Sony',3),(17,'Sony speakers','Sony',5),(18,'Speakers','Beat',5);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment` varchar(255) DEFAULT NULL,
  `create_at` datetime(6) DEFAULT NULL,
  `rate` tinyint DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKm1rmnfcvq5mk26li4lit88pc5` (`product_id`),
  KEY `FK8kcum44fvpupyw6f5baccx25c` (`user_id`),
  CONSTRAINT `FK8kcum44fvpupyw6f5baccx25c` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKm1rmnfcvq5mk26li4lit88pc5` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `country` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country`
--

LOCK TABLES `country` WRITE;
/*!40000 ALTER TABLE `country` DISABLE KEYS */;
INSERT INTO `country` VALUES (1,'Viet Name'),(2,'USA'),(3,'China');
/*!40000 ALTER TABLE `country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_line`
--

DROP TABLE IF EXISTS `order_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_line` (
  `id` int NOT NULL,
  `qty` int DEFAULT NULL,
  `total` decimal(18,9) DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `product_item_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbjk762ct6wq2bwsibfd2khc6m` (`order_id`),
  KEY `FKa8w7lfrwdh7muehfgi8tvek4q` (`product_item_id`),
  CONSTRAINT `FKa8w7lfrwdh7muehfgi8tvek4q` FOREIGN KEY (`product_item_id`) REFERENCES `product_item` (`id`),
  CONSTRAINT `FKbjk762ct6wq2bwsibfd2khc6m` FOREIGN KEY (`order_id`) REFERENCES `shop_order` (`id`),
  CONSTRAINT `order_line_chk_1` CHECK ((`total` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_line`
--

LOCK TABLES `order_line` WRITE;
/*!40000 ALTER TABLE `order_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_line_seq`
--

DROP TABLE IF EXISTS `order_line_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_line_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_line_seq`
--

LOCK TABLES `order_line_seq` WRITE;
/*!40000 ALTER TABLE `order_line_seq` DISABLE KEYS */;
INSERT INTO `order_line_seq` VALUES (1);
/*!40000 ALTER TABLE `order_line_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `provider` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,'COD','DEFAULT'),(2,'ZaloPay','ZaloPay');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_method`
--

DROP TABLE IF EXISTS `payment_method`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_method` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `provider` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_method`
--

LOCK TABLES `payment_method` WRITE;
/*!40000 ALTER TABLE `payment_method` DISABLE KEYS */;
INSERT INTO `payment_method` VALUES (1,'COD','NONE');
/*!40000 ALTER TABLE `payment_method` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `description` text,
  `manufacturer` varchar(512) DEFAULT NULL,
  `name` varchar(45) NOT NULL,
  `picture` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1mtsbur82frn64de7balymq9s` (`category_id`),
  CONSTRAINT `FK1mtsbur82frn64de7balymq9s` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_item`
--

DROP TABLE IF EXISTS `product_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `original_price` decimal(38,2) DEFAULT NULL,
  `picture` varchar(512) DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa9mjpi98ark8eovbtnnreygbb` (`product_id`),
  CONSTRAINT `FKa9mjpi98ark8eovbtnnreygbb` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_item`
--

LOCK TABLES `product_item` WRITE;
/*!40000 ALTER TABLE `product_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_item_in_warehouse`
--

DROP TABLE IF EXISTS `product_item_in_warehouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_item_in_warehouse` (
  `sku` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `product_item_id` int NOT NULL,
  `warehouse_id` int NOT NULL,
  PRIMARY KEY (`product_item_id`,`warehouse_id`),
  KEY `FKrcax6pprjgkcuubavjqqr1va4` (`warehouse_id`),
  CONSTRAINT `FKnbepwys16dg16w3h2kliiy2v3` FOREIGN KEY (`product_item_id`) REFERENCES `product_item` (`id`),
  CONSTRAINT `FKrcax6pprjgkcuubavjqqr1va4` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_item_in_warehouse`
--

LOCK TABLES `product_item_in_warehouse` WRITE;
/*!40000 ALTER TABLE `product_item_in_warehouse` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_item_in_warehouse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_item_options`
--

DROP TABLE IF EXISTS `product_item_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_item_options` (
  `product_item_id` int NOT NULL,
  `variation_option_id` int NOT NULL,
  KEY `FK36su826ewlun31ve1agwa8uih` (`variation_option_id`),
  KEY `FKhixakfdkk6owppho793jeb5yo` (`product_item_id`),
  CONSTRAINT `FK36su826ewlun31ve1agwa8uih` FOREIGN KEY (`variation_option_id`) REFERENCES `variation_option` (`id`),
  CONSTRAINT `FKhixakfdkk6owppho793jeb5yo` FOREIGN KEY (`product_item_id`) REFERENCES `product_item` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_item_options`
--

LOCK TABLES `product_item_options` WRITE;
/*!40000 ALTER TABLE `product_item_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_item_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prospectiveuser`
--

DROP TABLE IF EXISTS `prospectiveuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prospectiveuser` (
  `id` int NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `firstname` varchar(45) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `lastname` varchar(45) DEFAULT NULL,
  `phone_number` varchar(12) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `total_amount` decimal(40,2) DEFAULT NULL,
  `total_order` bigint NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prospectiveuser`
--

LOCK TABLES `prospectiveuser` WRITE;
/*!40000 ALTER TABLE `prospectiveuser` DISABLE KEYS */;
/*!40000 ALTER TABLE `prospectiveuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_token` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expired_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `account_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_r4k4edos30bx9neoq81mdvwph` (`token`),
  KEY `FKiox3wo9jixvp9boxfheq7l99w` (`account_id`),
  CONSTRAINT `FKiox3wo9jixvp9boxfheq7l99w` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
INSERT INTO `refresh_token` VALUES (1,'2025-12-06 20:06:54.885559','7074c73c-6e38-4e42-9408-2cd9ca9b2b02',1),(2,'2025-12-06 20:46:29.775456','cd1bedfb-5581-4e5e-8d9d-ef103f0beac7',2),(3,'2025-12-06 22:41:36.457116','0cc26fce-879e-40c7-bbca-0f9d69f8be56',3);
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'USER'),(2,'ADMIN'),(3,'SUPER_ADMIN');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_method`
--

DROP TABLE IF EXISTS `shipping_method`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_method` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_method`
--

LOCK TABLES `shipping_method` WRITE;
/*!40000 ALTER TABLE `shipping_method` DISABLE KEYS */;
INSERT INTO `shipping_method` VALUES (1,'STANDARD',50000.00),(2,'FAST',10000.00),(3,'EXPRESS',20000.00);
/*!40000 ALTER TABLE `shipping_method` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop_order`
--

DROP TABLE IF EXISTS `shop_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `note` tinytext,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(18,2) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  `payment_id` int NOT NULL,
  `shipping_method` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_fjpvl16s95xxxjjagg39fbngs` (`payment_id`),
  KEY `FK7qvgu9j9j0webqibpbjggiq10` (`address_id`),
  KEY `FKatxhfqwimvpshgr64ifo6dx2o` (`shipping_method`),
  KEY `FK7ln2hb3a1ugyr7h92rloxv0b` (`user_id`),
  CONSTRAINT `FK7ln2hb3a1ugyr7h92rloxv0b` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FK7qvgu9j9j0webqibpbjggiq10` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`),
  CONSTRAINT `FKatxhfqwimvpshgr64ifo6dx2o` FOREIGN KEY (`shipping_method`) REFERENCES `shipping_method` (`id`),
  CONSTRAINT `FKbirtnc4ybtp8rr0a76tl04by4` FOREIGN KEY (`payment_id`) REFERENCES `shop_order_payment` (`id`),
  CONSTRAINT `shop_order_chk_1` CHECK ((`total` >= 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_order`
--

LOCK TABLES `shop_order` WRITE;
/*!40000 ALTER TABLE `shop_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop_order_payment`
--

DROP TABLE IF EXISTS `shop_order_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_order_payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `order_number` varchar(45) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `update_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `payment_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7ol8owhr7hqq2343u8qhqi2cq` (`payment_id`),
  CONSTRAINT `FK7ol8owhr7hqq2343u8qhqi2cq` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_order_payment`
--

LOCK TABLES `shop_order_payment` WRITE;
/*!40000 ALTER TABLE `shop_order_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop_order_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shop_order_status`
--

DROP TABLE IF EXISTS `shop_order_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shop_order_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `shop_order_id` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `update_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK3tq3odenne3ku7bwni90exe9k` (`shop_order_id`),
  CONSTRAINT `FK3tq3odenne3ku7bwni90exe9k` FOREIGN KEY (`shop_order_id`) REFERENCES `shop_order` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shop_order_status`
--

LOCK TABLES `shop_order_status` WRITE;
/*!40000 ALTER TABLE `shop_order_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `shop_order_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `firstname` varchar(45) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `lastname` varchar(45) DEFAULT NULL,
  `phone_number` varchar(12) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'2004-04-13','baominhnh04@gmail.com','Nguyen','Male','Minh','0961994576',NULL),(2,'2025-12-04','fake@fake.com','test1','Male','tt','0961994570',NULL),(3,'2025-12-10','fake2@fake.com','test1','Male','tt','0961994579',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_address`
--

DROP TABLE IF EXISTS `user_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_address` (
  `is_business` bit(1) DEFAULT NULL,
  `is_default` bit(1) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `address_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`address_id`,`user_id`),
  KEY `FKk2ox3w9jm7yd6v1m5f68xibry` (`user_id`),
  CONSTRAINT `FKdaaxogn1ss81gkcsdn05wi6jp` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`),
  CONSTRAINT `FKk2ox3w9jm7yd6v1m5f68xibry` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_address`
--

LOCK TABLES `user_address` WRITE;
/*!40000 ALTER TABLE `user_address` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_payment`
--

DROP TABLE IF EXISTS `user_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_number` int DEFAULT NULL,
  `expiry_date` datetime(6) DEFAULT NULL,
  `is_default` tinyint DEFAULT NULL,
  `payment_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKp26q7g746j5gga3w5l1ulr0mq` (`payment_type_id`),
  KEY `FK8fb9fr82lb1qk2cw55ito9rk6` (`user_id`),
  CONSTRAINT `FK8fb9fr82lb1qk2cw55ito9rk6` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKp26q7g746j5gga3w5l1ulr0mq` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_method` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_payment`
--

LOCK TABLES `user_payment` WRITE;
/*!40000 ALTER TABLE `user_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variation`
--

DROP TABLE IF EXISTS `variation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variation`
--

LOCK TABLES `variation` WRITE;
/*!40000 ALTER TABLE `variation` DISABLE KEYS */;
/*!40000 ALTER TABLE `variation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variation_option`
--

DROP TABLE IF EXISTS `variation_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variation_option` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(45) DEFAULT NULL,
  `variation_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKlfkypq92cr21b9mtc7mihks1e` (`variation_id`),
  CONSTRAINT `FKlfkypq92cr21b9mtc7mihks1e` FOREIGN KEY (`variation_id`) REFERENCES `variation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variation_option`
--

LOCK TABLES `variation_option` WRITE;
/*!40000 ALTER TABLE `variation_option` DISABLE KEYS */;
/*!40000 ALTER TABLE `variation_option` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse`
--

DROP TABLE IF EXISTS `warehouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `detail` varchar(255) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKp7xymgre8vt94ihf75e9movyt` (`address_id`),
  CONSTRAINT `FKp7xymgre8vt94ihf75e9movyt` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse`
--

LOCK TABLES `warehouse` WRITE;
/*!40000 ALTER TABLE `warehouse` DISABLE KEYS */;
INSERT INTO `warehouse` VALUES (1,'This is a sample warehouse object','Sample warehouse 1',NULL),(2,'This is a sample warehouse object','Sample warehouse 2',NULL),(3,'This is a sample warehouse object','Sample warehouse 3',NULL);
/*!40000 ALTER TABLE `warehouse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'WebServices'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-07 21:54:12
