import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import * as yup from 'yup';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
  }, []);

  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    message: yup.string().required('Message is required'),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schema.validate(form, { abortEarly: false });
      setErrors({});
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach(err => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
  const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setForm({ name: '', email: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-pink-100 via-blue-50 to-white transition-all duration-300 font-sans animate-fade-in">
      <div className="max-w-lg w-full mx-auto py-12 px-4 animate-fade-in" data-aos="zoom-in">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-primary-700 drop-shadow-lg animate-fade-in" data-aos="fade-down">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 p-8 rounded-2xl shadow-card-haven animate-fade-in" data-aos="fade-up">
          <div>
            <label className="block mb-1 font-semibold text-primary-700">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input-premium"
            />
            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block mb-1 font-semibold text-primary-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="input-premium"
            />
            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
          </div>
          <div>
            <label className="block mb-1 font-semibold text-primary-700">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="input-premium"
            />
            {errors.message && <div className="text-red-500 text-sm mt-1">{errors.message}</div>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient font-semibold py-3 rounded-xl text-lg shadow-lg hover:scale-[1.03] transition-all duration-200"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
