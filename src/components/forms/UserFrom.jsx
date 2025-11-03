import React, { useState, useEffect } from "react";
import Button from "../ui/Button";

const UserForm = ({ user, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    contactNumber: "",
    specialization: "Cybersecurity",
    sem: "",
    erpNumber: "",
    collegeName: "PIET",
    expertiseLevel: "Beginner",
    role: "student",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        password: "",
        contactNumber: user.contactNumber || "",
        specialization: user.specialization || "Cybersecurity",
        sem: user.sem || "",
        erpNumber: user.erpNumber || "",
        collegeName: user.collegeName || "PIET",
        expertiseLevel: user.expertiseLevel || "Beginner",
        role: user.role || "student",
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Remove password if empty during edit
    if (user && !submitData.password) {
      delete submitData.password;
    }
    
    // Remove student-specific fields if role is admin
    if (submitData.role === 'admin') {
      delete submitData.sem;
      delete submitData.erpNumber;
      delete submitData.collegeName;
      delete submitData.specialization;
    }
    
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ERP Number validation - only numbers
    if (name === "erpNumber") {
      if (value === "" || /^\d+$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    // Contact Number validation - only numbers
    if (name === "contactNumber") {
      if (value === "" || /^\d+$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    // If role changes to admin, clear student-specific fields
    if (name === "role" && value === "admin") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        sem: "",
        erpNumber: "",
        collegeName: "",
        specialization: "",
      }));
    } else if (name === "role" && value === "student") {
      // If changing back to student, set default values
      setFormData((prev) => ({
        ...prev,
        role: value,
        collegeName: "PIET",
        specialization: "Cybersecurity",
        sem: "",
        erpNumber: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const specializations = [
    "Cybersecurity",
    "Artificial Intelligence",
    "Others",
  ];

  const semesters = ["3", "4", "5", "6", "7"];
  const collegeNames = ["PIET", "PIT", "Other"];
  const expertiseLevels = [
    "Beginner",
    "Junior",
    "Intermediate",
    "Senior",
    "Expert",
  ];

  const isStudent = formData.role === 'student';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password {user && "(leave blank to keep current)"} *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!user}
            minLength="8"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {!user && (
            <p className="mt-1 text-xs text-gray-500">
              8+ characters with uppercase, lowercase, number & special character
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            pattern="[0-9]*"
            inputMode="numeric"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expertise Level
          </label>
          <select
            name="expertiseLevel"
            value={formData.expertiseLevel}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {expertiseLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Student-specific fields - only show for student role */}
        {isStudent && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ERP Number *
              </label>
              <input
                type="text"
                name="erpNumber"
                value={formData.erpNumber}
                onChange={handleChange}
                required={isStudent}
                pattern="[0-9]*"
                inputMode="numeric"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                College *
              </label>
              <select
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                required={isStudent}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {collegeNames.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Semester *
              </label>
              <select
                name="sem"
                value={formData.sem}
                onChange={handleChange}
                required={isStudent}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specialization *
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required={isStudent}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important Note
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                {isStudent 
                  ? "Only @paruluniversity.ac.in email addresses are allowed for registration. ERP Number must contain only numbers and is required."
                  : "Admin accounts have full access to the platform management features."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {user ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;