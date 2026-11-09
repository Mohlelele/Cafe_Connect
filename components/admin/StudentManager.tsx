'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { createStudent, resetStudentPassword } from '@/app/actions';
import { EmptyState, useActionRunner } from '@/components/ui';
import type { Student } from '@/lib/types';

const emptyStudent = { name: '', email: '', password: '' };
const emptyReset = { studentId: '', password: '' };

export default function StudentManager({ students, toolsReady }: { students: Student[]; toolsReady: boolean }) {
  const { run, pending } = useActionRunner();
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [resetForm, setResetForm] = useState(emptyReset);
  const disabled = pending || !toolsReady;

  const handleStudentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setStudentForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    run(() => createStudent(studentForm), () => setStudentForm(emptyStudent));
  };

  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    run(() => resetStudentPassword(resetForm.studentId, resetForm.password), () => setResetForm(emptyReset));
  };

  return (
    <div className="split-layout">
      {students.length === 0 ? (
        <EmptyState title="No students yet"><p>Students appear here once they register.</p></EmptyState>
      ) : (
        <div className="panel table-scroll">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th></tr></thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}><td><strong>{student.fullName}</strong></td><td>{student.email}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="side-stack">
        {toolsReady ? null : (
          <p className="form-error">Account tools are off until SUPABASE_SERVICE_ROLE_KEY is set on the server.</p>
        )}

        <form className="panel form side-form" onSubmit={handleCreate}>
          <h2>Create a student account</h2>
          <label className="field">
            <span>Full name</span>
            <input type="text" name="name" maxLength={100} value={studentForm.name} onChange={handleStudentChange} autoComplete="off" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" value={studentForm.email} onChange={handleStudentChange} autoComplete="off" required />
          </label>
          <label className="field">
            <span>Temporary password</span>
            <input type="text" name="password" minLength={8} value={studentForm.password} onChange={handleStudentChange} autoComplete="off" required />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={disabled}>Create account</button>
        </form>

        <form className="panel form side-form" onSubmit={handleReset}>
          <h2>Reset a password</h2>
          <label className="field">
            <span>Student</span>
            <select value={resetForm.studentId} onChange={(event) => setResetForm((current) => ({ ...current, studentId: event.target.value }))} required>
              <option value="">Select a student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.fullName} ({student.email})</option>)}
            </select>
          </label>
          <label className="field">
            <span>New password</span>
            <input type="text" minLength={8} value={resetForm.password} onChange={(event) => setResetForm((current) => ({ ...current, password: event.target.value }))} autoComplete="off" required />
          </label>
          <button type="submit" className="btn btn-secondary btn-block" disabled={disabled}>Update password</button>
        </form>
      </div>
    </div>
  );
}
