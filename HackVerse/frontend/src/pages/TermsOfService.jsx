import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Shield, 
  AlertTriangle, 
  Scale, 
  Clock,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = 'December 13, 2025';

  const sections = [
    {
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: `By accessing or using HackVerse, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.

These terms apply to all users of the platform, including participants, organizers, judges, mentors, and administrators.`
    },
    {
      icon: Users,
      title: 'User Accounts',
      content: `To access certain features of HackVerse, you must create an account. You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Notifying us immediately of any unauthorized access
• Providing accurate, current, and complete information during registration
• Keeping your profile information up to date

We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`
    },
    {
      icon: Scale,
      title: 'Acceptable Use',
      content: `You agree to use HackVerse only for lawful purposes and in accordance with these Terms. You agree NOT to:

• Violate any applicable laws or regulations
• Impersonate any person or entity
• Harass, abuse, or harm other users
• Upload malicious code, viruses, or harmful content
• Attempt to gain unauthorized access to any part of the platform
• Interfere with or disrupt the platform's servers or networks
• Use automated tools to scrape or collect user data
• Engage in any activity that could damage the platform's reputation

Violation of these rules may result in immediate account termination.`
    },
    {
      icon: FileText,
      title: 'Hackathon Participation',
      content: `When participating in hackathons on HackVerse:

• You agree to follow the specific rules set by event organizers
• All submissions must be original work created during the hackathon period unless otherwise specified
• You may not submit projects that infringe on third-party intellectual property rights
• Judges' decisions are final and binding
• Prizes are subject to the terms set by event organizers
• You grant organizers a license to showcase your submissions for promotional purposes

Event organizers reserve the right to disqualify participants who violate event rules.`
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: `Regarding intellectual property on HackVerse:

• You retain ownership of content you create and submit
• By submitting content, you grant HackVerse a non-exclusive license to display and distribute it within the platform
• HackVerse's logo, design, and software are protected by intellectual property laws
• You may not use our trademarks without written permission
• You are responsible for ensuring your submissions do not infringe on others' IP rights

If you believe your intellectual property has been infringed, please contact us immediately.`
    },
    {
      icon: XCircle,
      title: 'Prohibited Content',
      content: `The following types of content are strictly prohibited on HackVerse:

• Illegal, harmful, or offensive content
• Hate speech, discrimination, or harassment
• Sexually explicit material
• Content that promotes violence or illegal activities
• Spam, phishing, or deceptive content
• Malware, viruses, or malicious code
• Content that violates privacy rights
• Copyrighted material without proper authorization

We reserve the right to remove any content that violates these guidelines without notice.`
    },
    {
      icon: AlertTriangle,
      title: 'Disclaimers & Limitations',
      content: `HackVerse is provided "as is" without warranties of any kind. We do not guarantee:

• The platform will be uninterrupted or error-free
• The accuracy or reliability of any information on the platform
• That defects will be corrected promptly

To the maximum extent permitted by law, HackVerse shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.

Our total liability shall not exceed the amount you paid us in the past 12 months, if any.`
    },
    {
      icon: Clock,
      title: 'Modifications to Terms',
      content: `We reserve the right to modify these Terms of Service at any time. When we make changes:

• We will update the "Last Updated" date at the top of this page
• For significant changes, we may notify you via email or platform notification
• Continued use of the platform after changes constitutes acceptance of the new terms

We encourage you to review these terms periodically to stay informed of any updates.`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-secondary-900/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-secondary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using HackVerse. By using our platform, you agree to these terms.
          </p>
          <div className="flex items-center justify-center mt-6 text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Last updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-slate-800/50 border-y border-slate-700 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Use the platform responsibly and follow event rules</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">You own your submissions but grant us display rights</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Respect other users and their intellectual property</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Table of Contents */}
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#section-${index + 1}`}
                  className="flex items-center text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <span className="text-primary-500 mr-2">{index + 1}.</span>
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.title} id={`section-${index + 1}`} className="card scroll-mt-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-secondary-400" />
                  </div>
                  <div>
                    <span className="text-secondary-400 text-sm font-medium">Section {index + 1}</span>
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>
                <div className="text-gray-400 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 card bg-gradient-to-r from-secondary-900/30 to-slate-800 border-secondary-700/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-secondary-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Questions About These Terms?</h3>
                <p className="text-gray-400 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <a href="mailto:legal@hackverse.com" className="text-secondary-400 hover:text-secondary-300 font-medium">
                  legal@hackverse.com
                </a>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Link>
            <Link to="/help" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Help Center
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
