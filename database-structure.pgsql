CREATE TABLE Restaurant (
    restaurant_id serial PRIMARY KEY,
    full_name varchar(100) NOT NULL, 
    town varchar(50) NOT NULL,
    description varchar(300)
);