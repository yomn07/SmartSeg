import React from "react";
import SidebarAdmin from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import "./admin.css";

const Reclamations = () => {

  const reclamations = [
    {
      id: 1,
      email: "user1@test.com",
      message: "I cannot upload scans, error appears.",
    },
    {
      id: 2,
      email: "user2@test.com",
      message: "Dashboard is not loading properly.",
    },
    {
      id: 3,
      email: "doctor@test.com",
      message: "Segmentation result not displayed.",
    },
  ];

  return (
    <div className="dashboard">

      <SidebarAdmin />

      <div className="content">

        <HeaderAdmin adminName="Admin" />

        <h2 className="page-title">Reclamations</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Message</th>
              </tr>
            </thead>

            <tbody>
              {reclamations.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td>{r.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Reclamations;