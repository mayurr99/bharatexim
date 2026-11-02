/* Bharat Exim Traders — enquiry form submission (no page reload).
   Posts to api/enquiry.php and shows a success message or field errors.
   The form still works without JavaScript (it posts and redirects). */
(() => {
  const form = document.getElementById('enquiry');
  if (!form || form.dataset.api !== 'true') return;

  const successBox = document.getElementById('enquiry-success');
  const successText = document.getElementById('enquiry-success-text');
  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const startedField = document.getElementById('form-started');
  const FALLBACK = 'We could not send your enquiry just now. Please call +91 91302 16056 or email bharateximtraders@gmail.com.';

  const stampStart = () => { if (startedField) startedField.value = String(Math.floor(Date.now() / 1000)); };
  stampStart();

  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.dataset.type = type || '';
  };

  const clearErrors = () => {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  };

  const fieldError = (name, msg) => {
    const el = form.elements[name];
    if (!el) return;
    el.setAttribute('aria-invalid', 'true');
    const span = document.createElement('span');
    span.className = 'field-error';
    span.textContent = msg;
    el.parentElement.appendChild(span);
  };

  const showSuccess = (msg) => {
    successText.textContent = msg;
    form.hidden = true;
    successBox.hidden = false;
    successBox.focus({ preventScroll: true });
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const resetToForm = () => {
    successBox.hidden = true;
    form.hidden = false;
    form.reset();
    stampStart();
    setStatus('');
    form.querySelector('input, select, textarea')?.focus();
  };

  // Restore state after the non-JavaScript redirect (contact.html?sent=1)
  if (new URLSearchParams(location.search).get('sent') === '1') {
    showSuccess('Thank you. Your enquiry has been sent. We will reply to your email soon.');
    history.replaceState(null, '', location.pathname);
  }

  document.getElementById('enquiry-another')?.addEventListener('click', resetToForm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    setStatus('');

    // Quick client-side required check (server validates again)
    let hasError = false;
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim()) {
        hasError = true;
        fieldError(input.name, input.tagName === 'SELECT' ? 'Please choose an option.' : 'This field is required.');
      }
    });
    if (hasError) {
      setStatus('Please check the required fields highlighted above.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    setStatus('Sending your enquiry…', 'info');

    try {
      const res = await fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        showSuccess(data.message);
      } else if (res.status === 422) {
        Object.entries(data.errors || {}).forEach(([k, v]) => fieldError(k, v));
        setStatus(data.message || 'Please correct the highlighted fields.', 'error');
      } else {
        setStatus(data.message || FALLBACK, 'error');
      }
    } catch (err) {
      setStatus(FALLBACK, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
    }
  });
})();
