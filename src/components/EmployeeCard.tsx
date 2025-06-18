import React, { useEffect, useState } from 'react';
import './EmployeeCard.css'; 
import { fetchEmployee } from '../api/Api'; 


export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
}

const EmployeeCard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployee();
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

  return (
    <div className="employee-card">
      <h2>Employees</h2>

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
              <th>Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.position}</td>
                <td>{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeCard;
