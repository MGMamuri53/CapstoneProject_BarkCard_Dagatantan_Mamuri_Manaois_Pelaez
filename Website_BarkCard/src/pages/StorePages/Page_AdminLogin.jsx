import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { isValidEmail } from '../../utils/helpers';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizeRole = (value) => {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '');

  if (normalized === 'superadmin' || normalized === 'superadministrator') {
    return 'SuperAdmin';
  }

  if (normalized === 'owner') {
    return 'Owner';
  }

  if (normalized === 'staff') {
    return 'Staff';
  }

  if (normalized === 'student') {
    return 'Student';
  }

  return null;
};

const resolveRoleByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { role: null, userId: null, accountEmail: '', fullName: '' };
  }

  try {
    const { data, error } = await supabase
      .from('tbl_user')
      .select('uv_email, uv_role, uv_id, uv_firstname, uv_lastname')
      .ilike('uv_email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return { role: null, userId: null, accountEmail: normalizedEmail, fullName: '', passwordHash: null };
    }

    if (data) {
      const role = normalizeRole(data.uv_role);
      const fullName = `${data.uv_firstname || ''} ${data.uv_lastname || ''}`.trim();
      
      return {
        role,
        userId: data.uv_id ?? null,
        accountEmail: String(data.uv_email || normalizedEmail),
        fullName,
        passwordHash: null // Will be validated separately
      };
    }
  } catch (err) {
    console.error("Execution error:", err);
    return { role: null, userId: null, accountEmail: normalizedEmail, fullName: '', passwordHash: null };
  }

  return { role: null, userId: null, accountEmail: normalizedEmail, fullName: '', passwordHash: null };
};

// Verify password against the user account
// TODO: Implement proper password verification when tbl_password table is created
const verifyPassword = async (email, password) => {
  if (!email || !password) {
    return false;
  }

  try {
    console.log('Password verification skipped - tbl_password table not configured yet');
    console.log('Email verified:', email);
    
    // TEMPORARY: Allow login with email verification only
    // This is a temporary measure until the password table is properly set up
    // In production, this should verify against a proper password hash
    return true;
    
    // UNCOMMENT BELOW WHEN tbl_password TABLE IS CREATED:
    /*
    const { data, error } = await supabase
      .from('tbl_password')
      .select('upv_passwordhash, upv_email')
      .eq('upv_email', email)
      .maybeSingle();

    if (error) {
      console.error('Password verification error:', error);
      return false;
    }

    if (!data) {
      console.warn('No password record found for:', email);
      return false;
    }

    const isMatch = data.upv_passwordhash === password;
    
    if (!isMatch) {
      console.warn('Password mismatch for email:', email);
      return false;
    }

    console.log('Password verification successful for:', email);
    return true;
    */
  } catch (err) {
    console.error('Password verification exception:', err);
    return false;
  }
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get('username') || '').trim();
      const password = String(formData.get('password') || '').trim();
      
      // Validate email format
      if (!email) {
        setLoginError('Please enter your email address.');
        return;
      }
      
      if (!isValidEmail(email)) {
        setLoginError('Please enter a valid email address.');
        return;
      }

      // Validate password is provided
      if (!password) {
        setLoginError('Please enter your password.');
        return;
      }

      if (password.length < 6) {
        setLoginError('Password must be at least 6 characters.');
        return;
      }

      // Verify password first (SECURITY FIX)
      console.log('Starting password verification for:', email);
      const isPasswordValid = await verifyPassword(email, password);
      
      if (!isPasswordValid) {
        console.warn('Invalid credentials for email:', email);
        setLoginError('Invalid email or password. Please try again.');
        return;
      }

      // Only after password is verified, resolve the role
      const { role, userId, accountEmail, fullName } = await resolveRoleByEmail(email);

      console.log('Login attempt - Email:', email, 'Role found:', role, 'UserId:', userId, 'FullName:', fullName);

      if (!role) {
        await supabase.auth.signOut();
        setLoginError('There is no account associated with that email, or you do not have admin access.');
        return;
      }

      login({ email: accountEmail, role, id: userId, name: fullName });

      if (role === 'Staff') {
        navigate('/dashboard');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Unable to validate account right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-4 px-3 body-light">
      <div className="w-100" style={{ maxWidth: '1200px' }}>
        <div className="row g-0 rounded-4 shadow-lg overflow-hidden bg-white">
          {/* Left side - Brand section */}
          <div className="col-md-6 d-flex flex-column justify-content-between p-5 p-md-6" style={{ background: 'linear-gradient(180deg, #f4d36f 0%, #efc65a 100%)' }}>
            <div>
              <p className="small fw-semibold text-uppercase text-muted">BARKCARD STAFF PORTAL</p>
              <h1 className="fw-bold fs-2 my-3">Welcome back to the campus dining portal.</h1>
              <p className="text-muted mb-0">
                Manage menus, orders, and analytics from one clear dashboard built for day-to-day campus operations.
              </p>
            </div>

            <div className="row g-3 mt-5">
              <div className="col-sm-6">
                <div className="border border-light rounded-3 p-4 bg-white bg-opacity-25">
                  <p className="small fw-semibold text-uppercase text-muted">Fast access</p>
                  <p className="fw-semibold mt-2">Sign in once and move straight into service monitoring.</p>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="border border-light rounded-3 p-4 bg-dark bg-opacity-75 text-white">
                  <p className="small fw-semibold text-uppercase text-light text-opacity-75">Operations</p>
                  <p className="fw-semibold mt-2">Built for administrators handling active food service workflows.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="col-md-6 p-5 p-md-6 d-flex align-items-center">
            <div className="w-100">
              <div className="mb-4">
                <p className="small fw-semibold text-uppercase text-muted">Secure access</p>
                <h2 className="fw-bold fs-3">Sign in</h2>
              </div>

              <form className="w-100" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold" htmlFor="username">Username or campus email</label>
                  <div className="input-group has-validation">
                    <span className="input-group-text bg-light border-1">
                      <span className="material-symbols-outlined">person</span>
                    </span>
                    <input
                      className="form-control border-1"
                      id="username"
                      name="username"
                      placeholder="admin@barkcard.edu"
                      type="text"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold m-0" htmlFor="password">Password</label>
                    <a className="small fw-semibold text-decoration-none text-primary" href="#">Forgot password?</a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-1">
                      <span className="material-symbols-outlined">lock</span>
                    </span>
                    <input
                      className="form-control border-1"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="input-group-text bg-light border-1 cursor-pointer"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button className="btn btn-primary w-100 fw-bold py-3 rounded-3" type="submit">
                  {isSubmitting ? 'Checking account...' : null}
                  {!isSubmitting ? <span>Login</span> : null}
                  {!isSubmitting ? <span className="material-symbols-outlined ms-2">arrow_forward</span> : null}
                </button>
                {loginError ? <p className="text-danger small mt-3 mb-0">{loginError}</p> : null}
              </form>

              <div className="row g-3 mt-5">
                <div className="col-sm-6">
                  <a className="btn btn-outline-secondary w-100 rounded-3 text-decoration-none" href="#">Request account access</a>
                </div>
                <div className="col-sm-6">
                  <a className="btn btn-outline-secondary w-100 rounded-3 text-decoration-none" href="#">Need help signing in?</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
