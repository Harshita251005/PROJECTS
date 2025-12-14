import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Users, 
  Calendar, 
  Trophy, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Search,
  BookOpen,
  Video,
  FileText
} from 'lucide-react';

const HelpCenter = () => {
  const categories = [
    {
      icon: Users,
      title: 'Getting Started',
      description: 'New to HackVerse? Learn the basics of creating an account and navigating the platform.',
      articles: [
        'How to create an account',
        'Setting up your profile',
        'Joining your first hackathon',
        'Understanding user roles'
      ]
    },
    {
      icon: Calendar,
      title: 'Events & Hackathons',
      description: 'Everything you need to know about participating in and organizing hackathons.',
      articles: [
        'How to register for events',
        'Creating and managing events',
        'Event phases explained',
        'Submission guidelines'
      ]
    },
    {
      icon: MessageCircle,
      title: 'Teams & Collaboration',
      description: 'Learn how to build teams, communicate, and collaborate effectively.',
      articles: [
        'Creating a team',
        'Inviting team members',
        'Team messaging features',
        'Managing team roles'
      ]
    },
    {
      icon: Trophy,
      title: 'Submissions & Judging',
      description: 'Understand how submissions work and how projects are evaluated.',
      articles: [
        'Submitting your project',
        'Judging criteria',
        'Leaderboard system',
        'Prizes and recognition'
      ]
    },
    {
      icon: Settings,
      title: 'Account & Settings',
      description: 'Manage your account settings, notifications, and preferences.',
      articles: [
        'Updating profile information',
        'Password and security',
        'Notification preferences',
        'Deleting your account'
      ]
    },
    {
      icon: HelpCircle,
      title: 'Troubleshooting',
      description: 'Having issues? Find solutions to common problems here.',
      articles: [
        'Login issues',
        'Email verification problems',
        'Event registration errors',
        'Contact support'
      ]
    }
  ];

  const popularArticles = [
    { title: 'How to create a winning hackathon project', views: '2.5k' },
    { title: 'Team formation best practices', views: '1.8k' },
    { title: 'Understanding submission requirements', views: '1.5k' },
    { title: 'Tips for remote hackathon participation', views: '1.2k' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Find answers, guides, and resources to make the most of your HackVerse experience.
          </p>
          
          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full bg-slate-800/80 border border-slate-600 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="card bg-gradient-to-br from-primary-900/30 to-slate-800 border-primary-700/50 hover:border-primary-500 transition-all cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Documentation</h3>
                  <p className="text-gray-400 text-sm">Read our detailed guides</p>
                </div>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-secondary-900/30 to-slate-800 border-secondary-700/50 hover:border-secondary-500 transition-all cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Video Tutorials</h3>
                  <p className="text-gray-400 text-sm">Watch step-by-step guides</p>
                </div>
              </div>
            </div>
            <Link to="/contact" className="card bg-gradient-to-br from-green-900/30 to-slate-800 border-green-700/50 hover:border-green-500 transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Contact Support</h3>
                  <p className="text-gray-400 text-sm">Get personalized help</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Categories */}
          <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => (
              <div key={category.title} className="card hover:border-primary-500 transition-all">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <category.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{category.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                    <ul className="space-y-2">
                      {category.articles.map((article) => (
                        <li key={article} className="flex items-center text-sm text-gray-300 hover:text-primary-400 cursor-pointer transition-colors">
                          <ChevronRight className="w-4 h-4 mr-1 text-gray-500" />
                          {article}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Popular Articles */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Popular Articles</h2>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <div key={article.title} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-all">
                  <div className="flex items-center space-x-4">
                    <span className="text-primary-400 font-bold">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-white">{article.title}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{article.views} views</span>
                </div>
              ))}
            </div>
          </div>

          {/* Still Need Help */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary-900/30 via-slate-800 to-secondary-900/30 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-2">Still need help?</h2>
            <p className="text-gray-400 mb-6">Our support team is here to assist you with any questions.</p>
            <Link to="/contact" className="btn-primary inline-flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter;
