import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginInput = z.infer<typeof loginSchema>;

export function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      setError('Invalid credentials or admin bootstrap is not configured.');
      return;
    }
    setAuthenticated(true);
    navigate('/admin');
  };

  if (authenticated) return <Navigate to="/admin" replace />;

  return (
    <main className="admin-login">
      <section className="admin-login__panel">
        <div className="brand brand--large"><span className="brand__mark">SM</span><strong>{t('admin.loginTitle')}</strong></div>
        <p>{t('admin.loginSubtitle')}</p>
        <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label>{t('admin.email')}<input type="email" autoComplete="email" {...register('email')} /></label>
          <label>{t('admin.password')}<input type="password" autoComplete="current-password" {...register('password')} /></label>
          <button className="primary-button" type="submit" disabled={formState.isSubmitting}>{t('admin.signIn')}</button>
          {error ? <p className="form-status form-status--error">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
