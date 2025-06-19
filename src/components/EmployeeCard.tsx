import React, { useEffect, useState } from 'react';
import './EmployeeCard.css';
import { fetchEmployee } from '../api/Api';
import { Smartphone, Tablet, Laptop, Monitor } from 'lucide-react';

export interface Device {
  id: string;
  type: 'mobile' | 'laptop' | 'tablet' | 'desktop';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  organization: string;
  devices: Device[];
}


const EmployeeCard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      // const data = await fetchEmployee();
      const data: Employee[] = [
        {
          "id": "1985e0e4-a89c-45c2-add8-649d7910ce4f",
          "name": "mukul",
          "email": "mukul@noviro.com",
          "position": "Project Manager",
          "department": "Management",
          "organization": "",
          "devices": [
            // { "id": "dev-001", "type": "laptop" },
            { "id": "dev-002", "type": "mobile" }
          ]
        },
        {
          "id": "5701ea3a-3d3a-4fd0-ac59-65e5243355f0",
          "name": "pradeep",
          "email": "pradeep@noviro.com",
          "position": "Software Engineer",
          "department": "Development",
          "organization": "",
          "devices": [
            // { "id": "dev-003", "type": "laptop" },
            { "id": "dev-004", "type": "desktop" }
          ]
        },
        {
          "id": "8802ab3b-d63a-41c3-965d-63921485679c",
          "name": "anand",
          "email": "anand@noviro.com",
          "position": "Software Engineer",
          "department": "Development",
          "organization": "",
          "devices": [
            // { "id": "dev-005", "type": "laptop" },
            { "id": "dev-006", "type": "tablet" }
          ]
        },
        {
          "id": "8dc19598-5733-45d7-9d55-cc63c8a37006",
          "name": "pavan",
          "email": "pavan@noviro.com",
          "position": "Principal Engineer",
          "department": "Development",
          "organization": "",
          "devices": [
            { "id": "dev-007", "type": "laptop" },
            // { "id": "dev-008", "type": "mobile" },
            // { "id": "dev-009", "type": "tablet" }
          ]
        },
        {
          "id": "beb7472d-da59-490f-9444-6f8ecb2b78cc",
          "name": "mahesh",
          "email": "mahesh@noviro.com",
          "position": "Human Resources",
          "department": "Management",
          "organization": "",
          "devices": [
            { "id": "dev-010", "type": "desktop" }
          ]
        }
      ]

      console.log("DATA", data);
      setEmployees(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async () => {
    console.log("Add Employee");
  }

  return (
    <div className="employee-card">
      <div className="employee-card-heading">
        <h2>Employees</h2>
        <button onClick={handleAddEmployee} className="Btn">Add Employee</button>
      </div>

      {loading ? (
        <p className="employee-message">Loading...</p>
      ) : error ? (
        <p className="employee-error">Error: {error}</p>
      ) : employees.length === 0 ? (
        <p className="employee-message">No employees found.</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Department</th>
              <th>Devices</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id.slice(0, 8)}</td>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.position}</td>
                <td>{emp.department}</td>
                <td>
                  {emp.devices?.map((device, index) => {
                    const iconProps = { key: index, className: "device-icon" };
                    return (
                      <div key={device.id}>
                        {device.id}{' '}
                        {device.type === 'mobile' && <Smartphone {...iconProps} />}
                        {device.type === 'laptop' && <Laptop {...iconProps} />}
                        {device.type === 'tablet' && <Tablet {...iconProps} />}
                        {device.type === 'desktop' && <Monitor {...iconProps} />}
                      </div>
                    );
                  })}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      )}
    </div>
  );
};

export default EmployeeCard;
