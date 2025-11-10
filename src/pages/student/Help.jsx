import React, { useState } from "react";
import StudentLayout from "../../components/layout/StudentLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Mail,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Target,
  Upload,
  Trophy,
  Clock,
  Lock,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Bug,
  Flag,
  Camera,
  UserCheck,
  Crown,
  Zap,
  Brain,
  Shield,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const contactInfo = {
    technicalTeam: {
      name: "Code Wizards ",
      email: "rohan.m@techdefence.com",
      phone: "+919116790656",
      icon: Zap,
      color: "from-blue-500 to-purple-600",
      description: "For when the magic stops working",
    },
    adminTeam: {
      name: "CTF Overlords",
      email: "rohan.m@techdefence.com",
      phone: "+919116790656",
      icon: Crown,
      color: "from-green-500 to-emerald-600",
      description: "Keepers of challenges and points",
    },
  };

  const faqs = [
    {
      question: "How do I join a CTF challenge?",
      answer:
        "Click the big shiny 'Join Challenge' button. If it's grayed out, the CTF gods haven't blessed that time slot yet. Check active hours!",
      category: "getting-started",
      icon: Target,
    },
    {
      question: "Why can't I submit my brilliant solution?",
      answer:
        "Are you trying to submit outside active hours? The platform isn't nocturnal. Check the schedule and try again when the sun is up (metaphorically speaking).",
      category: "submissions",
      icon: Upload,
    },
    {
      question: "My screenshot upload failed. Is the universe against me?",
      answer:
        "Probably just file size or format. Keep it under 4MB and use actual images, not your vacation photos. The system appreciates JPEG/PNG.",
      category: "technical",
      icon: Camera,
    },
    {
      question: "How long until my submission gets the royal treatment?",
      answer:
        "Our admins review submissions faster than you can say 'CTF{this_is_a_flag}'. Typically 1-2 hours, unless they're busy defending against real cyber attacks.",
      category: "submissions",
      icon: Clock,
    },
    {
      question: "I forgot my password. Am I doomed?",
      answer:
        "Not doomed! Click 'Forgot Password' and follow the magic link. Check your spam folder - sometimes our emails get shy.",
      category: "account",
      icon: Lock,
    },
    {
      question: "My ranking hasn't updated. Is this a conspiracy?",
      answer:
        "Rankings update every 15 minutes. If yours hasn't changed, maybe others are just... better? Kidding! Give it a few minutes and refresh.",
      category: "ranking",
      icon: Trophy,
    },
    {
      question: "Can I edit my submission after sending it into the void?",
      answer:
        "Yes, while it's 'Pending Review' you can update your screenshot. Once it's judged, it's carved in digital stone.",
      category: "submissions",
      icon: RefreshCw,
    },
    {
      question: "What happens if I submit wrong flags repeatedly?",
      answer:
        "You get limited attempts per CTF. Use them wisely! This isn't a 'guess until you get it' game... unless you're really lucky.",
      category: "submissions",
      icon: Flag,
    },
    {
      question: "The website is being dramatic and not loading",
      answer:
        "Try the classic IT solution: refresh. Still broken? Clear your cache. Still broken? Okay, maybe contact us. We won't judge.",
      category: "technical",
      icon: Bug,
    },
    {
      question: "I found a bug! Should I keep it as a pet?",
      answer:
        "Please don't. Report it to us instead. We'll give it a good home in our bug tracker and maybe even name it after you.",
      category: "technical",
      icon: Bug,
    },
    {
      question: "How do I become a CTF legend?",
      answer:
        "Solve challenges, earn points, climb rankings. Also, practice. Lots of practice. And maybe drink coffee. Definitely drink coffee.",
      category: "general",
      icon: Crown,
    },
    {
      question: "My profile won't update. Is it rebellious?",
      answer:
        "Make sure you're actually clicking 'Save'. We know, it's a novel concept. Also check required fields - they're required for a reason.",
      category: "account",
      icon: UserCheck,
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmailClick = (email, subject = "") => {
    const mailtoLink = subject
      ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
      : `mailto:${email}`;
    
    // Create a temporary anchor element for better compatibility
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppClick = (phoneNumber) => {
    const message = "Hello! I need assistance with the CTF platform.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab for better cross-platform compatibility
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <StudentLayout title="Help Center" subtitle="Where confusion comes to die">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center items-center space-x-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Need Help?
              </h1>
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              You're not lost, you're just on an adventure. Let's get you
              unstuck.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {Object.entries(contactInfo).map(([key, team]) => {
              const Icon = team.icon;
              return (
                <motion.div key={key} variants={itemVariants}>
                  <Card className="h-full transform hover:scale-105 transition-all duration-300 border-0 shadow-xl">
                    <Card.Content className="p-8 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${team.color} mb-4`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {team.name}
                      </h3>
                      <p className="text-gray-600 mb-6 italic">
                        {team.description}
                      </p>
                      <div className="space-y-3">
                        <Button
                          onClick={() =>
                            handleEmailClick(
                              team.email,
                              `Help from ${team.name}`
                            )
                          }
                          className={`w-full bg-gradient-to-r ${team.color} border-0 text-white hover:shadow-lg transition-all`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Magical Email
                        </Button>
                        <Button
                          onClick={() => handleWhatsAppClick(team.phone)}
                          variant="outline"
                          className="w-full border-2 hover:shadow-lg transition-all"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp Spell
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* FAQ Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers... or just type your problems and hope"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-0 rounded-2xl shadow-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-lg bg-white"
              />
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <Card.Header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
                <div className="flex items-center space-x-3 justify-center">
                  <Brain className="h-8 w-8" />
                  <div>
                    <h3 className="text-2xl font-bold">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-purple-100">
                      Questions we get asked more than "What's the WiFi
                      password?"
                    </p>
                  </div>
                  <Shield className="h-8 w-8" />
                </div>
              </Card.Header>
              <Card.Content className="p-0">
                <AnimatePresence>
                  <div className="divide-y divide-gray-100">
                    {filteredFaqs.map((faq, index) => {
                      const Icon = faq.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <button
                            onClick={() => toggleFaq(index)}
                            className="w-full px-6 py-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Icon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 text-left">
                                <h4 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                  {faq.question}
                                </h4>
                                <AnimatePresence>
                                  {openFaq === index && (
                                    <motion.p
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="text-gray-600 mt-3 text-left"
                                    >
                                      {faq.answer}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              {openFaq === index ? (
                                <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              )}
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>

                {filteredFaqs.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No answers found for "{searchTerm}"
                    </h4>
                    <p className="text-gray-600">
                      Try different keywords or ask us directly. We don't bite
                      (usually).
                    </p>
                  </motion.div>
                )}
              </Card.Content>
            </Card>
          </motion.div>

          {/* Pro Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-xl">
              <Card.Content className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="h-8 w-8 text-orange-600" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Pro Tips from the Wise Ones
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: Target,
                      text: "Read challenge instructions. Seriously.",
                    },
                    { icon: Clock, text: "Active hours exist for a reason" },
                    {
                      icon: Camera,
                      text: "Screenshots should actually show something",
                    },
                    { icon: Trophy, text: "Practice makes less terrible" },
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 bg-white rounded-lg shadow-sm border"
                    >
                      <tip.icon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">
                        {tip.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Emergency Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-0 bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-2xl">
              <Card.Content className="p-6 text-center">
                <div className="flex items-center justify-center space-x-3">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="font-semibold text-lg">
                    Platform completely down? CTF ending in 5 minutes?
                  </span>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="mt-2 text-red-100">
                  Use WhatsApp for immediate assistance. We're probably already
                  fixing it.
                </p>
              </Card.Content>
            </Card>
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Help;