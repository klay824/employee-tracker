DROP DATABASE IF EXISTS employee_trackerDB;
CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE department (
    department_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NULL,
    PRIMARY KEY (department_id)
);

CREATE TABLE role (
    role_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL(10,4),
    PRIMARY KEY (role_id),
    department_id INT NOT NULL
);

ALTER TABLE role 
ADD FOREIGN KEY (department_id) REFERENCES department (department_id);

CREATE TABLE employee (
    employee_id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    PRIMARY KEY (employee_id),
    role_id INT NOT NULL,
    manager_id INT NULL references employee
);

ALTER TABLE employee
ADD FOREIGN KEY (role_id) REFERENCES role (role_id)


-- DB Joins