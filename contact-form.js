/**
 * Contact Form Handler
 * Manages modal interactions and email service integrations
 */

class ContactFormHandler {
    constructor() {
        // Email configuration (hidden from public view)
        this.config = {
            recipient: 'info@ddc2.com',
            subject: 'ACDC Information Request',
            gmailUrl: 'https://mail.google.com/mail/?view=cm&fs=1',
            outlookUrl: 'https://outlook.live.com/mail/0/deeplink/compose'
        };

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.contactBtn = document.getElementById('contactBtn');
        this.modal = document.getElementById('contactModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.contactForm = document.getElementById('contactForm');
        this.gmailBtn = document.getElementById('gmailIcon');
        this.outlookBtn = document.getElementById('outlookIcon');
    }

    attachEventListeners() {
        // Open modal
        if (this.contactBtn) {
            this.contactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }

        // Close modal
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        // Close on background click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Email service buttons
        if (this.gmailBtn) {
            this.gmailBtn.addEventListener('click', () => this.openEmailClient('gmail'));
        }

        if (this.outlookBtn) {
            this.outlookBtn.addEventListener('click', () => this.openEmailClient('outlook'));
        }
    }

    openModal() {
        if (!this.modal) return;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input for accessibility
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    closeModal() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        if (this.contactForm) {
            this.contactForm.reset();
        }
        
        // Reset button states
        this.resetButtonStates();
    }

    validateForm() {
        if (!this.contactForm) return false;
        
        if (!this.contactForm.checkValidity()) {
            this.contactForm.reportValidity();
            return false;
        }
        
        return true;
    }

    getFormData() {
        const formData = new FormData(this.contactForm);
        return {
            email: formData.get('email') || '',
            name: formData.get('name') || '',
            organization: formData.get('organization') || '',
            message: formData.get('message') || ''
        };
    }

    buildEmailBody(data) {
        let body = `Hello ACDC Team,\n\n`;
        body += `${data.message}\n\n`;
        body += `Best regards,\n`;
        body += `${data.name}\n`;
        
        if (data.organization) {
            body += `${data.organization}\n`;
        }
        
        body += `${data.email}\n\n`;
        body += `---\n`;
        body += `This inquiry was sent from the ACDC landing page contact form.`;
        
        return body;
    }

    openEmailClient(service) {
        // Validate form first
        if (!this.validateForm()) return;
        
        // Get form data
        const data = this.getFormData();
        const emailBody = this.buildEmailBody(data);
        
        // Build URL based on service
        let composeUrl;
        
        if (service === 'gmail') {
            composeUrl = `${this.config.gmailUrl}&to=${encodeURIComponent(this.config.recipient)}&su=${encodeURIComponent(this.config.subject)}&body=${encodeURIComponent(emailBody)}`;
            this.showFeedback(this.gmailBtn, 'Gmail');
        } else if (service === 'outlook') {
            composeUrl = `${this.config.outlookUrl}?to=${encodeURIComponent(this.config.recipient)}&subject=${encodeURIComponent(this.config.subject)}&body=${encodeURIComponent(emailBody)}`;
            this.showFeedback(this.outlookBtn, 'Outlook');
        }
        
        // Open in new tab
        if (composeUrl) {
            window.open(composeUrl, '_blank');
        }
        
        // Close modal after delay
        setTimeout(() => {
            this.closeModal();
        }, 2000);
    }

    showFeedback(button, serviceName) {
        if (!button) return;
        
        const originalClass = button.className;
        const parent = button.parentElement;
        
        // Add success state
        button.classList.add('success');
        
        // Show feedback message
        const feedbackMsg = parent.querySelector('.feedback-msg');
        if (feedbackMsg) {
            feedbackMsg.textContent = `Opening ${serviceName}...`;
            feedbackMsg.classList.add('show');
        }
        
        // Disable both buttons temporarily
        this.gmailBtn?.classList.add('disabled');
        this.outlookBtn?.classList.add('disabled');
    }

    resetButtonStates() {
        // Remove success states
        this.gmailBtn?.classList.remove('success', 'disabled');
        this.outlookBtn?.classList.remove('success', 'disabled');
        
        // Hide feedback messages
        const feedbackMsgs = document.querySelectorAll('.feedback-msg');
        feedbackMsgs.forEach(msg => {
            msg.classList.remove('show');
            msg.textContent = '';
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});
