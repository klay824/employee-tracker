USE employee_trackerDB;

INSERT INTO department (name)
VALUES 
	('Accounting'),
    ('Corporate'), 
    ('Customer Service'), 
    ('Human Resources'), 
    ('Reception'), 
    ('Quality Assurance'),
	('Sales'),
	('Supplier Relations'),
	('Warehouse');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Accounant', 45000, 1),
    ('Manager', 65000, 2),
    ('Customer Service Rep', 37500, 3),
    ('HR Rep', 50000, 4),
    ('Receptionist', 35000, 5),
    ('QA Rep', 40000, 6),
    ('Salesman', 55000, 7),
    ('Supplier Rel Rep', 40000, 8),
    ('Warehouse Foreman', 45000, 9);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Oscar', 'Martinez', 1, 2),
    ('Angela', 'Martin', 1, 2),
    ('Kevin', 'Malone', 1, 2),
    ('Michael', 'Scott', 2, 5),
    ('Jan', 'Levinson', 2, 0),
    ('Kelly', 'Kapoor', 3, 2),
    ('Toby', 'Flenderson', 4, 5),
    ('Pam', 'Beesly', 5, 2),
    ('Creed', 'Bratton', 6, 2),
    ('Jim', 'Halpert', 7, 2),
    ('Dwight', 'Schrute', 7, 2),
    ('Meredith', 'Palmer', 8, 2),
    ('Darryl', 'Philbin', 9, 2);