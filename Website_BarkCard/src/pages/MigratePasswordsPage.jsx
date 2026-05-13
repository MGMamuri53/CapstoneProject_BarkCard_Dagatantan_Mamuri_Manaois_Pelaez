import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { migratePasswordsToHash } from '../utils/migratePasswords';

export default function MigratePasswordsPage() {
  const [status, setStatus] = useState('idle'); // idle, running, completed, error
  const [result, setResult] = useState(null);
  const [autoRun, setAutoRun] = useState(true);

  useEffect(() => {
    // Auto-run migration on page load
    if (autoRun && status === 'idle') {
      runMigration();
    }
  }, []);

  const runMigration = async () => {
    try {
      setStatus('running');
      console.log('Starting password migration...');
      
      const migrationResult = await migratePasswordsToHash();
      
      setResult(migrationResult);
      setStatus(migrationResult.success ? 'completed' : 'error');
      
      console.log('Migration result:', migrationResult);
    } catch (err) {
      console.error('Migration failed:', err);
      setStatus('error');
      setResult({
        success: false,
        error: err.message,
        migrated: 0,
        total: 0
      });
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="card-header bg-primary text-white py-4">
          <h4 className="mb-0 fw-bold">Password Migration Utility</h4>
          <small className="text-white-50">Converts plain text passwords to bcrypt hashes</small>
        </div>

        <div className="card-body p-4">
          {status === 'idle' && (
            <div>
              <p className="text-muted mb-4">
                This utility will scan all passwords in <code>tbl_usercredentials</code> and hash any plain text passwords using bcrypt.
              </p>
              <button
                className="btn btn-primary btn-lg w-100"
                onClick={runMigration}
                disabled={status === 'running'}
              >
                {status === 'running' ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Running Migration...
                  </>
                ) : (
                  'Start Migration'
                )}
              </button>
            </div>
          )}

          {status === 'running' && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Hashing passwords... This may take a moment.</p>
            </div>
          )}

          {status === 'completed' && result && (
            <div>
              <div className="alert alert-success mb-4" role="alert">
                <h5 className="alert-heading fw-bold">✓ Migration Completed Successfully</h5>
                <hr />
                <div className="row g-3 mt-2">
                  <div className="col-sm-6">
                    <small className="d-block text-muted">Total Records</small>
                    <h4 className="fw-bold text-dark">{result.total}</h4>
                  </div>
                  <div className="col-sm-6">
                    <small className="d-block text-muted">Successfully Migrated</small>
                    <h4 className="fw-bold text-success">{result.migrated}</h4>
                  </div>
                  <div className="col-sm-6">
                    <small className="d-block text-muted">Already Hashed</small>
                    <h4 className="fw-bold text-info">{result.alreadyHashed}</h4>
                  </div>
                  <div className="col-sm-6">
                    <small className="d-block text-muted">Errors</small>
                    <h4 className="fw-bold text-danger">{result.errors?.length || 0}</h4>
                  </div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="alert alert-warning mb-4" role="alert">
                  <h6 className="alert-heading fw-bold">⚠ Errors Encountered:</h6>
                  <ul className="mb-0 small">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>
                        <strong>{err.uv_id}:</strong> {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="alert alert-info mb-4" role="alert">
                <small>
                  <strong>✓ You can now login!</strong> All passwords have been securely hashed. Try logging in with your credentials.
                </small>
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && result && (
            <div>
              <div className="alert alert-danger mb-4" role="alert">
                <h5 className="alert-heading fw-bold">✗ Migration Failed</h5>
                <hr />
                <p className="mb-0 small">{result.error || 'An unexpected error occurred'}</p>
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={runMigration}
              >
                Retry Migration
              </button>
            </div>
          )}
        </div>

        <div className="card-footer bg-light py-3 text-center">
          <small className="text-muted">
            This page can be deleted after migration is complete.
          </small>
        </div>
      </div>
    </div>
  );
}
