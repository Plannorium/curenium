
"use client";
import React, { useState } from "react";
import PatientSearch from "@/app/(dashboard)/components/patients/PatientSearch";
import PatientDetail from "@/app/(dashboard)/components/patients/PatientDetail";
import PatientForm from "@/app/(dashboard)/components/patients/PatientForm";
import { Button } from "@/components/ui/button";

const PatientsPage = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateNew = () => {
    setShowAddForm(true);
    setSelectedPatient(null);
  };

  const handleSubmit = (data: any) => {
    console.log(data);
    setShowAddForm(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add Patient"}
        </Button>
      </div>

      {showAddForm ? (
        <PatientForm onSubmit={handleSubmit} />
      ) : (
        <>
          <PatientSearch onSelectPatient={setSelectedPatient} onCreateNew={handleCreateNew} />
          {selectedPatient && <PatientDetail patient={selectedPatient} />}
        </>
      )}
    </div>
  );
};

export default PatientsPage;