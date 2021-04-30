-- drops database if one of the same name already exisits
DROP DATABASE IF EXISTS employee_trackerDB;

-- creates the database
CREATE DATABASE employee_trackerDB;

-- uses the correct database we are working in
USE employee_trackerDB;


-- creates department table
CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NULL,
    PRIMARY KEY (id)
);

-- creates role table
CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL(10,4),
    PRIMARY KEY (id),
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

-- creates employee table
CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    PRIMARY KEY (id),
    role_id INT NOT NULL,
    manager_id INT references employee,
    FOREIGN KEY (role_id) REFERENCES role(id)
);


SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;