
import { User, Role, EmploymentType, Department } from '../types';

export const parseCSV = (csvData: string): Omit<User, 'user_id' | 'startDate'>[] => {
    const lines = csvData.trim().split('\n');
    const header = lines.shift()?.trim().split(',');
    if (!header) return [];

    const users: Omit<User, 'user_id' | 'startDate'>[] = [];

    lines.forEach(line => {
        const values = line.trim().split(',');
        const userObject: any = {};

        header.forEach((key, index) => {
            let value: any = values[index].replace(/"/g, '');
            if (key === 'departments') {
                value = value.split('|').map((d: string) => d.trim() as Department);
            }
            userObject[key] = value;
        });

        users.push({
            name: userObject.name,
            role: userObject.role as Role,
            employmentType: userObject.employmentType as EmploymentType,
            departments: userObject.departments,
            managerId: userObject.managerId,
        });
    });

    return users;
};
