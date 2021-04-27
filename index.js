const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const selectionOptions = {
  VIEW_ALL_EMPLOYEES: 'View all employees',
  VIEW_ALL_BY_DEPT: 'View all employees by department',
  VIEW_ALL_BY_MGR: 'View all employees by manager',
  ADD_EMPLOYEE: 'Add an employee',
  REMOVE_EMPLOYEE: 'Remove an employee',
  UPDATE_ROLE: 'Update an employees role',
  UPDATE_MGR: 'Update an employees manager',
  EXIT: 'exit'
};

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Your password
  password: 'Office32',
  database: 'employee_trackerDB',
});

// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

const start = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        selectionOptions.VIEW_ALL_EMPLOYEES,
        selectionOptions.VIEW_ALL_BY_DEPT,
        selectionOptions.VIEW_ALL_BY_MGR,
        selectionOptions.ADD_EMPLOYEE,
        selectionOptions.REMOVE_EMPLOYEE,
        selectionOptions.UPDATE_ROLE,
        selectionOptions.UPDATE_MGR,
        selectionOptions.EXIT,
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case selectionOptions.VIEW_ALL_EMPLOYEES:
          viewAll();
          break;
        
        case selectionOptions.VIEW_ALL_BY_DEPT:
          viewByDept();
          break;

        case selectionOptions.VIEW_ALL_BY_MGR:
          viewByMgr();
          break;

        case selectionOptions.ADD_EMPLOYEE:
          addEmployee();
          break;

        case selectionOptions.REMOVE_EMPLOYEE:
          rmEmployee();
          break;

        case selectionOptions.UPDATE_ROLE:
          updateRole();
          break;

        case selectionOptions.UPDATE_MGR:
          updateMgr();
          break;

        case selectionOptions.EXIT:
          connection.end();
          process.exit(1);
        
        default:
          console.log(`Invalid action: #{answer.action}`);
      }
    })
}

const viewAll = () => {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager ON manager.id = employee.manager_id
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id`;
  connection.query(query, (err, res) => {
    if(err) throw err;
    console.table(res);
    start();
  })
}

const viewByDept = () => {
  inquirer
    .prompt({
      name: 'dept',
      type: 'list',
      message: 'Which department would you like to view?',
      choices: ['Accounting', 'Corporate', 'Customer Service', 'Human Resources', 'Reception', 'Quality Assurance', 'Sales', 'Supplier Relations', 'Warehouse',],
    })
    .then((answer) => {
      const query = `
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
      FROM employee
      LEFT JOIN employee manager ON manager.id = employee.manager_id
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id WHERE name = ?`;
      connection.query(query, [answer.dept], (err, res) => {
        if(err) throw err;
        console.table(res);
        start();
      })
    })
  
}