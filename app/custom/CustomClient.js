'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomClient() {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileUploadAreaRef = useRef(null);
  const filePreviewRef = useRef(null);
  const customSizeRowRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formStatus, setFormStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sizeRadios = document.querySelectorAll('input[name="size"]');
    const customSizeRow = customSizeRowRef.current;
    if (!customSizeRow) return;

    function handleChange(e) {
      const radio = e.target;
      customSizeRow.style.display = radio.value === 'custom' && radio.checked ? 'block' : 'none';
    }

    sizeRadios.forEach(radio => radio.addEventListener('change', handleChange));
    return () => sizeRadios.forEach(radio => radio.removeEventListener('change', handleChange));
  }, []);

  useEffect(() => {
    const area = fileUploadAreaRef.current;
    const input = fileInputRef.current;
    if (!area || !input) return;

    function handleClick() { input.click(); }
    function handleDragOver(e) { e.preventDefault(); area.style.borderColor = 'var(--bronze)'; }
    function handleDragLeave() { area.style.borderColor = ''; }
    function handleDrop(e) {
      e.preventDefault();
      area.style.borderColor = '';
      handleFiles(e.dataTransfer.files);
    }

    area.addEventListener('click', handleClick);
    area.addEventListener('dragover', handleDragOver);
    area.addEventListener('dragleave', handleDragLeave);
    area.addEventListener('drop', handleDrop);
    input.addEventListener('change', () => handleFiles(input.files));

    return () => {
      area.removeEventListener('click', handleClick);
      area.removeEventListener('dragover', handleDragOver);
      area.removeEventListener('dragleave', handleDragLeave);
      area.removeEventListener('drop', handleDrop);
      input.removeEventListener('change', () => handleFiles(input.files));
    };
  }, []);

  useEffect(() => {
    const preview = filePreviewRef.current;
    if (!preview) return;
    preview.innerHTML = '';
    uploadedFiles.forEach((file, i) => {
      const item = document.createElement('div');
      item.className = 'file-preview-item';
      item.innerHTML = `<span>${file.name}</span><button type="button" class="remove-file" data-index="${i}">Remove</button>`;
      preview.appendChild(item);
    });
    preview.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', () => {
        setUploadedFiles(prev => prev.filter((_, idx) => idx !== parseInt(btn.dataset.index)));
      });
    });
  }, [uploadedFiles]);

  useEffect(() => {
    if (formErrors.details && uploadedFiles.length > 0) {
      setFormErrors(prev => { const { details, ...rest } = prev; return rest; });
    }
  }, [uploadedFiles, formErrors.details]);

  function handleSubmit(e) {
    e.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const details = form.elements.details.value.trim();
    const hasFiles = uploadedFiles.length > 0;
    const errors = {};

    if (!name) errors.name = 'Name is required.';
    if (!email) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
    if (!details && !hasFiles) errors.details = 'Please describe your idea or upload a reference image.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setFormStatus('submitted');
    form.reset();
    setUploadedFiles([]);
  }

  function handleFiles(files) {
    const newFiles = [];
    const errors = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        errors.push(file.name + ' exceeds 10 MB limit.');
        continue;
      }
      newFiles.push(file);
    }
    if (errors.length > 0) {
      setFormErrors(prev => ({ ...prev, file: errors.join(' ') }));
    } else {
      setFormErrors(prev => { const { file, ...rest } = prev; return rest; });
    }
    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0 && formErrors.details) {
      setFormErrors(prev => { const { details, ...rest } = prev; return rest; });
    }
  }

  return (
    <>
      <style>{`
        .custom-section {
          background: var(--bg-primary);
          padding: var(--space-lg) 0 6rem;
        }
        .custom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .custom-form {
          background: var(--bg-secondary);
          padding: 1.75rem;
        }
        .form-row { margin-bottom: 1.15rem; }
        .form-row label {
          display: block;
          font-size: var(--text-caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        .form-row input,
        .form-row select,
        .form-row textarea {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--stone);
          padding: 0.55rem 0.25rem;
          font-family: var(--font-body);
          font-size: var(--text-body);
          color: var(--text-primary);
          transition: border-color var(--dur-fast) var(--ease);
        }
        .form-row textarea { resize: vertical; min-height: 80px; }
        .form-row input:focus,
        .form-row select:focus,
        .form-row textarea:focus {
          outline: none;
          border-color: var(--bronze);
        }
        .form-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; }
        .form-submit { margin-top: 0.5rem; }
        .form-submit:active { transform: scale(0.97); }
        .form-submit:focus-visible { outline: 2px solid var(--bronze); outline-offset: 3px; }
        .form-status {
          font-size: var(--text-caption);
          color: var(--forest);
          margin-top: 0.5rem;
          min-height: 1.2em;
          opacity: 0;
          transition: opacity var(--dur-fast) var(--ease);
        }
        .form-status.is-visible { opacity: 1; }
        .form-error {
          display: block;
          font-size: var(--text-caption);
          color: #b54a4a;
          margin-top: 0.3rem;
          letter-spacing: 0.02em;
        }
        .form-note {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          text-align: center;
          margin-top: 0.75rem;
          opacity: 0.7;
        }
        .form-success {
          background: var(--bg-secondary);
          padding: 1.25rem;
          border-left: 3px solid var(--bronze);
          margin-top: 0.5rem;
        }
        .form-success p { margin-bottom: 0.5rem; font-size: var(--text-body); color: var(--text-secondary); line-height: var(--lh-relaxed); }
        .form-success p:last-child { margin-bottom: 0; }
        .form-success strong { color: var(--text-primary); }

        .radio-group { display: flex; flex-wrap: wrap; gap: 1.15rem; margin-top: 0.4rem; }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: var(--text-body);
          color: var(--text-primary);
          line-height: var(--lh-relaxed);
        }
        .radio-label input[type="radio"] {
          width: auto;
          accent-color: var(--bronze);
        }

        .file-upload-area {
          border: 1px dashed var(--stone);
          padding: 1.25rem;
          text-align: center;
          cursor: pointer;
          transition: border-color var(--dur-fast) var(--ease);
          margin-top: 0.4rem;
        }
        .file-upload-area:hover { border-color: var(--bronze); }
        .file-upload-area input[type="file"] { display: none; }
        .file-upload-area p {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          margin: 0;
        }
        .file-upload-area .browse-link {
          color: var(--bronze);
          cursor: pointer;
          text-decoration: underline;
        }
        .file-upload-hint {
          font-size: var(--text-caption);
          color: var(--text-secondary);
          margin-top: 0.4rem;
        }
        .file-preview { margin-top: 0.5rem; }
        .file-preview-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0;
          border-bottom: var(--border-hair);
          font-size: var(--text-caption);
          color: var(--text-secondary);
        }
        .file-preview-item .remove-file {
          margin-left: auto;
          color: var(--text-secondary);
          cursor: pointer;
          background: none;
          border: none;
          font-size: var(--text-caption);
          text-decoration: underline;
        }

        .custom-text p { color: var(--text-secondary); margin-bottom: var(--space-sm); line-height: var(--lh-relaxed); }
        .custom-list { border-top: var(--border-hair); margin-top: var(--space-md); }
        .custom-list-item {
          padding: 0.65rem 0;
          border-bottom: var(--border-hair);
          font-size: var(--text-body);
          color: var(--text-secondary);
          line-height: var(--lh-relaxed);
        }
        .custom-list-item strong { color: var(--text-primary); font-weight: 500; }

        @media (max-width: 860px) {
          .custom-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .form-two-col { grid-template-columns: 1fr; }
          .form-row input, .form-row select, .form-row textarea { min-height: 44px; font-size: var(--text-body); line-height: var(--lh-relaxed); }
          .custom-form { padding: 1.25rem; }
        }
      `}</style>

      <section className="page-hero">
        <img src="https://images.pexels.com/photos/5974327/pexels-photo-5974327.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="A craftsman hand-shaping a wooden surface in the workshop." />
        <div className="page-hero-content">
          <span className="eyebrow eyebrow-light">Custom Orders</span>
          <h1>Custom Wooden Creations</h1>
          <p>Have a unique idea? Upload a reference image or describe your vision. Our artisans will review your request and get back to you with feasibility, pricing, and estimated completion time.</p>
        </div>
      </section>

      <section className="custom-section">
        <div className="container custom-grid">
          <div className="custom-text">
            <span className="eyebrow reveal">How It Works</span>
            <h2 className="reveal" style={{ fontSize: 'clamp(1.5rem, 2.6vw, var(--text-h2))', margin: '0.5rem 0 var(--space-sm)', maxWidth: 'none' }}>Every piece starts with a conversation.</h2>
            <p className="reveal">Tell us what you have in mind — whether it&apos;s a sculpture, a piece of furniture, a religious idol, a nameplate, or a gift item. You don&apos;t need perfect dimensions or technical drawings. A photo, a sketch, or a few sentences is enough to start.</p>
            <p className="reveal">Our artisans will review your idea and respond with what&apos;s possible, what wood and finish would work best, and a realistic price and timeline.</p>

            <div className="custom-list reveal">
              <div className="custom-list-item"><strong>Architects</strong> — custom wooden elements for residential and commercial projects.</div>
              <div className="custom-list-item"><strong>Interior Designers</strong> — handcrafted furniture, fixtures, and decorative pieces for client spaces.</div>
              <div className="custom-list-item"><strong>Homeowners</strong> — personalised nameplates, gift items, and statement pieces for your home.</div>
              <div className="custom-list-item"><strong>Art Collectors</strong> — hand-carved sculptures, wall art, and limited-edition works.</div>
              <div className="custom-list-item"><strong>Hospitality &amp; Retail</strong> — custom furniture, signage, and fit-outs for hotels, cafés, and stores.</div>
              <div className="custom-list-item"><strong>Corporate Gifting</strong> — branded wooden gifts and keepsakes for clients and employees.</div>
            </div>
          </div>

          <form ref={formRef} className="custom-form reveal" id="customForm" noValidate onSubmit={handleSubmit}>
            <div className="form-two-col">
              <div className="form-row">
                <label htmlFor="customName">Name</label>
                <input type="text" id="customName" name="name" required aria-describedby={formErrors.name ? 'err-name' : undefined} />
                {formErrors.name && <span className="form-error" id="err-name">{formErrors.name}</span>}
              </div>
              <div className="form-row">
                <label htmlFor="customEmail">Email</label>
                <input type="email" id="customEmail" name="email" required aria-describedby={formErrors.email ? 'err-email' : undefined} />
                {formErrors.email && <span className="form-error" id="err-email">{formErrors.email}</span>}
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="customPhone">Phone Number</label>
              <input type="tel" id="customPhone" name="phone" />
            </div>
            <div className="form-row">
              <label>Approximate Size</label>
              <div className="radio-group">
                <label className="radio-label"><input type="radio" name="size" value="small" /> Small</label>
                <label className="radio-label"><input type="radio" name="size" value="medium" /> Medium</label>
                <label className="radio-label"><input type="radio" name="size" value="large" /> Large</label>
                <label className="radio-label"><input type="radio" name="size" value="custom" /> Custom</label>
              </div>
            </div>
            <div ref={customSizeRowRef} className="form-row" id="customSizeRow" style={{ display: 'none' }}>
              <label htmlFor="customSize">Specify Dimensions</label>
              <input type="text" id="customSize" name="custom_size" placeholder="e.g. 2 feet tall, 18 inches wide" />
            </div>
            <div className="form-row">
              <label htmlFor="customDetails">Describe your idea <span style={{textTransform:'none',letterSpacing:'normal',fontWeight:'normal',opacity:0.7}}>(optional if uploading a reference)</span></label>
              <textarea id="customDetails" name="details" placeholder="Tell us about the piece — what it&apos;s for, how it should look, any reference images you have in mind." aria-describedby={formErrors.details ? 'err-details' : undefined} onChange={() => { if (formErrors.details) setFormErrors(prev => { const { details, ...rest } = prev; return rest; }); }}></textarea>
              {formErrors.details && <span className="form-error" id="err-details">{formErrors.details}</span>}
            </div>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-caption)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0.75rem 0' }}>Or</p>
            <div className="form-row">
              <label>Reference Images</label>
              <div ref={fileUploadAreaRef} className="file-upload-area" id="fileUploadArea" role="button" tabIndex={0} aria-label="Upload reference images">
                <input ref={fileInputRef} type="file" id="fileInput" name="references" multiple accept="image/*,.pdf" />
                <p>Drag &amp; drop images here, or <span className="browse-link">browse</span></p>
              </div>
              <p className="file-upload-hint">Optional — JPG, PNG, or PDF up to 10 MB each</p>
              {formErrors.file && <span className="form-error">{formErrors.file}</span>}
              <div ref={filePreviewRef} className="file-preview" id="filePreview"></div>
            </div>

            {formStatus === 'submitted' ? (
              <div className="form-success" role="status">
                <p><strong>Demo mode — backend integration required.</strong></p>
                <p>In production, your custom order request would be sent to our workshop team for review. We will review your request and respond with feasibility, pricing, and estimated timeline.</p>
                <button type="button" className="btn-primary form-submit" onClick={() => setFormStatus('')}>Submit Another Request</button>
              </div>
            ) : (
              <>
                <button type="submit" className="btn-primary form-submit">Request a Quote</button>
                <p className="form-note">Demo mode — no data is submitted. Backend integration required.</p>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
