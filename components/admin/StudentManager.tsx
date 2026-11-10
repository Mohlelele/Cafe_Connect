'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { createStudent, resetStudentPassword } from '@/app/actions';
import { SearchIcon, StudentIcon } from '@/components/Icons';
import { EmptyState, PasswordField, useActionRunner } from '@/components/ui';
import type { Student } from '@/lib/types';

const emptyStudent = { name: '', email: '', password: '' };
const emptyReset = { studentId: '', password: '' };
const PAGE_SIZE = 15;

export default function StudentManager({ students, toolsReady }: { students: Student[]; toolsReady: boolean }) {
  const { run, pending } = useActionRunner();
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [resetForm, setResetForm] = useState(emptyReset);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const disabled = pending || !toolsReady;

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? students.filter((student) => `${student.fullName} ${student.email}`.toLowerCase().includes(term)) : students;
  }, [students, search]);

  const lastPage = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const pageOfStudents = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
      <div className="stack">
        <div className="table-tools">
          <label className="search-field">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search students"
              aria-label="Search students by name or email"
            />
          </label>
          <span className="section-title">{matches.length} {matches.length === 1 ? 'student' : 'students'}</span>
        </div>

        {matches.length === 0 ? (
          <EmptyState title={students.length ? 'No students match your search' : 'No students yet'} icon={<StudentIcon />}>
            {students.length ? null : <p>Students appear here once they register.</p>}
          </EmptyState>
        ) : (
          <div className="panel table-scroll">
            <table className="data-table card-table">
              <thead><tr><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {pageOfStudents.map((student) => (
                  <tr key={student.id}>
                    <td data-label="Name"><strong>{student.fullName}</strong></td>
                    <td data-label="Email">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lastPage > 1 ? (
          <div className="pagination">
            <span>Page {currentPage} of {lastPage}</span>
            <div className="pagination-links">
              <button type="button" className="btn btn-secondary btn-sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)}>Next</button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="side-stack">
        {toolsReady ? null : (
          <p className="form-error">Account tools are off because the server is missing its Supabase service key.</p>
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
          <PasswordField label="Temporary password" name="password" minLength={8} value={studentForm.password} onChange={handleStudentChange} autoComplete="new-password" hint="At least 8 characters." />
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
          <PasswordField label="New password" name="newPassword" minLength={8} value={resetForm.password} onChange={(event) => setResetForm((current) => ({ ...current, password: event.target.value }))} autoComplete="new-password" hint="At least 8 characters." />
          <button type="submit" className="btn btn-secondary btn-block" disabled={disabled}>Update password</button>
        </form>
      </div>
    </div>
  );
}
