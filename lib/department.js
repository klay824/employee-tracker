class Department {
    constructor(name) {
        this.name = name;
    }

    getName() {
        return `${this.name}`;
    }

    getDepartmentTable() {
        return 'Department';
    }

}

module.exports = Department;