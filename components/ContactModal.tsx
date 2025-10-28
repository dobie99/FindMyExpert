import React, { useState, useMemo, useEffect } from 'react';
import { Expert } from '../types';

interface ContactModalProps {
  expert: Expert | null;
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ expert, searchQuery, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  const { email, subject, body } = useMemo(() => {
    if (!expert) return { email: '', subject: '', body: '' };

    const nameSlug = expert.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
    const universityDomain = expert.university.toLowerCase()
      .replace(/university of|college/g, '')
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '') + '.edu';

    const email = `${nameSlug}@${universityDomain}`;
    
    const subject = `Inquiry regarding your work on "${searchQuery}"`;
    
    const body = `Dear Dr. ${expert.name.split(' ').pop()},

My name is [Your Name] and I am a [Your Title/Position] at [Your Organization].

I came across your profile while researching experts in "${searchQuery}" and was very interested in your work.

[Your specific question or reason for contact].

Thank you for your time and consideration.

Sincerely,
[Your Name]`;
    
    return { email, subject, body };
  }, [expert, searchQuery]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!isOpen || !expert) {
    return null;
  }

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div 
        className="relative w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800 modal-content transform scale-95 opacity-0 animate-fade-in-down"
        style={{ animationFillMode: 'forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-gray-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
        <h2 id="contact-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Contact {expert.name}
        </h2>
        
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-gray-700 dark:border-yellow-900/50">
            <p className="text-yellow-800 dark:text-yellow-200">
              <span className="font-semibold">Please Note:</span> The email address provided is a placeholder. You will need to verify the expert's actual contact information.
            </p>
          </div>
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">To:</label>
            <p className="p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200">{email}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Subject:</label>
            <p className="p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200">{subject}</p>
          </div>
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300">Body:</label>
            <textarea
              readOnly
              value={body}
              className="w-full h-48 p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200 resize-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end mt-6 space-x-3">
          <button 
            onClick={handleCopyToClipboard}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {copied ? 'Copied!' : 'Copy Body'}
          </button>
          <a
            href={mailtoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Open in Email Client
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
