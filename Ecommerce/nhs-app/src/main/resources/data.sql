use WebServices;
-- Ensure roles are inserted with non-null names
-- If roles already exist, update them to ensure names are set
INSERT INTO role(id, name) VALUES (1, "USER"), (2, "ADMIN"), (3, "SUPER_ADMIN")
ON DUPLICATE KEY UPDATE name = VALUES(name);
-- Fix any NULL role names
UPDATE role SET name = 'USER' WHERE id = 1 AND (name IS NULL OR TRIM(name) = '');
UPDATE role SET name = 'ADMIN' WHERE id = 2 AND (name IS NULL OR TRIM(name) = '');
UPDATE role SET name = 'SUPER_ADMIN' WHERE id = 3 AND (name IS NULL OR TRIM(name) = '');
insert into shipping_method(name,price) values("STANDARD",50000),("FAST",10000),("EXPRESS",20000);
insert into country(name) values("Viet Name"),("USA"),("China");
insert into payment_method(id, name, provider) values(1,"COD","NONE");

insert into category(id,name,description) values(1,"root","This is root category! Don't add anything");
insert into category(id,name,parent_category_id,description)
values (2,"Laptop",1,"Collection of laptop devices"),
       (3,"Smartphone",1,"Collection of smartphone devices"),
       (4,"Software",1,"Collection of software devices"),
       (5,"Speaker",1,"Collection of speaker devices"),
       (6,"Display",1,"Collection of display devices"),
       (7,"Accessories",1,"Collection of Accessories"),
       (8,"Apple",2,"APPLE laptops (MACBOOK)"),
       (9,"Acer",2,"Acer laptops"),
       (10,"HP",2,"HP laptops"),
       (11,"DELL",2,"DELL laptops"),
       (12,"Apple",3,"iPhone"),
       (13,"Samsung",3,"Galaxy phones"),
       (14,"Xiaomi",3,"Xiaomi phones"),
       (15,"Oppo",3,"Oppo phones"),
       (16,"Sony",3,"Sony phones"),
       (17,"Sony",5,"Sony speakers"),
       (18,"Beat",5,"Speakers");
insert into warehouse(id,name,detail) values
(1,"Sample warehouse 1","This is a sample warehouse object"),
(2,"Sample warehouse 2","This is a sample warehouse object"),
(3,"Sample warehouse 3","This is a sample warehouse object");

insert into payment(id,name,provider) values (1,"COD","DEFAULT"),(2,"ZaloPay","ZaloPay");

