const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

// bringing in constructor files
const Department = require('./lib/department');
const Employee = require('./lib/employee');
const Role = require('./lib/role');

// these are the selection option statements for the action choices
const selectionOptions = {
  VIEW_ALL_EMPLOYEES: 'View all employees.',
  VIEW_ALL_DEPTS: 'View all departments.',
  VIEW_ALL_ROLES: 'View all titles.',
  VIEW_ALL_BY_MGR: 'View all employees by manager.',
  VIEW_DEPT_BUDGET: 'View utlized budget by department',
  ADD_EMPLOYEE: 'Add an employee.',
  ADD_ROLE: 'Add a title.',
  ADD_DEPARTMENT: 'Add a department',
  REMOVE_EMPLOYEE: 'Remove an employee.',
  REMOVE_ROLE: 'Remove a title',
  REMOVE_DEPARTMENT: 'Remove a department',
  UPDATE_ROLE: 'Update an employees title.',
  UPDATE_MGR: 'Update an employees manager.',
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

// This function serves as the 'main menu' for the program where all the employee tracker options are
const start = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        selectionOptions.VIEW_ALL_EMPLOYEES,
        selectionOptions.VIEW_ALL_DEPTS,
        selectionOptions.VIEW_ALL_ROLES,
        selectionOptions.VIEW_ALL_BY_MGR,
        selectionOptions.VIEW_DEPT_BUDGET,
        selectionOptions.ADD_EMPLOYEE,
        selectionOptions.ADD_ROLE,
        selectionOptions.ADD_DEPARTMENT,
        selectionOptions.REMOVE_EMPLOYEE,
        selectionOptions.REMOVE_ROLE,
        selectionOptions.REMOVE_DEPARTMENT,        
        selectionOptions.UPDATE_ROLE,
        selectionOptions.UPDATE_MGR,
        selectionOptions.EXIT,
      ],
    })
    .then((answer) => {
      // swtich statement to run a particular function based on the selection the user made
      switch (answer.action) {
        case selectionOptions.VIEW_ALL_EMPLOYEES:
          viewAll();
          break;
        
        case selectionOptions.VIEW_ALL_DEPTS:
          viewAllDept();
          break;

        case selectionOptions.VIEW_ALL_ROLES:
          viewAllRole();
          break;

        case selectionOptions.VIEW_ALL_BY_MGR:
          viewByMgr();
          break;

        case selectionOptions.VIEW_DEPT_BUDGET:
          viewBudget();
          break;

        case selectionOptions.ADD_EMPLOYEE:
          addEmployee();
          break;

        case selectionOptions.ADD_ROLE:
          addRole();
          break;

        case selectionOptions.ADD_DEPARTMENT:
          addDepartment();
          break;

        case selectionOptions.REMOVE_EMPLOYEE:
          rmEmployee();
          break;

        case selectionOptions.REMOVE_ROLE:
          rmRole();
          break;

        case selectionOptions.REMOVE_DEPARTMENT:
          rmDepartment();
          break;

        case selectionOptions.UPDATE_ROLE:
          updateRole();
          break;

        case selectionOptions.UPDATE_MGR:
          updateMgr();
          break;

        case selectionOptions.EXIT:
          connection.end();
          process.exit(0);
                  
        default:
          console.log(`Invalid action: ${answer.action}`);
      }
    })
}

// function to view all employees and their title, department salary, and manager
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

// function to view all departments
const viewAllDept = () => {
  connection.query(
    `Select * FROM department`,
    (err, res) => {
      if(err) throw err;
      console.log('These are all the departments at Dunder Mifflin Paper Company!');
      console.table(res);
      start();
    })
}

// function to view all titles (roles)
const viewAllRole = () => {
  connection.query(
    `Select title FROM role`,
    (err, res) => {
      if(err) throw err;
      console.log('These are all the employee titles at Dunder Mifflin Paper Company!');
      console.table(res);
      start();
    })
}

// function to view employees by manager
const viewByMgr = () => {
  connection.query(`SELECT CONCAT(first_name, ' ', last_name) AS manager FROM employee WHERE role_id = 2`, (err, data) =>{

    inquirer
      .prompt({
        name: 'mgr',
        type: 'list',
        choices() {
          const choiceArr = [];
          data.forEach(({ manager }) => {
            choiceArr.push(manager);
          });
          return choiceArr;
        },
        message: 'Please choose the manager whose direct reports you wish to view.'
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
  })
}

// function to add an employee to the company database
const addEmployee = () => {
  const query1 = `SELECT title FROM role`
  const query2 = `SELECT CONCAT(first_name, ' ', last_name) AS manager FROM employee WHERE role_id = 2`

  connection.query(query1, (err, data1) => {

    connection.query(query2, (err, data2) => {

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
            choices() {
              const titleChoices = [];
              data1.forEach(({ title }) => {
                titleChoices.push(title);
              });
              return titleChoices;
            },
            message: 'Please choose the title for the new employee.'
          },
          {
            name: 'newEmpMgr',
            type: 'list',
            message: 'Please select the manager for the new employee.',
            choices() {
              const mgrArr = [];
              data2.forEach(({ manager }) =>{
                mgrArr.push(manager);
              });
              return mgrArr;
            },
            message: 'Please choose the manager for the new employee.'
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
                      console.log(`${answer.newEmpFN} ${answer.newEmpLN} is now an employee of Dunder Mifflin Paper Company. Let's get 'em a welcome basket!`);
                      start();
                    }
                  )
              })
          })
        })
    })
  })
}

// function to add a new title (role) to the company database
const addRole = () => {
  connection.query(`SELECT name AS department FROM department`, (err, deptData) => {
    
    inquirer
      .prompt([
        {
          name: 'newRole',
          type: 'input',
          message: 'Please enter the new title to add to Dunder Mifflin Paper Company',
        },
        {
          name: 'salary',
          type: 'input',
          message: 'Please enter the salary for the new title.',
        },
        {
          name: 'dept',
          type: 'list',
          choices() {
            const choiceArr = [];
            deptData.forEach(({ department }) => {
              choiceArr.push(department);
            });
            return choiceArr;
          },
          message: 'Please choose which department the new title is in.'
        },
      ])
      .then((answer) => {
        const query1 = `SELECT id FROM department WHERE name = "${answer.dept}"`
        let deptId;

        connection.query(query1, (err, data) => {
          deptId = data[0].id;
                  
            connection.query(
              'INSERT INTO role SET ?',
              {
                title: answer.newRole,
                salary: answer.salary,
                department_id: deptId,
              },
              (err) => {
                if(err) throw err;
                console.log(`You have successfully added the ${answer.dept} title to Dunder Mifflin Paper Company!`);
                start();
              }
            )
        })    
      })
  })    
}

// function to add a department to the company database
const addDepartment = () => {
  inquirer
    .prompt({
      name: 'newDept',
      type: 'input',
      message: 'Please enter the name of the department you wish to add.',
    })
    .then((answer) => {
      connection.query(`INSERT INTO department (name) VALUES ("${answer.newDept}")`, 
      (err) => {
        if(err) throw err;
        console.log(`You have successfully added ${answer.newDept} to Dunder Mifflin Paper Company!`);
        start();
      })
    })
}

// function to remove an employee from the company datbase
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

// function to remove a title (role) from the database
const rmRole = () => {
  connection.query(`SELECT title FROM role`, (err, data) => {

    inquirer
      .prompt(
        {
          name: 'rmRole',
          type: 'list',
          choices() {
            const choicesArr = [];
            data.forEach(({ title }) => {
              choicesArr.push(title);
            });
            return choicesArr;
          },
          message: 'Which title do you wish to remove?'
        },
      )
      .then((answer) => {
        connection.query(
          `DELETE FROM role WHERE title = "${answer.rmRole}"`,
          (err) => {
            if(err) throw err;
            console.log(`You have successfully remove the ${answer.rmRole} from the Dunder Mifflin Paper Company employee database.`);
            start();
          }
        )
      })
  })
}

// function to remove a department from the company database
const rmDepartment = () => {
  connection.query(`SELECT name FROM department`, (err, data) => {
    inquirer
    .prompt(
      {
        name:'rmDept',
        type: 'list',
        choices() {
          const choiceArr = [];
          data.forEach(({ name }) => {
            choiceArr.push(name);
          });
          return choiceArr;
        },
        message: 'Which department do you wish to remove?'
      },
    )
    .then((answer) => {
      connection.query(
        `DELETE FROM department WHERE name = "${answer.rmDept}"`,
        (err) => {
          if(err) throw err;
          console.log(`You have successfully remove the ${answer.rmDept} from the Dunder Mifflin Paper Company employee database.`);
          start();
        }
      )
    })
  })
}

// function to update an employee's title (role)
const updateRole = () => {
  connection.query(`SELECT title FROM role`, (err,data) => {
  
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
          choices() {
            const choiceArr = [];
            data.forEach(({ title }) => {
              choiceArr.push(title);
            });
            return choiceArr;
          },
          message: 'Please choose a new title for the employee.'
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
  })
}

// function to update an employee's manager
const updateMgr = () => {

  connection.query(`SELECT CONCAT(first_name, ' ', last_name) AS manager FROM employee WHERE role_id = 2`, (err, data) => {
    if(err) throw err;  
    
    inquirer
      .prompt([
        {
          name: 'employeeFN',
          type: 'input',
          message: 'Please enter the first name of the employee whose manager you want to update.',
        },
        {
          name: 'employeeLN',
          type: 'input',
          message: 'Please enter the last name of the employee whose manager you want to update',
        },
        {
          name: 'empNewMgr',
          type: 'list',
          choices() {
            const choiceArray = [];
            data.forEach(({ manager }) => {
              choiceArray.push(manager);
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

// function to view a department's utilized budget (combined salary of all the employees in that department)
const viewBudget = () => {
  connection.query(`SELECT name FROM department`, (err, data) => {
    inquirer
    .prompt(
      {
        name:'deptBudget',
        type: 'list',
        choices() {
          const choiceArr = [];
          data.forEach(({ name }) => {
            choiceArr.push(name);
          });
          return choiceArr;
        },
        message: 'Please choose a department to view their utilized budget.'
      },
    )
    .then((answer) => {
      const query = `
        SELECT 
        department.name AS department,
        SUM(role.salary) AS 'utilized budget'
        FROM employee
        LEFT JOIN role on employee.role_id = role.id
        LEFT JOIN department on role.department_id = department.id
        GROUP BY department.name
        HAVING department.name = ?`;
      connection.query(query, [answer.deptBudget], (err, data) => {
        if(err) throw err;
        console.table(data);
        start();
      })
    })
  })
}