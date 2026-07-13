import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { SiteSettings } from '../../types/cms';
import { formatPhone } from '../../utils/localize';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(3000),
  _website: z.string().optional(),
});

type ContactInput = z.infer<typeof schema>;

type Props = { settings: SiteSettings };

export function ContactForm({ settings }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { register, handleSubmit, reset, formState } = useForm<ContactInput>({ resolver: zodResolver(schema), defaultValues: { _website: '' } });

  const onSubmit = async (values: ContactInput) => {
    setStatus('idle');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Send failed');
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="contact-grid">
      <div className="contact-card">
        <p>{t('contact.intro')}</p>
        <dl className="contact-list">
          <div><dt>{t('labels.email')}</dt><dd><a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a></dd></div>
          <div><dt>{t('labels.phone')}</dt><dd>{settings.contact.phones.map((phone) => <a key={phone} href={`tel:${formatPhone(phone)}`}>{phone}</a>)}</dd></div>
          <div><dt>{t('labels.github')}</dt><dd><a href={settings.contact.githubUrl} target="_blank" rel="noreferrer">{settings.contact.githubUrl}</a></dd></div>
        </dl>
      </div>
      <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="text" tabIndex={-1} autoComplete="off" className="honeypot" {...register('_website')} aria-hidden="true" />
        <label>
          {t('contact.name')}
          <input aria-invalid={Boolean(formState.errors.name)} {...register('name')} />
          {formState.errors.name ? <span className="field-error">{formState.errors.name.message}</span> : null}
        </label>
        <label>
          {t('labels.email')}
          <input type="email" aria-invalid={Boolean(formState.errors.email)} {...register('email')} />
          {formState.errors.email ? <span className="field-error">{formState.errors.email.message}</span> : null}
        </label>
        <label>
          {t('contact.subject')}
          <input aria-invalid={Boolean(formState.errors.subject)} {...register('subject')} />
          {formState.errors.subject ? <span className="field-error">{formState.errors.subject.message}</span> : null}
        </label>
        <label>
          {t('contact.message')}
          <textarea rows={6} aria-invalid={Boolean(formState.errors.message)} {...register('message')} />
          {formState.errors.message ? <span className="field-error">{formState.errors.message.message}</span> : null}
        </label>
        <p className="privacy-note">{t('contact.privacy')}</p>
        <button className="primary-button" type="submit" disabled={formState.isSubmitting}>{formState.isSubmitting ? t('actions.sending') : t('actions.send')}</button>
        {status === 'success' ? <p className="form-status form-status--success">{t('contact.success')}</p> : null}
        {status === 'error' ? <p className="form-status form-status--error">{t('contact.error')}</p> : null}
      </form>
    </div>
  );
}
