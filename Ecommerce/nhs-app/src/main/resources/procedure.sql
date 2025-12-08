DELIMITER //
CREATE TRIGGER setupNewUser
    after insert on user
    for each row
    begin
        insert into user_payment(payment_type_id,user_id) value (1,NEW.id);
    end //
--Trigger này chạy tự động sau khi tạo user mới.

DELIMITER //
CREATE PROCEDURE setDefaultUserAddress(
    IN user_id_param INT,
    IN address_id_param INT
)
begin
    declare err tinyint default false;
    declare continue  handler for sqlexception
        set err=true;
    start transaction;
    update user_address set is_default=false where user_id=user_id_param and is_default=true;
    update user_address set is_default=true where address_id=address_id_param and user_id=user_id_param;
    if err then
        rollback;
    else
        commit;
        select * from user_address where address_id=address_id_param;
    end if;
end //

--Procedure này dùng để set một địa chỉ của user thành địa chỉ mặc định, đồng thời đảm bảo transaction đúng.