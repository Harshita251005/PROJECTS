import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Eye, Lock, Database, Globe, Mail, Clock } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = 'December 13, 2025';

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'When you create an account, we collect information such as your name, email address, and profile details. If you choose to sign up using Google or GitHub, we receive basic profile information from these services.'
        },
        {
          subtitle: 'Usage Data',
          text: 'We automatically collect information about how you interact with our platform, including pages visited, features used, and time spent on the platform. This helps us improve your experience.'
        },
        {
          subtitle: 'Event Participation Data',
          text: 'When you participate in hackathons, we collect information about your submissions, team memberships, and event activity to facilitate the competition and scoring process.'
        }
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Platform Operations',
          text: 'We use your information to operate and maintain the HackVerse platform, including user authentication, event management, team formation, and communication features.'
        },
        {
          subtitle: 'Communication',
          text: 'We may send you important updates about events youve registered for, team invitations, judging results, and platform announcements. You can manage notification preferences in your settings.'
        },
        {
          subtitle: 'Platform Improvement',
          text: 'We analyze usage patterns to improve our features, fix bugs, and develop new functionality that better serves our community of hackers and organizers.'
        }
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        {
          subtitle: 'Protection Measures',
          text: 'We implement industry-standard security measures including encryption, secure data transmission (HTTPS), and regular security audits to protect your personal information.'
        },
        {
          subtitle: 'Access Controls',
          text: 'Access to personal data is restricted to authorized personnel only. We use role-based access controls and monitor for unauthorized access attempts.'
        },
        {
          subtitle: 'Password Security',
          text: 'Passwords are hashed using bcrypt before storage. We never store plain-text passwords and cannot retrieve your password if forgotten.'
        }
      ]
    },
    {
      icon: Globe,
      title: 'Information Sharing',
      content: [
        {
          subtitle: 'Public Profile Information',
          text: 'Your name, profile picture, bio, and skills may be visible to other users depending on your privacy settings. Team membership and event participation may also be visible.'
        },
        {
          subtitle: 'Event Organizers',
          text: 'When you register for a hackathon, organizers may access your profile information to facilitate the event, contact you, and evaluate submissions.'
        },
        {
          subtitle: 'Third-Party Services',
          text: 'We do not sell your personal information. We may share limited data with service providers who help operate the platform (e.g., email services, cloud hosting) under strict confidentiality agreements.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Your Rights & Choices',
      content: [
        {
          subtitle: 'Access and Correction',
          text: 'You can access and update your personal information at any time through your profile settings. If you need assistance, contact our support team.'
        },
        {
          subtitle: 'Data Deletion',
          text: 'You may request deletion of your account and associated data. Some information may be retained for legal compliance or legitimate business purposes.'
        },
        {
          subtitle: 'Marketing Preferences',
          text: 'You can opt out of promotional communications at any time through your notification settings or by clicking unsubscribe in our emails.'
        }
      ]
    },
    {
      icon: Clock,
      title: 'Data Retention',
      content: [
        {
          subtitle: 'Active Accounts',
          text: 'We retain your data while your account is active to provide our services. You can delete your account at any time.'
        },
        {
          subtitle: 'After Deletion',
          text: 'After account deletion, we may retain some data for up to 30 days for backup purposes, and certain aggregated analytics data may be retained indefinitely.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may retain data longer if required by law or to protect our legal rights.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We are committed to protecting your privacy and being transparent about how we handle your data.
          </p>
          <div className="flex items-center justify-center mt-6 text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Last updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="card mb-8">
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy describes how HackVerse ("we," "us," or "our") collects, uses, and shares information 
              about you when you use our hackathon management platform. By using HackVerse, you agree to the collection 
              and use of information in accordance with this policy.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.title} className="card">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <span className="text-primary-400 text-sm font-medium">Section {index + 1}</span>
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>
                <div className="space-y-6">
                  {section.content.map((item) => (
                    <div key={item.subtitle}>
                      <h3 className="text-white font-semibold mb-2">{item.subtitle}</h3>
                      <p className="text-gray-400 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 card bg-gradient-to-r from-primary-900/30 to-slate-800 border-primary-700/50">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Questions About Privacy?</h3>
                <p className="text-gray-400 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <a href="mailto:privacy@hackverse.com" className="text-primary-400 hover:text-primary-300 font-medium">
                  privacy@hackverse.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
