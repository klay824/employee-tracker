const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const Department = require('./lib/department');
const Employee = require('./lib/employee');
const Role = require('./lib/role');

const selectionOptions = {
  VIEW_ALL_EMPLOYEES: 'View all employees',
  VIEW_ALL_BY_DEPT: 'View all employees by department',
  VIEW_ALL_BY_MGR: 'View all employees by manager',
  ADD_EMPLOYEE: 'Add an employee',
  REMOVE_EMPLOYEE: 'Remove an employee',
  UPDATE_ROLE: 'Update an employees role',
  UPDATE_MGR: 'Update an employees manager',
  EXIT: 'Exit'
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
    SELECT 
    employee.id, 
    CONCAT(employee.first_name, ' ', employee.last_name) AS employee, 
    role.title, 
    department.name AS department, 
    role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN employee manager ON manager.id = employee.manager_id
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id`;
  connection.query(query, (err, res) => {
    if(err) throw err;
    console.log('These are the employees of Dunder Mifflin Paper Company.')
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
        SELECT 
        employee.id, 
        CONCAT(employee.first_name, ' ', employee.last_name) AS employee, 
        role.title, 
        department.name AS department, 
        role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN employee manager ON manager.id = employee.manager_id
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id WHERE name = ?`;
      connection.query(query, [answer.dept], (err, res) => {
        if(err) throw err;
        console.log(`These are the employees of ${answer.dept}.`)
        console.table(res);
        start();
      })
    })  
}

const viewByMgr = () => {
  inquirer
    .prompt({
      name: 'mgr',
      type: 'list',
      message: 'Choose a manager to view their direct reports.',
      choices: ['Jan Levinson', 'Michael Scott',],
    })
    .then((answer) => {
      const query = `
        SELECT 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager, 
        CONCAT(employee.first_name, ' ', employee.last_name) AS employee, 
        employee.id AS employee_id, 
        role.title, 
        department.name AS department, 
        role.salary
        FROM employee
        LEFT JOIN employee manager ON manager.id = employee.manager_id
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id HAVING manager = ?`;
      connection.query(query, [answer.mgr], (err, res) => {
        if(err) throw err;
        console.log(`These employees report directly to ${answer.mgr}.`)
        console.table(res);
        start();
      })
    })
}

const addEmployee = () => {
  inquirer
    .prompt([
      {
        name: 'newEmpFN',
        type: 'input',
        message: 'Please enter the first name of the new employee.',
      },
      {
        name: 'newEmpLN',
        type: 'input',
        message: 'Please enter the last name of the new employee.',
      },
      {
        name: 'newEmpTitle',
        type: 'list',
        message: 'Please select the title of the new employee.',
        choices: ['Accountant', 'Manager', 'Customer Service Rep', 'HR Rep', 'Receptionist', 'QA Rep', 'Salesman', 'Supplier Rel Rep', 'Warehouse Foreman',],
      },
      {
        name: 'newEmpMgr',
        type: 'list',
        message: 'Please select the manager for the new employee.',
        choices: ['Jan Levinson', 'Michael Scott',],
      },
    ])
    
    .then((answer) => {
      const query1 = `SELECT id FROM role WHERE title = "${answer.newEmpTitle}"`
      const query2 = `SELECT id FROM employee WHERE first_name = "${answer.newEmpMgr.split(' ')[0]}" AND last_name = "${answer.newEmpMgr.split(' ')[1]}"`
      let roleId;
      let managerId;

      connection.query(query1, (err, role) => {
        roleId = role[0].id;

          connection.query(query2, (err, manager) => {
            managerId = manager[0].id;
            
              connection.query(
                'INSERT INTO employee SET ?',
                {
                  first_name: answer.newEmpFN,
                  last_name: answer.newEmpLN,
                  role_id: roleId,
                  manager_id: managerId,
                },
                (err) => {
                  if(err) throw err;
                  console.log(`${answer.rmEmpFN} ${answer.rmEmpLN} is now an employee of Dunder Mifflin Paper Company. Let's get 'em a welcome basket!`);
                  start();
                }
              )
          })
      })
    })
}

const rmEmployee = () => {
  inquirer
    .prompt([
      {
        name: 'rmEmpFN',
        type: 'input',
        message: 'Please enter the first name of the employee you wish to remove.',
      },
      {
        name: 'rmEmpLN',
        type: 'input',
        message: 'Please enter the last name of the employee you wish to remove.',
      },
    ])
    .then((answer) => {
      connection.query(
        `DELETE FROM employee WHERE first_name = "${answer.rmEmpFN}" AND last_name = "${answer.rmEmpLN}"`,
        (err) => {
          if(err) throw err;
          console.log(`${answer.rmEmpFN} ${answer.rmEmpLN} is no longer an employee of Dunder Mifflin Paper Company. Sad day.`)
          start();
        }
      )
    })
}

const updateRole = () => {
  inquirer
    .prompt([
      {
        name: 'employeeFN',
        type: 'input',
        message: 'Please enter the first name of the employee whose title you want to update.',
      },
      {
        name: 'employeeLN',
        type: 'input',
        message: 'Please enter the last name of the employee whose title you want to update',
      },
      {
        name: 'empNewRole',
        type: 'list',
        message: 'Please choose the new title for the employee.',
        choices: ['Accountant', 'Manager', 'Customer Service Rep', 'HR Rep', 'Receptionist', 'QA Rep', 'Salesman', 'Supplier Rel Rep', 'Warehouse Foreman',],
      },
    ])
    // going to need to do two queries like in addEmployee() because the rold_id is a number not a string
    .then((answer) => {
      const query = `SELECT id FROM role WHERE title = "${answer.empNewRole}"`
      let roleId;
      
      connection.query(query, (err, role) => {        
        roleId = role[0].id;        
      
        connection.query(
          `UPDATE employee
          SET role_id = ${roleId}
          WHERE first_name = "${answer.employeeFN}" AND last_name = "${answer.employeeLN}"`,
          (err) => {
            if(err) throw err;
            console.log(`You have successfully updated ${answer.employeeFN} ${answer.employeeLN}'s title with Dunder Mifflin Paper Company!`);
            start();
          }
        )
      })  
    })
}

const updateMgr = () => {

  connection.query(`SELECT CONCAT(first_name, ' ', last_name) AS employee FROM employee`, (err, data) => {
    if(err) throw err;  
    
    inquirer
      .prompt([
        {
          name: 'employeeFN',
          type: 'input',
          message: 'Please enter the first name of the employee whose title you want to update.',
        },
        {
          name: 'employeeLN',
          type: 'input',
          message: 'Please enter the last name of the employee whose title you want to update',
        },
        {
          name: 'empNewMgr',
          type: 'rawlist',
          choices() {
            const choiceArray = [];
            data.forEach(({ employee }) => {
              choiceArray.push(employee);
            });
            return choiceArray;            
          },
          message: `Please select the new manager for the employee.`
        },
      ])
      .then((answer) => {
        const query = `SELECT id FROM employee WHERE first_name = "${answer.empNewMgr.split(' ')[0]}" AND last_name = "${answer.empNewMgr.split(' ')[1]}"`
        let managerId;
            
        connection.query(query, (err, manager) => {
          managerId = manager[0].id;
          console.log(managerId);
        
            connection.query(`UPDATE employee 
            SET manager_id = ${managerId} 
            WHERE first_name = "${answer.employeeFN}" AND last_name = "${answer.employeeLN}"`,            
            (err) => {
              if(err) throw err;
              console.log(`You have successfully updated ${answer.employeeFN} ${answer.employeeLN}'s manager at Dunder Mifflin Paper Company!`)
              start();
            })
        })
      })
  })
}