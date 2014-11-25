<?php
$con = mysql_connect("localhost", "root", "") or die (mysql_error());

mysql_select_db("vacations.mysql") or die (mysql_error());

mysql_query("create table if not exists vacations_otdels (id int not null auto_increment, departament int not null, name varchar(250) not null, graph int, primary key(id))") or die (mysql_error());

mysql_query("create table if not exists vacations_members (id int not null auto_increment, name varchar(250) not null unique, access int not null, primary key(id))") or die (mysql_error());

mysql_query("insert ignore vacations_members (name, access) values('ann', '1')") or die (mysql_error());
mysql_query("insert ignore vacations_members (name, access) values('ansu', '1')") or die (mysql_error());
mysql_query("insert ignore vacations_members (name, access) values('lav', '1')") or die (mysql_error());
mysql_query("insert ignore vacations_members (name, access) values('kras', '1')") or die (mysql_error());

mysql_query("insert ignore vacations_members (name, access) values('nik', '2')") or die (mysql_error());
mysql_query("insert ignore vacations_members (name, access) values('dvs', '2')") or die (mysql_error());
mysql_query("insert ignore vacations_members (name, access) values('zym', '2')") or die (mysql_error());


mysql_query("create table if not exists vacations_peoples (id int not null auto_increment, otdel int not null, name varchar(250) not null unique, primary key(id))") or die (mysql_error());

mysql_query("create table if not exists vacations_pointers (uid int, name varchar(250) not null, otdel int, primary key(uid, name, otdel))") or die (mysql_error());

mysql_query("create table if not exists vacations_editors (uid int, name varchar(250) not null, otdel int, primary key(uid, name, otdel))") or die (mysql_error());

mysql_query("create table if not exists vacations_storage (id varchar(250) not null unique, name varchar(250) not null, otdel int not null, data text, checked int, primary key(id))") or die (mysql_error());

?>