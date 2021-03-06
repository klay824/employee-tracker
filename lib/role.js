class Role {
    constructor(title, salary, department_id) {
        this.title = title;
        this.salary = salary;
        this.department_id = department_id;
    }

    getTitle() {
        return `${this.title}`;
    }

    getSalary() {
        return this.salary;
    }

    getDepartmentID() {
        return this.department_id;
    }

    getRoleTable() {
        return 'Role';
    }
}


module.exports = Role;