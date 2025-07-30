# backend

## LOGIN
http://localhost:3000/api/user/login
method: POST
{"user_id":"userid","user_pw":"userpw"}

## REGISTER
http://localhost:3000/api/user/register
method: POST
{"user_id":"userid","user_pw":"userpw","user_name":"username"}

# DB

## user
user_id varchar(50) primary key, 
user_pw varchar(200) not null,
user_name varchar(50) NOT NULL

## user_info

user_id VARCHAR(50),
age int not null,
height int not null,
weight int not null,
sex boolean not null,
preg boolean,
dis varchar(200)


성별 논리값 {남 : 1, 여 : 0}
