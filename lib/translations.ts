export const translations = {
  en: {
    // Common
    welcome: 'Welcome back',

    // Auth
    auth: {
      login: {
        title: "Sign in to your account",
        subtitle: "Welcome back to Curenium.",
        email: "Email address",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot your password?",
        signIn: "Sign in",
        signingIn: "Signing in...",
        success: "Login successful!",
        orContinueWith: "Or continue with",
        google: "Google",
        github: "GitHub",
        notMember: "Not a member?",
        signUp: "Sign up",
        noUserFound: "No account found with this email address.",
        incorrectPassword: "Incorrect password. Please try again.",
        pendingVerification: "Your account is pending verification by an administrator.",
        socialAccountOnly: "Please sign in using your social account or contact support.",
        invalidCredentials: "Invalid email or password. Please try again.",
        unexpectedError: "An unexpected error occurred. Please try again.",
      },
      accountSetup: {
        title: "Create Your Organization",
        subtitle: "Join Curenium and streamline your team's communication.",
        fullName: "Full Name",
        email: "Email Address",
        password: "Password",
        organizationName: "Organization Name",
        createAccount: "Create Account",
        success: "Account created successfully!",
        alreadyHaveAccount: "Already have an account?",
        signIn: "Sign In",
        registrationError: "An error occurred during registration.",
        signInFailed: "Sign-in failed after registration. Please try logging in manually.",
      },
      acceptInvite: {
        title: "Accept Invitation",
        subtitle: "Join your team on Curenium.",
        fullName: "Full Name",
        createPassword: "Create a Password",
        completeRegistration: "Complete Registration",
        goToLogin: "Go to Login",
        invalidInviteLink: "Invalid invite link.",
        failedToFetchInviteDetails: "Failed to fetch invite details.",
        missingInviteToken: "Invite token is missing.",
        accountCreatedSuccess: "Account created successfully! Signing you in...",
        success: "Registration completed successfully!",
        addedToOrganization: "You have been added to the new organization. Please log in to continue.",
        failedToAcceptInvite: "An error occurred while accepting the invite.",
      },
    },

    // Navigation
    nav: {
      about: 'About',
      features: 'Features',
      pricing: 'Pricing',
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      compliance: 'Compliance',
      security: 'Security',
      careers: 'Careers',
      dashboard: 'Dashboard',
      login: 'Login',
      signup: 'Sign Up',
    },

    // Landing Page
    landing: {
      hero: {
        title: 'Empowering Care Teams with Clarity.',
        subtitle: 'Curenium is a secure real-time communication platform for hospital teams, wards, and departments. Streamline collaboration, enhance patient care, and reduce communication errors.',
        getStarted: 'Get Started',
        requestDemo: 'Request Demo',
        secureMessaging: 'Secure & Compliant',
        secureMessagingDesc: 'Secure messaging for healthcare teams',
        realTimeUpdates: 'Real-time Updates',
        realTimeUpdatesDesc: 'Instant communication across departments',
      },
      features: {
        title: 'Built for Healthcare Teams',
        subtitle: 'Curenium combines secure messaging, shift management, and critical alerts in one intuitive platform.',
        secureMessaging: 'Secure Messaging',
        secureMessagingDesc: 'End-to-end encrypted communication for sensitive patient discussions.',
        criticalAlerts: 'Critical Alerts',
        criticalAlertsDesc: 'Prioritize urgent communications with our tiered alert system.',
        shiftManagement: 'Shift Management',
        shiftManagementDesc: 'Seamless handovers with integrated scheduling and notes.',
        learnMore: 'Learn more',
      },
      whyCurenium: {
        title: 'Why Curenium? Because Healthcare Deserves Better',
        subtitle: 'Look, we\'ve all been there – chaotic hospital shifts, missed messages, and that sinking feeling when something slips through the cracks. Curenium isn\'t just another app; it\'s the chill pill your team needs to keep things running smoothly without the stress. Built specifically for the fast-paced world of healthcare, it turns potential disasters into "no big deal" moments.',
        savesLives: 'Real Talk: Saves Lives',
        savesLivesDesc: 'Yeah, it sounds dramatic, but faster communication really does save lives. Nurses spot issues and doctors get backup instantly. No more old paging systems or yelling down halls. Critical alerts go out to everyone at once, shift changes include all the details, and patient info is shared in real-time. This cuts down on mistakes, speeds up care, and can make a real difference when time is critical.',
        busyPeople: 'Built for Busy People',
        busyPeopleDesc: 'Healthcare pros are always busy – dealing with patients, paperwork, emergencies. Curenium understands that. It\'s easy to use, no learning curve, no confusing menus. Chat, send alerts, manage shifts all in one spot. The mobile app works on the go, notifications are useful not annoying, and everything stays in sync. Who needs complicated software when you\'re already exhausted?',
        gulfReady: 'Gulf Region Ready',
        gulfReadyDesc: 'We get the Gulf healthcare world – diverse teams, high standards, unique challenges. Curenium supports your languages (including Arabic) and fits your culture. It\'s not a generic app with a quick translation; it\'s built for Gulf hospitals, with Hijri calendar support, local compliance, and workflows that make sense here. Collaboration feels natural, not forced.',
        alwaysEvolving: 'Always Evolving',
        alwaysEvolvingDesc: 'Healthcare keeps changing, and so does Curenium. We listen to real healthcare workers like you. Updates add new features, improve security, and fix things based on what works in hospitals. Our support team helps with more than just bugs – they give tips to use the platform better. We\'re partners in this, ensuring Curenium evolves with your needs.',
      },
      howItWorks: {
        title: 'How Curenium Makes Your Day Easier',
        subtitle: 'It\'s not rocket science, but it might as well be. Here\'s the lowdown on how Curenium turns healthcare chaos into something manageable.',
        step1: 'Sign Up & Set Up',
        step1Desc: 'Get your hospital or ward set up in minutes. Invite your team, create channels for different departments, and you\'re good to go. No IT headaches – we handle the heavy lifting.',
        step2: 'Chat & Collaborate',
        step2Desc: 'Start messaging securely. Share patient updates, coordinate care, and keep everyone in the loop. It\'s like group chat, but for saving lives – with end-to-end encryption and all the bells and whistles.',
        step3: 'Handle Alerts & Shifts',
        step3Desc: 'Critical alerts? Boom – instant notifications. Shift handovers? Seamless notes and schedules. Curenium integrates everything so you can focus on what matters: patient care.',
      },
      cta: {
        title: 'Ready to transform your healthcare communications?',
        subtitle: 'Join hospitals across the Gulf region already using Curenium to improve patient care through better team communication.',
        requestDemo: 'Request Demo',
        contactSales: 'Contact Sales',
      },
      chatDemo: {
        title: 'Emergency Ward Chat',
        live: 'Live',
        doctorInitials: 'DR',
        nurseInitials: 'ME',
        doctorMessage: 'Patient in Room 302 needs immediate attention. Blood pressure dropping.',
        nurseMessage: 'On my way with crash cart. ETA 30 seconds.',
        doctorName: 'Dr. Rahman',
        nurseName: 'You',
        timeAgo: '2m ago',
        justNow: 'Just now',
        criticalAlert: 'Critical Alert Sent',
        placeholder: 'Type your message...',
      },
      howItWorksChatDemo: {
        title: 'Team Coordination',
        active: 'Active',
        nurseInitials: 'RN',
        doctorInitials: 'DA',
        nurseMessage: 'Shift handover complete. Patient in 204 needs vitals check every 2 hours.',
        doctorMessage: 'Got it. I\'ll take over. Any other notes?',
        nurseName: 'Nurse Sarah',
        doctorName: 'Dr. Ahmed',
        timeAgo: '5m ago',
        justNow: 'Just now',
        shiftComplete: 'Shift Handover Complete',
      },
    },

    // About Page
    about: {
      title: 'About Curenium',
      subtitle: 'Curenium is revolutionizing healthcare communication by bridging critical gaps that have long plagued medical teams. Born from real-world healthcare challenges and powered by cutting-edge technology, we\'re building a comprehensive platform that transforms fragmented communication into seamless collaboration. Our mission is to empower healthcare professionals with intelligent tools that enhance patient care, streamline workflows, and ultimately save lives through better coordination and faster decision-making in high-stakes environments.',
      stats: {
        team: 'Expert team members',
        partners: 'Beta healthcare partners',
        workflows: 'Healthcare workflows mapped',
      },
      betaText: 'In beta testing with healthcare partners, Curenium delivers instant, secure communication for critical updates and emergency alerts. Our platform saves lives by eliminating communication barriers, with clinicians at the heart of every decision.',
      revolutionizing: 'Revolutionizing Healthcare Communication',
      revolutionizingDesc: 'Founded in 2025, Curenium emerged from a vision to bridge the communication gaps in healthcare. Plannorium brings together talented professionals from around the globe, from the Middle East and Africa to Europe, Asia, and the Americas. Our diverse team represents the future of healthcare technology, where global perspectives meet compassionate care and innovation. Curenium is built for healthcare professionals who demand excellence. Our platform combines real-time collaboration, intelligent patient management, and seamless communication tools to empower medical teams and improve patient outcomes.',
      features: {
        title: 'Curenium Features',
        realTime: 'Real-time Collaboration',
        realTimeDesc: 'Instant messaging and team coordination',
        patient: 'Patient Management',
        patientDesc: 'Comprehensive EHR and patient tracking',
        alerts: 'Smart Alerts',
        alertsDesc: 'Intelligent notifications and workflow automation',
      },
      tags: {
        secure: 'Secure Messaging',
        patientCentric: 'Patient-Centric Design',
        enterprise: 'Enterprise Security',
      },
      mission: {
        title: 'Our Mission',
        desc: 'To revolutionize healthcare communication by providing healthcare professionals with intelligent, secure, and intuitive tools that enhance patient care and team collaboration.',
      },
      vision: {
        title: 'Our Vision',
        desc: 'To become the global standard for healthcare communication platforms, empowering medical professionals worldwide with tools that save lives and improve healthcare outcomes.',
      },
      overviewFeatures: {
        title: 'Curenium Features',
        description: 'Curenium combines real-time collaboration, intelligent patient management, and smart alerts to empower medical teams and improve patient outcomes.',
        learnMore: 'Learn More About Our Features',
      },
      values: {
        title: 'Our Values',
        subtitle: 'The principles that guide everything we do and every product we build.',
        missionDriven: 'Mission-Driven',
        missionDrivenDesc: 'We exist to improve healthcare outcomes through innovative technology solutions.',
        innovation: 'Innovation First',
        innovationDesc: 'We constantly push boundaries to deliver cutting-edge healthcare solutions.',
        humanCentered: 'Human-Centered',
        humanCenteredDesc: 'Every decision we make prioritizes the needs of healthcare professionals and patients.',
        excellence: 'Excellence',
        excellenceDesc: 'We maintain the highest standards in everything we build and deliver.',
      },
      globalPresence: {
        title: 'Global Presence, Local Impact',
        subtitle: 'Our team spans continents, bringing diverse perspectives and expertise to healthcare innovation.',
        universal: 'Universal',
        universalDesc: 'With a strong presence in the MiddleEast & Africa, we deliver localized solutions by understanding regional needs.',
        globalNetwork: 'Global Network',
        globalNetworkDesc: 'Extended reach with collaborators and partners across Europe, Asia, and the Americas, ensuring worldwide healthcare impact.',
      },
      teamDiversity: {
        title: 'Diverse Perspectives, United Mission',
        subtitle: 'Our global team brings together healthcare experts, engineers, designers, and innovators from diverse backgrounds.',
        healthcare: 'Healthcare Experts',
        healthcareDesc: 'Doctors, nurses, and healthcare administrators bringing clinical expertise and real-world insights.',
        engineers: 'Software Engineers',
        engineersDesc: 'Full-stack developers and architects from top tech companies, specializing in healthcare systems.',
        designers: 'UX Designers',
        designersDesc: 'Creative designers focused on intuitive, accessible healthcare interfaces that save lives.',
        innovators: 'Product Innovators',
        innovatorsDesc: 'Strategic thinkers and product managers driving healthcare innovation and user experience.',
      },
      advantage: {
        title: 'The Curenium Advantage',
        subtitle: 'We are building a platform that sets new standards in healthcare technology, focusing on security, performance, and usability.',
        security: 'Enterprise-Grade Security',
        securityDesc: 'Protecting patient data with state-of-the-art encryption and compliance with global privacy standards.',
        technology: 'Modern Technology Stack',
        technologyDesc: 'Built on a scalable, cloud-native architecture to ensure reliability, performance, and future-readiness.',
        design: 'Clinician-Centric Design',
        designDesc: 'Developed in close collaboration with healthcare professionals to create intuitive and efficient workflows.',
      },
      joinMission: {
        title: 'Join Our Mission',
        subtitle: 'We\'re not actively hiring right now, but we\'re always looking for passionate individuals to join our mission. Feel free to send us your resume!',
        sendResume: 'Send Your Resume',
      },
      cta: {
        title: 'Ready to Transform Healthcare?',
        subtitle: 'Join us on our mission to improve healthcare communication and save lives.',
        contactUs: 'Contact Us',
        requestDemo: 'Request a Demo',
      },
    },

    // Careers Page
    careers: {
      hero: {
        title: 'Join Our Mission',
        subtitle: 'Help us build the future of healthcare communication',
        description: 'We\'re looking for passionate individuals who want to make a real impact in healthcare technology. Join our diverse team of innovators, healthcare experts, and technology leaders.',
      },
      whyJoin: {
        title: 'Why Join Curenium',
        subtitle: 'We\'re not just another tech company. We\'re building solutions that save lives and improve healthcare outcomes.',
      },
      benefits: {
        health: {
          title: 'Health & Wellness',
          description: 'Comprehensive health insurance, mental health support, and wellness programs'
        },
        flexible: {
          title: 'Flexible Work',
          description: 'Remote-first culture with flexible hours and unlimited PTO'
        },
        learning: {
          title: 'Learning & Development',
          description: 'Conference attendance, online courses, and professional development budget'
        },
        compensation: {
          title: 'Competitive Compensation',
          description: 'Market-leading salaries, equity participation, and performance bonuses'
        },
        culture: {
          title: 'Collaborative Culture',
          description: 'Diverse, inclusive team with regular virtual and in-person meetups'
        },
        innovation: {
          title: 'Innovation Focus',
          description: 'Work on cutting-edge healthcare technology that makes a real impact'
        }
      },
      openPositions: {
        title: 'Open Positions',
        subtitle: 'Find your next opportunity to work on meaningful projects that make a difference in healthcare.',
        comingSoon: 'Open Positions Coming Soon',
        comingSoonDesc: 'We\'re actively building our team and will be posting exciting opportunities in healthcare technology, software development, and product design.',
        resumeText: 'If you\'re passionate about healthcare innovation and want to be part of our mission, we\'d love to hear from you. Send us your resume via mail and let us know why you\'d be a great fit.',
      },
      culture: {
        title: 'Our Culture',
        subtitle: 'We believe in fostering an environment where innovation thrives, collaboration is natural, and every team member feels valued and empowered.',
        innovation: {
          title: 'Innovation First',
          description: 'We encourage creative thinking and provide the resources needed to turn bold ideas into reality. Our team members have the freedom to experiment and learn from both successes and failures.'
        },
        workLife: {
          title: 'Work-Life Balance',
          description: 'We understand that great work comes from happy, healthy individuals. That\'s why we offer flexible work arrangements and prioritize the well-being of our team.'
        },
        learning: {
          title: 'Continuous Learning',
          description: 'Technology evolves rapidly, and so do we. We invest in our team\'s professional development through conferences, courses, and hands-on learning opportunities.'
        },
        values: {
          title: 'What We Value',
          collaboration: 'Collaboration',
          collaborationDesc: 'We work together, share knowledge, and support each other',
          excellence: 'Excellence',
          excellenceDesc: 'We strive for the highest quality in everything we do',
          empathy: 'Empathy',
          empathyDesc: 'We understand our users and build with compassion'
        }
      },
      cta: {
        title: 'Ready to Make an Impact?',
        subtitle: 'Join our team and help us transform healthcare communication.',
        viewPositions: 'View Open Positions',
        contactUs: 'Contact Us'
      }
    },

    // Features Page
    features: {
      hero: {
        title: 'Powerful Features for Modern Healthcare',
        subtitle: 'Comprehensive suite of tools designed for healthcare teams',
        description: 'Discover how Curenium\'s comprehensive suite of features transforms healthcare communication and patient care management.',
      },
      coreFeatures: {
        realTimeCommunication: {
          title: 'Real-time Communication',
          description: 'Secure, compliant messaging with instant notifications across all departments and devices.',
          features: ['End-to-end encryption', 'Multi-device sync', 'File sharing & attachments']
        },
        criticalAlerts: {
          title: 'Critical Alerts System',
          description: 'Tiered alert system ensuring urgent communications reach the right people instantly.',
          features: ['Priority-based notifications', 'Push notifications & SMS', 'Escalation workflows']
        },
        ehrSystem: {
          title: 'Complete EHR System',
          description: 'Comprehensive electronic health records with patient management, vitals tracking, and clinical notes.',
          features: ['Patient profiles & history', 'Vitals monitoring', 'Clinical documentation']
        },
        shiftManagement: {
          title: 'Shift Management',
          description: 'Seamless shift handovers with integrated scheduling, notes, and patient status updates.',
          features: ['Automated scheduling', 'Handover notes', 'Staff coordination']
        },
        labIntegration: {
          title: 'Lab Integration',
          description: 'Streamlined lab order management with real-time results tracking and automated notifications.',
          features: ['Order tracking', 'Result notifications', 'Quality assurance']
        },
        complianceSecurity: {
          title: 'Compliance & Security',
          description: 'Enterprise-grade security with full security compliance and comprehensive audit trails.',
          features: ['Secure & encrypted', 'Audit logging', 'Data encryption']
        }
      },
      dashboards: {
        title: 'Role-Based Dashboards',
        subtitle: 'Tailored interfaces for every healthcare professional, from physicians to administrators.',
        operational: {
          pharmacy: {
            title: 'Pharmacy Dashboard',
            badge: 'Live Demo',
            metrics: {
              activeRx: 'Active Rx',
              completed: 'Completed',
              cancelled: 'Cancelled',
              totalRx: 'Total Rx'
            },
            table: {
              patient: 'Patient',
              medication: 'Medication',
              dose: 'Dose',
              status: 'Status'
            },
            data: {
              patients: [
                { name: 'John Smith', medication: 'Amoxicillin 500mg', dose: '500mg', status: 'Active' },
                { name: 'Sarah Johnson', medication: 'Lisinopril 10mg', dose: '10mg', status: 'Completed' },
                { name: 'Mike Davis', medication: 'Metformin 1000mg', dose: '1000mg', status: 'Active' }
              ]
            }
          },
          lab: {
            title: 'Laboratory Dashboard',
            badge: 'Test Results',
            metrics: {
              testsToday: 'Tests Today',
              completed: 'Completed',
              pending: 'Pending',
              critical: 'Critical'
            },
            table: {
              patient: 'Patient',
              testType: 'Test Type',
              status: 'Status',
              result: 'Result'
            },
            data: {
              patients: [
                { name: 'Emma Wilson', testType: 'CBC Complete', status: 'Normal', result: 'Complete' },
                { name: 'David Brown', testType: 'Lipid Panel', status: 'Abnormal', result: 'Complete' },
                { name: 'Lisa Chen', testType: 'Thyroid Function', status: 'Pending', result: 'In Progress' }
              ]
            }
          },
          reception: {
            title: 'Reception Dashboard',
            badge: 'Patient Flow',
            metrics: {
              waiting: 'Waiting',
              inRoom: 'In Room',
              checkedOut: 'Checked Out',
              noShow: 'No Show'
            },
            table: {
              patient: 'Patient',
              appointment: 'Appointment',
              status: 'Status',
              room: 'Room'
            },
            data: {
              patients: [
                { name: 'Anna Martinez', appointment: '10:00 AM', status: 'In Room', room: '204' },
                { name: 'Robert Lee', appointment: '10:30 AM', status: 'Waiting', room: '-' },
                { name: 'Maria Garcia', appointment: '11:00 AM', status: 'Checked In', room: '-' }
              ]
            }
          }
        },
        clinical: {
          nursing: {
            title: 'Nursing Dashboard',
            badge: 'Care Workflow',
            workflowSteps: ['Assessment', 'Monitoring', 'Medication', 'Documentation', 'Care Planning'],
            sections: {
              vitalSigns: 'Vital Signs',
              currentMedications: 'Current Medications'
            },
            vitals: {
              bloodPressure: 'Blood Pressure',
              heartRate: 'Heart Rate',
              temperature: 'Temperature'
            },
            medications: [
              'Amoxicillin 500mg - 3x daily',
              'Ibuprofen 400mg - as needed',
              'Vitamin D 1000 IU - daily'
            ]
          },
          physician: {
            title: 'Physician Dashboard',
            badge: 'Medical Workflow',
            workflowSteps: ['Assessment', 'Diagnosis', 'Prescription', 'Documentation', 'Follow-up'],
            sections: {
              recentDiagnoses: 'Recent Diagnoses',
              upcomingAppointments: 'Upcoming Appointments'
            },
            diagnoses: [
              'Upper Respiratory Infection',
              'Hypertension (Stage 1)',
              'Vitamin D Deficiency'
            ],
            appointments: [
              'Follow-up: Dec 15, 2:00 PM',
              'Lab Review: Dec 20, 10:00 AM',
              'Consultation: Dec 22, 3:30 PM'
            ]
          },
          sales: {
            title: 'Sales & Outreach Dashboard',
            badge: 'Lead Management',
            metrics: {
              activeLeads: 'Active Leads',
              converted: 'Converted',
              meetings: 'Meetings',
              pipeline: 'Pipeline'
            },
            table: {
              organization: 'Organization',
              contact: 'Contact',
              status: 'Status',
              value: 'Value'
            },
            data: {
              leads: [
                { organization: 'City General Hospital', contact: 'Dr. Sarah Mitchell', status: 'Demo Scheduled', value: '$850K' },
                { organization: 'Regional Medical Center', contact: 'Admin Johnson', status: 'Contract Signed', value: '$1.2M' },
                { organization: 'Community Health Clinic', contact: 'Nurse Director Lee', status: 'Proposal Sent', value: '$350K' }
              ]
            }
          }
        },
        administrative: {
          admin: {
            title: 'Administration Dashboard',
            badge: 'System Overview',
            metrics: {
              activeUsers: 'Active Users',
              uptime: 'Uptime',
              dataProcessed: 'Data Processed',
              activeSessions: 'Active Sessions'
            },
            table: {
              systemComponent: 'System Component',
              status: 'Status',
              performance: 'Performance',
              lastCheck: 'Last Check'
            },
            data: {
              components: [
                { component: 'Database Server', status: 'Healthy', performance: '98% CPU', lastCheck: '2 min ago' },
                { component: 'API Gateway', status: 'Healthy', performance: '45ms latency', lastCheck: '1 min ago' },
                { component: 'Backup System', status: 'Running', performance: '2.1GB/hr', lastCheck: '5 min ago' }
              ]
            }
          },
          analytics: {
            title: 'Analytics Dashboard',
            badge: 'Performance Metrics',
            metrics: {
              patientSatisfaction: 'Patient Satisfaction',
              avgResponseTime: 'Avg Response Time',
              taskCompletion: 'Task Completion',
              efficiencyGain: 'Efficiency Gain'
            },
            table: {
              department: 'Department',
              performance: 'Performance',
              target: 'Target',
              trend: 'Trend'
            },
            data: {
              departments: [
                { department: 'Emergency Room', performance: '96.5%', target: '95%', trend: '↗ +2.1%' },
                { department: 'Laboratory', performance: '98.2%', target: '97%', trend: '↗ +1.8%' },
                { department: 'Pharmacy', performance: '97.8%', target: '96%', trend: '↗ +0.9%' }
              ]
            }
          },
          hr: {
            title: 'HR & Staffing Dashboard',
            badge: 'Workforce Management',
            metrics: {
              totalStaff: 'Total Staff',
              staffSatisfaction: 'Staff Satisfaction',
              openPositions: 'Open Positions',
              avgTrainingHours: 'Avg Training Hours'
            },
            table: {
              department: 'Department',
              staffCount: 'Staff Count',
              utilization: 'Utilization',
              trainingStatus: 'Training Status'
            },
            data: {
              departments: [
                { department: 'Nursing', staffCount: '89', utilization: '94%', trainingStatus: 'Complete' },
                { department: 'Physicians', staffCount: '34', utilization: '87%', trainingStatus: 'In Progress' },
                { department: 'Administration', staffCount: '22', utilization: '91%', trainingStatus: 'Complete' }
              ]
            }
          }
        }
      },
      cta: {
        title: 'Ready to Transform Your Workflow?',
        subtitle: 'Experience Curenium\'s powerful features in action.',
        startTrial: 'Start Free Trial',
        contactSales: 'Contact Sales'
      }
    },

    // Pricing Page
    pricing: {
      hero: {
        title: 'Simple, Transparent Pricing',
        subtitle: 'Choose the plan that fits your healthcare organization',
        description: 'Flexible pricing designed for hospitals of all sizes, from small clinics to large healthcare networks.',
      },
      billing: {
        monthly: 'Monthly',
        yearly: 'Yearly',
        save12: 'Save 12%',
      },
      plans: {
        basic: {
          name: 'Basic',
          description: 'Essential communication and EHR access for price-sensitive hospitals',
          features: [
            'Secure messaging & alerts',
            'Basic EHR view & patient records',
            'Appointment scheduling',
            'Basic reporting',
            'Email support',
            'Mobile app access'
          ],
          limitations: [
            'No advanced EHR features',
            'Limited integrations',
            'Basic analytics only',
            'Standard support hours'
          ]
        },
        pro: {
          name: 'Pro',
          description: 'Complete solution for most hospitals - recommended for optimal care',
          features: [
            'All Basic features',
            'Complete EHR system',
            'Advanced messaging & alerts',
            'Lab integration',
            'Advanced analytics',
            'Priority support',
            'Custom integrations',
            'API access'
          ],
          limitations: [
            'No white-label options',
            'No dedicated support'
          ]
        },
        enterprise: {
          name: 'Enterprise',
          description: 'Full-featured solution for large hospitals and healthcare networks',
          features: [
            'All Pro features',
            'Unlimited users',
            'AI-powered insights',
            'White-label solution',
            'Dedicated 24/7 support',
            'Custom development',
            'Advanced security',
            'Compliance automation',
            'Priority SLA'
          ],
          limitations: []
        }
      },
      ui: {
        mostPopular: 'Most Popular',
        startFreeTrial: 'Start Free Trial',
        getStarted: 'Get Started',
        whatsIncluded: "What's Included",
        limitations: 'Limitations',
        perUserMonth: '/user/month',
        billedAnnually: 'Billed annually at',
        perUserYear: '/user/year',
        for100Users: 'for 100 users',
        orFlat: 'Or',
        flatUpTo100: 'flat (up to 100 users)'
      },
      addons: {
        title: 'Additional Services & Add-ons',
        subtitle: 'Extend your Curenium experience with specialized services and advanced features.',
        broadcastMessaging: {
          title: 'Broadcast Messaging',
          description: 'Patient reminders, appointment campaigns, and mass notifications.',
          pricing: [
            '10k messages included free',
            '10k–49k: $299–$399/month',
            '50k+: Custom pricing'
          ]
        },
        prioritySupport: {
          title: 'Priority Support & SLA',
          description: '24/7 dedicated support with guaranteed response times.',
          pricing: [
            '$2–5/user/month',
            'Or flat fee options',
            '99.9% uptime SLA'
          ]
        },
        implementation: {
          title: 'Implementation & Training',
          description: 'Professional setup, EHR integration, and team training.',
          pricing: [
            'EHR Integration: $1K–$4K',
            'Training: $500–$1.2K/day',
            'Success tracking included'
          ]
        },
        pilotProgram: {
          title: 'Pilot Program Special',
          description: 'Try Curenium risk-free with our 3-month pilot program. Get Pro-level features for up to 100 users at a reduced rate of $1,200 total (plus minimal integration fee).',
          learnMore: 'Learn More'
        }
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about Curenium pricing and features.',
        questions: {
          perUserPricing: {
            question: 'How does per-user pricing work?',
            answer: 'You pay based on the number of active users in your organization. For example, 100 users on Pro plan would be $800/month. Users can be added or removed at any time, and billing adjusts automatically.'
          },
          flatBundle: {
            question: "What's the difference between per-user and flat bundle pricing?",
            answer: 'Per-user pricing scales with your team size. Flat bundles offer predictable costs for organizations up to 100 users - pay one fixed price regardless of how many users you have up to the limit.'
          },
          planChanges: {
            question: 'Can I change plans at any time?',
            answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges. For flat bundles, you can switch to per-user pricing if your needs change.'
          },
          freeTrial: {
            question: 'Is there a free trial?',
            answer: 'Yes! We offer a 14-day free trial for all plans. No credit card required to get started. Contact sales for pilot programs with extended trial periods.'
          },
          implementationCosts: {
            question: 'What about implementation and training costs?',
            answer: 'EHR integration starts at $1,000–$4,000 depending on complexity. Training packages range from $500–$1,200 per day. We also offer success-based implementation with ROI tracking and ongoing support.'
          },
          annualDiscounts: {
            question: 'Do you offer annual discounts?',
            answer: 'Yes! Annual billing includes a 12% discount. We also offer 18-20% discounts for 2-year commitments, making long-term planning more cost-effective.'
          }
        }
      },
      cta: {
        title: 'Ready to Get Started?',
        subtitle: 'Join hundreds of healthcare organizations already using Curenium.',
        startPilot: 'Start Pilot Program',
        viewCalculator: 'View Pricing Calculator'
      }
    },

    // Security Page
    security: {
      hero: {
        title: 'Enterprise-Grade Security',
        subtitle: 'Your data is protected with the highest security standards',
        description: 'We implement comprehensive security measures to protect patient data and ensure compliance with healthcare regulations.',
      },
      features: {
        endToEndEncryption: {
          title: 'End-to-End Encryption',
          description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
          details: [
            'TLS 1.3 for data in transit',
            'AES-256 encryption at rest',
            'Zero-knowledge architecture'
          ]
        },
        secureInfrastructure: {
          title: 'Secure Infrastructure',
          description: 'Built on enterprise-grade cloud infrastructure with multiple layers of security.',
          details: [
            'SOC 2 Type II compliant',
            'ISO 27001 certified',
            'Regular security audits'
          ]
        },
        accessControl: {
          title: 'Access Control',
          description: 'Role-based access control ensures users only see data they need to access.',
          details: [
            'Multi-factor authentication',
            'Role-based permissions',
            'Audit logging'
          ]
        },
        dataProtection: {
          title: 'Data Protection',
          description: 'Comprehensive data protection measures safeguard patient information.',
          details: [
            'Regular backups',
            'Data anonymization',
            'Secure data disposal'
          ]
        },
        privacyByDesign: {
          title: 'Privacy by Design',
          description: 'Privacy considerations are built into every feature and process.',
          details: [
            'Minimal data collection',
            'User consent management',
            'Data portability'
          ]
        },
        threatDetection: {
          title: 'Threat Detection',
          description: 'Advanced monitoring and threat detection systems protect against security incidents.',
          details: [
            'Real-time monitoring',
            'Automated alerts',
            'Incident response plan'
          ]
        }
      },
      standards: {
        title: 'Security Standards & Compliance',
        subtitle: 'We adhere to the highest security standards and regularly undergo independent audits to ensure your data remains protected.',
        certifications: {
          soc2: {
            title: 'SOC 2 Type II',
            description: 'Trust services criteria for security, availability, and confidentiality'
          },
          iso27001: {
            title: 'ISO 27001',
            description: 'International standard for information security management'
          },
          gdpr: {
            title: 'GDPR',
            description: 'General Data Protection Regulation compliance'
          },
          aes256: {
            title: 'AES-256',
            description: 'Advanced encryption standard for data protection'
          }
        }
      },
      cta: {
        title: 'Security You Can Trust',
        subtitle: 'Learn more about our security measures and compliance certifications.',
        getStarted: 'Get Started',
        securityInquiry: 'Security Inquiry'
      }
    },

    // Contact Page
    contact: {
      hero: {
        title: 'Get in Touch',
        subtitle: 'We\'re here to help transform your healthcare communication',
        description: 'Have questions about Curenium? Want to schedule a demo? Our team is ready to help you get started.',
      },
      demo: {
        title: 'Book a Free Demo Call',
        subtitle: 'See Curenium in action! Schedule a personalized demo call with our healthcare experts. We\'ll show you how Curenium can transform your healthcare communication workflow.',
        scheduleDemo: 'Schedule Demo Call',
        viewFeatures: 'View Features',
        duration: '30 min',
        durationLabel: 'Demo Duration',
        cost: 'Free',
        costLabel: 'No Cost',
        custom: 'Custom',
        customLabel: 'Tailored to You'
      },
      contactInfo: {
        email: {
          title: 'Email Us',
          details: ['info@plannorium.com', 'support@plannorium.com'],
          description: 'Send us an email and we\'ll respond within 24 hours.'
        },
        phone: {
          title: 'Call Us',
          details: ['+234 806 892 6547', '+966 53 166 5021'],
          description: 'Available for demo calls and support.'
        },
        location: {
          title: 'Visit Us',
          details: ['Riyadh, Saudi Arabia'],
          description: 'Located in the heart of Riyadh, Saudi Arabia.'
        }
      },
      form: {
        title: 'Send us a Message',
        subtitle: 'Fill out the form below and we\'ll get back to you as soon as possible.',
        labels: {
          name: 'Full Name *',
          email: 'Email Address *',
          company: 'Company/Organization',
          phone: 'Phone Number',
          inquiryType: 'Inquiry Type',
          subject: 'Subject *',
          message: 'Message *'
        },
        inquiryTypes: {
          general: 'General Inquiry',
          demo: 'Request Demo',
          sales: 'Sales',
          support: 'Technical Support',
          partnership: 'Partnership'
        },
        submit: 'Send Message',
        submitting: 'Sending...'
      },
      office: {
        title: 'Visit Our Office',
        subtitle: 'Located in the heart of the medical district, our office is designed for healthcare professionals.',
        locationTitle: 'Our Location',
        location: 'Riyadh, Saudi Arabia'
      },
      support: {
        hours: '24/7',
        label: 'Support Available'
      },
      cta: {
        title: 'Let\'s Work Together',
        subtitle: 'Ready to transform your healthcare communication? We\'d love to hear from you.',
        startTrial: 'Start Free Trial',
        viewPricing: 'View Pricing'
      }
    },

    // Privacy Page
    privacy: {
      hero: {
        title: 'Privacy Policy',
        description: 'Your privacy is our priority. Learn how Curenium protects your data and ensures secure communication in healthcare.',
      },
      sections: {
        informationWeCollect: {
          title: 'Information We Collect',
          description: 'We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:',
          items: [
            'Account information (name, email, organization)',
            'Healthcare data you choose to share through our platform',
            'Communication data (messages, files, alerts)',
            'Usage data and device information'
          ]
        },
        howWeUse: {
          title: 'How We Use Your Information',
          description: 'We use the information we collect to:',
          items: [
            'Provide, maintain, and improve our services',
            'Ensure security and compliance in healthcare communications',
            'Process transactions and send related information',
            'Send technical notices, updates, and support messages',
            'Respond to your comments and questions'
          ]
        },
        dataSecurity: {
          title: 'Data Security',
          description: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our platform uses end-to-end encryption for all communications and complies with healthcare data protection standards.'
        },
        dataSharing: {
          title: 'Data Sharing',
          description: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information in the following circumstances:',
          items: [
            'With your explicit consent',
            'To comply with legal obligations',
            'To protect our rights and prevent fraud',
            'With service providers who assist our operations'
          ]
        },
        yourRights: {
          title: 'Your Rights',
          description: 'You have the right to:',
          items: [
            'Access and update your personal information',
            'Request deletion of your data',
            'Opt out of certain data processing',
            'Request data portability'
          ]
        },
        contactUs: {
          title: 'Contact Us',
          description: 'If you have any questions about this Privacy Policy, please contact us at:',
          contactInfo: 'Email: support@plannorium.com\nAddress: [Your Address Here]'
        }
      }
    },

    // Terms Page
    terms: {
      hero: {
        title: 'Terms of Service',
        description: 'Please read these terms carefully before using Curenium. By using our service, you agree to be bound by these terms.',
      },
      sections: {
        acceptanceOfTerms: {
          title: 'Acceptance of Terms',
          description: 'By accessing and using Curenium, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        useLicense: {
          title: 'Use License',
          description: 'Permission is granted to temporarily use Curenium for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:',
          restrictions: [
            'Modify or copy the materials',
            'Use the materials for any commercial purpose or for any public display',
            'Attempt to decompile or reverse engineer any software contained on our platform',
            'Remove any copyright or other proprietary notations from the materials'
          ]
        },
        userResponsibilities: {
          title: 'User Responsibilities',
          description: 'As a user of Curenium, you agree to:',
          responsibilities: [
            'Use the service only for lawful purposes',
            'Maintain the confidentiality of your account credentials',
            'Respect patient privacy and healthcare regulations',
            'Report any security concerns or unauthorized use',
            'Not share access with unauthorized individuals'
          ]
        },
        healthcareCompliance: {
          title: 'Healthcare Compliance',
          description: 'Curenium is designed for healthcare professionals. Users must comply with all applicable healthcare laws, regulations, and standards including GDPR, and local healthcare regulations. The platform is not a substitute for professional medical advice or emergency services.'
        },
        serviceAvailability: {
          title: 'Service Availability',
          description: 'We strive to provide continuous service but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the service with or without notice. We shall not be liable for any interruption or cessation of service.'
        },
        limitationOfLiability: {
          title: 'Limitation of Liability',
          description: 'In no event shall Curenium or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the service, even if Curenium has been notified orally or in writing of the possibility of such damage.'
        },
        contactInformation: {
          title: 'Contact Information',
          description: 'If you have any questions about these Terms of Service, please contact us at support@plannorium.com.'
        }
      }
    },

    // Compliance Page
    compliance: {
      hero: {
        title: 'Compliance & Security',
        description: 'Curenium is committed to maintaining the highest standards of security and compliance in healthcare communications.',
      },
      sections: {
        regulatoryCompliance: {
          title: 'Regulatory Compliance',
          description: 'Curenium complies with major healthcare regulations and standards:',
          items: [
            'GDPR (General Data Protection Regulation)',
            'HITECH (Health Information Technology for Economic and Clinical Health)',
            'Local healthcare regulations in the Gulf region'
          ]
        },
        securityMeasures: {
          title: 'Security Measures',
          description: 'Our platform implements comprehensive security measures:',
          items: [
            'End-to-end encryption for all communications',
            'Multi-factor authentication',
            'Regular security audits and penetration testing',
            'Data encryption at rest and in transit',
            'Access controls and role-based permissions'
          ]
        },
        dataProtection: {
          title: 'Data Protection',
          description: 'We protect patient data with industry-leading security practices. All data is encrypted, access is logged and monitored, and we maintain strict controls over who can access sensitive information. Regular backups ensure data availability while disaster recovery plans protect against data loss.'
        },
        auditMonitoring: {
          title: 'Audit & Monitoring',
          description: 'Curenium maintains comprehensive audit logs for all activities:',
          items: [
            'User access and authentication events',
            'Data access and modification logs',
            'System and security events',
            'Regular compliance audits'
          ]
        },
        incidentResponse: {
          title: 'Incident Response',
          description: 'We have established incident response procedures to quickly address any security concerns. Our team is available 24/7 to respond to potential security incidents, and we notify affected users and authorities as required by law.'
        },
        certifications: {
          title: 'Certifications',
          description: 'Curenium holds the following certifications:',
          items: [
            'SOC 2 Type II compliance',
            'ISO 27001 certification',
            'Regular third-party security assessments'
          ]
        },
        contactSecurity: {
          title: 'Contact Our Security Team',
          description: 'For security concerns or compliance questions, contact our security team at security@plannorium.com or call our 24/7 security hotline.'
        }
      }
    },

    // Unauthorized Page
    unauthorized: {
      title: 'Access Denied',
      description: 'You do not have permission to access this page. Please contact your administrator or return to the dashboard.',
      status: 'Access Status',
      goToDashboard: 'Go to Dashboard',
      returnHome: 'Return Home',
      helpText: 'Need help? Contact support at support@plannorium.com',
      accessDenied: 'Access Denied',
      needHelp: 'Need help? Contact support at'
    },

    // Footer
    footer: {
      logoAlt: "Curenium Logo",
      description: "Healthcare Communication Platform &bull; Real-time Collaboration &bull; Patient Management",
      tags: {
        realTime: "Real-time",
        secure: "Secure",
        compliant: "Compliant",
      },
      sections: {
        product: "Product",
        company: "Company",
        legal: "Legal",
      },
      links: {
        features: "Features",
        pricing: "Pricing",
        security: "Security",
        about: "About",
        careers: "Careers",
        contact: "Contact",
        privacy: "Privacy",
        terms: "Terms",
        compliance: "Compliance",
      },
      social: {
        twitter: "Twitter",
        linkedin: "LinkedIn",
        instagram: "Instagram",
        facebook: "Facebook",
      },
      copyright: 'All rights reserved.',
    }
  },

  ar: {
    // Common
    welcome: 'أهلاً بعودتك',

    // Auth
    auth: {
      login: {
        title: "سجل الدخول إلى حسابك",
        subtitle: "أهلاً بعودتك إلى كيورينيوم.",
        email: "عنوان البريد الإلكتروني",
        password: "كلمة المرور",
        rememberMe: "تذكرني",
        forgotPassword: "نسيت كلمة المرور؟",
        signIn: "سجل الدخول",
        signingIn: "جاري تسجيل الدخول...",
        orContinueWith: "أو استمر مع",
        google: "جوجل",
        github: "جيت هاب",
        notMember: "لست عضوًا؟",
        signUp: "إنشاء حساب",
        noUserFound: "لم يتم العثور على حساب بهذا البريد الإلكتروني.",
        incorrectPassword: "كلمة مرور غير صحيحة. يرجى المحاولة مرة أخرى.",
        pendingVerification: "حسابك في انتظار التحقق من قبل مسؤول.",
        socialAccountOnly: "يرجى تسجيل الدخول باستخدام حسابك الاجتماعي أو الاتصال بالدعم.",
        invalidCredentials: "بريد إلكتروني أو كلمة مرور غير صحيحة. يرجى المحاولة مرة أخرى.",
        unexpectedError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      },
      accountSetup: {
        title: "أنشئ منظمتك",
        subtitle: "انضم إلى كيورينيوم وبسط اتصال فريقك.",
        fullName: "الاسم الكامل",
        email: "عنوان البريد الإلكتروني",
        password: "كلمة المرور",
        organizationName: "اسم المنظمة",
        createAccount: "إنشاء حساب",
        alreadyHaveAccount: "لديك حساب بالفعل؟",
        signIn: "سجل الدخول",
        registrationError: "حدث خطأ أثناء التسجيل.",
        signInFailed: "فشل تسجيل الدخول بعد التسجيل. يرجى محاولة تسجيل الدخول يدويًا.",
      },
      acceptInvite: {
        title: "قبول الدعوة",
        subtitle: "انضم إلى فريقك على كيورينيوم.",
        fullName: "الاسم الكامل",
        createPassword: "إنشاء كلمة مرور",
        completeRegistration: "إكمال التسجيل",
        goToLogin: "اذهب إلى تسجيل الدخول",
        invalidInviteLink: "رابط دعوة غير صالح.",
        failedToFetchInviteDetails: "فشل في جلب تفاصيل الدعوة.",
        missingInviteToken: "رمز الدعوة مفقود.",
        accountCreatedSuccess: "تم إنشاء الحساب بنجاح! جاري تسجيل دخولك...",
        addedToOrganization: "تم إضافتك إلى المنظمة الجديدة. يرجى تسجيل الدخول للمتابعة.",
        failedToAcceptInvite: "حدث خطأ أثناء قبول الدعوة.",
      },
    },

    // Navigation
    nav: {
      about: 'حول',
      features: 'الميزات',
      pricing: 'الأسعار',
      contact: 'اتصل بنا',
      privacy: 'الخصوصية',
      terms: 'الشروط',
      compliance: 'الامتثال',
      security: 'الأمان',
      careers: 'الوظائف',
      dashboard: 'لوحة التحكم',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
    },

    // Landing Page
    landing: {
      hero: {
        title: 'تمكين فرق الرعاية بالوضوح.',
        subtitle: 'كيورينيوم منصة اتصال آمنة وفي الوقت الفعلي لفرق المستشفيات والأقسام والإدارات. تبسيط التعاون، تعزيز رعاية المرضى، وتقليل أخطاء الاتصال.',
        getStarted: 'ابدأ الآن',
        requestDemo: 'اطلب عرضًا توضيحيًا',
        secureMessaging: 'آمن ومتوافق',
        secureMessagingDesc: 'رسائل آمنة لفرق الرعاية الصحية',
        realTimeUpdates: 'تحديثات فورية',
        realTimeUpdatesDesc: 'اتصال فوري عبر الأقسام',
      },
      features: {
        title: 'مبني لفرق الرعاية الصحية',
        subtitle: 'يجمع كيورينيوم بين الرسائل الآمنة وإدارة المناوبات والتنبيهات الحرجة في منصة بديهية واحدة.',
        secureMessaging: 'الرسائل الآمنة',
        secureMessagingDesc: 'اتصال مشفر من طرف إلى طرف لمناقشات المرضى الحساسة.',
        criticalAlerts: 'التنبيهات الحرجة',
        criticalAlertsDesc: 'تحديد أولويات الاتصالات العاجلة بنظام التنبيهات المدرج.',
        shiftManagement: 'إدارة المناوبات',
        shiftManagementDesc: 'تسليمات سلسة مع جدولة وملاحظات متكاملة.',
        learnMore: 'اعرف المزيد',
      },
      whyCurenium: {
        title: 'لماذا كيورينيوم؟ لأن الرعاية الصحية تستحق الأفضل',
        subtitle: 'لقد كنا جميعًا هناك – مناوبات مستشفيات فوضوية، رسائل مفقودة، والشعور الغرقي عندما يسقط شيء ما. كيورينيوم ليس مجرد تطبيق آخر؛ إنه المهدئ الذي تحتاجه فريقك للحفاظ على سير الأمور بسلاسة دون التوتر. مبني خصيصًا لعالم الرعاية الصحية السريع الإيقاع، يحول الكوارث المحتملة إلى لحظات "لا مشكلة".',
        savesLives: 'كلام حقيقي: ينقذ الأرواح',
        savesLivesDesc: 'نعم، يبدو دراميًا، لكن الاتصال الأسرع ينقذ الأرواح حقًا. يلاحظ الممرضون المشاكل ويحصل الأطباء على الدعم فورًا. لا مزيد من أنظمة النداء القديمة أو الصراخ في الممرات. تخرج التنبيهات الحرجة إلى الجميع مرة واحدة، تشمل تغييرات المناوبات جميع التفاصيل، ويتم مشاركة معلومات المرضى في الوقت الفعلي. هذا يقلل من الأخطاء، يسرع الرعاية، ويمكن أن يحدث فرقًا حقيقيًا عندما يكون الوقت حاسمًا.',
        busyPeople: 'مبني للأشخاص المشغولين',
        busyPeopleDesc: 'متخصصو الرعاية الصحية مشغولون دائمًا – التعامل مع المرضى، الأوراق، الطوارئ. يفهم كيورينيوم ذلك. سهل الاستخدام، لا منحنى تعلم، لا قوائم مربكة. دردشة، أرسل تنبيهات، أدر المناوبات كلها في مكان واحد. يعمل التطبيق المحمول أثناء التنقل، الإشعارات مفيدة لا مزعجة، ويبقى كل شيء متزامنًا. من يحتاج برمجيات معقدة عندما تكون مرهقًا بالفعل؟',
        gulfReady: 'جاهز لمنطقة الخليج',
        gulfReadyDesc: 'نفهم عالم الرعاية الصحية في الخليج – فرق متنوعة، معايير عالية، تحديات فريدة. يدعم كيورينيوم لغاتكم (بما في ذلك العربية) ويتناسب مع ثقافتكم. ليس تطبيقًا عامًا بترجمة سريعة؛ مبني لمستشفيات الخليج، بدعم التقويم الهجري، الامتثال المحلي، والتدفقات التي معناها هنا. يشعر التعاون طبيعيًا، لا مفروضًا.',
        alwaysEvolving: 'دائم التطور',
        alwaysEvolvingDesc: 'يستمر تغير الرعاية الصحية، وكذلك كيورينيوم. نستمع إلى عمال الرعاية الصحية الحقيقيين مثلكم. تضيف التحديثات ميزات جديدة، تحسن الأمان، وتصلح الأمور بناءً على ما يعمل في المستشفيات. يساعد فريق الدعم لدينا أكثر من مجرد الأخطاء – يعطون نصائح لاستخدام المنصة بشكل أفضل. نحن شركاء في هذا، نضمن تطور كيورينيوم مع احتياجاتكم.',
      },
      howItWorks: {
        title: 'كيف يجعل كيورينيوم يومك أسهل',
        subtitle: 'ليس علم صواريخ، لكنه قد يكون كذلك. إليك التفاصيل حول كيف يحول كيورينيوم فوضى الرعاية الصحية إلى شيء قابل للإدارة.',
        step1: 'التسجيل والإعداد',
        step1Desc: 'أعد مستشفىك أو قسمك في دقائق. ادخل فريقك، أنشئ قنوات للأقسام المختلفة، وأنت جاهز. لا صداع تكنولوجيا المعلومات – نحن نتولى العمل الشاق.',
        step2: 'الدردشة والتعاون',
        step2Desc: 'ابدأ الرسائل بشكل آمن. شارك تحديثات المرضى، رتب الرعاية، واحتفظ بجميع الأشخاص في الحلقة. إنه مثل الدردشة الجماعية، لكن لإنقاذ الأرواح – مع التشفير من طرف إلى طرف وجميع المميزات.',
        step3: 'التعامل مع التنبيهات والمناوبات',
        step3Desc: 'تنبيهات حرجة؟ بوم – إشعارات فورية. تسليمات المناوبات؟ ملاحظات وجداول زمنية سلسة. يدمج كيورينيوم كل شيء حتى تتمكن من التركيز على ما يهم: رعاية المرضى.',
      },
      cta: {
        title: 'جاهز لتحويل اتصالات الرعاية الصحية الخاصة بك؟',
        subtitle: 'انضم إلى المستشفيات عبر منطقة الخليج التي تستخدم بالفعل كيورينيوم لتحسين رعاية المرضى من خلال التواصل الأفضل بين الفرق.',
        requestDemo: 'اطلب عرضًا توضيحيًا',
        contactSales: 'اتصل بالمبيعات',
      },
      chatDemo: {
        title: 'دردشة قسم الطوارئ',
        live: 'مباشر',
        doctorInitials: 'د',
        nurseInitials: 'أ',
        doctorMessage: 'المريض في الغرفة 302 يحتاج إلى انتباه فوري. ضغط الدم ينخفض.',
        nurseMessage: 'أنا في طريقي مع عربة الإنعاش. الوقت المقدر 30 ثانية.',
        doctorName: 'د. رحمن',
        nurseName: 'أنت',
        timeAgo: 'منذ دقيقتين',
        justNow: 'الآن',
        criticalAlert: 'تم إرسال التنبيه الحرج',
        placeholder: 'اكتب رسالتك...',
      },
      howItWorksChatDemo: {
        title: 'تنسيق الفريق',
        active: 'نشط',
        nurseInitials: 'م',
        doctorInitials: 'د',
        nurseMessage: 'اكتمل تسليم الوردية. المريض في 204 يحتاج إلى فحص العلامات الحيوية كل ساعتين.',
        doctorMessage: 'فهمت. سأتولى الأمر. أي ملاحظات أخرى؟',
        nurseName: 'الممرضة سارة',
        doctorName: 'د. أحمد',
        timeAgo: 'منذ 5 دقائق',
        justNow: 'الآن',
        shiftComplete: 'اكتمل تسليم الوردية',
      },
    },

    // About Page
    about: {
      title: 'حول كيورينيوم',
      subtitle: 'يحدث كيورينيوم ثورة في اتصال الرعاية الصحية من خلال سد الفجوات الحرجة التي ابتليت بها الفرق الطبية لفترة طويلة. ولد من تحديات الرعاية الصحية الحقيقية ومدعوم بتكنولوجيا متطورة، نحن نبني منصة شاملة تحول الاتصال المجزأ إلى تعاون سلس. مهمتنا هي تمكين متخصصي الرعاية الصحية بأدوات ذكية تعزز رعاية المرضى، تبسط التدفقات، وتنقذ الأرواح في النهاية من خلال تنسيق أفضل واتخاذ قرارات أسرع في البيئات عالية المخاطر.',
      stats: {
        team: 'أعضاء فريق خبراء',
        partners: 'شركاء رعاية صحية بيتا',
        workflows: 'تدفقات عمل الرعاية الصحية المعينة',
      },
      betaText: 'في اختبار البيتا مع شركاء الرعاية الصحية، يقدم كيورينيوم اتصالًا فوريًا وآمنًا للتحديثات الحرجة والتنبيهات الطارئة. ينقذ منصتنا الأرواح من خلال القضاء على حواجز الاتصال، مع وجود الأطباء في قلب كل قرار.',
      revolutionizing: 'ثورة في اتصال الرعاية الصحية',
      revolutionizingDesc: 'تأسست في 2025، ظهر كيورينيوم من رؤية لسد فجوات الاتصال في الرعاية الصحية. تجمع بلانوريوم محترفين موهوبين من جميع أنحاء العالم، من الشرق الأوسط وأفريقيا إلى أوروبا وآسيا والأمريكتين. يمثل فريقنا المتنوع مستقبل تكنولوجيا الرعاية الصحية، حيث تلتقي المنظورات العالمية بالرعاية الرحيمة والابتكار. مبني كيورينيوم لمتخصصي الرعاية الصحية الذين يطالبون بالتميز. تجمع منصتنا بين التعاون في الوقت الفعلي، إدارة المرضى الذكية، وأدوات الاتصال السلسة لتمكين الفرق الطبية وتحسين نتائج المرضى.',
      overviewFeatures: {
        title: 'ميزات كيورينيوم',
        description: 'يجمع كيورينيوم بين التعاون في الوقت الفعلي، وإدارة المرضى الذكية، والتنبيهات الذكية لتمكين الفرق الطبية وتحسين نتائج المرضى.',
        realTime: 'التعاون في الوقت الفعلي',
        realTimeDesc: 'الرسائل الفورية وتنسيق الفريق',
        patient: 'إدارة المرضى',
        patientDesc: 'سجلات صحية إلكترونية شاملة وتتبع المرضى',
        alerts: 'التنبيهات الذكية',
        alertsDesc: 'الإشعارات الذكية وأتمتة التدفقات',
        learnMore: 'اعرف المزيد عن ميزاتنا'
      },
      tags: {
        secure: 'الرسائل الآمنة',
        patientCentric: 'التصميم المريض المحور',
        enterprise: 'أمان المؤسسات',
      },
      mission: {
        title: 'مهمتنا',
        desc: 'ثورة في اتصال الرعاية الصحية من خلال توفير أدوات ذكية وآمنة وبديهية لمتخصصي الرعاية الصحية تعزز رعاية المرضى وتعاون الفريق.',
      },
      vision: {
        title: 'رؤيتنا',
        desc: 'أن نصبح المعيار العالمي لمنصات اتصال الرعاية الصحية، تمكين المتخصصين الطبيين في جميع أنحاء العالم بأدوات تنقذ الأرواح وتحسن نتائج الرعاية الصحية.',
      },
      values: {
        title: 'قيمنا',
        subtitle: 'المبادئ التي توجه كل ما نفعله وكل منتج نبنيه.',
        missionDriven: 'مدفوع بالمهمة',
        missionDrivenDesc: 'نحن موجودون لتحسين نتائج الرعاية الصحية من خلال حلول التكنولوجيا المبتكرة.',
        innovation: 'الابتكار أولاً',
        innovationDesc: 'ندفع الحدود باستمرار لتقديم حلول رعاية صحية متطورة.',
        humanCentered: 'مركز على الإنسان',
        humanCenteredDesc: 'كل قرار نتخذه يعطي الأولوية لاحتياجات متخصصي الرعاية الصحية والمرضى.',
        excellence: 'التميز',
        excellenceDesc: 'نحافظ على أعلى المعايير في كل ما نبني ونقدم.',
      },
      globalPresence: {
        title: 'حضور عالمي، تأثير محلي',
        subtitle: 'يمتد فريقنا عبر القارات، يجلب منظورات متنوعة وخبرة في ابتكار الرعاية الصحية.',
        universal: 'عالمي',
        universalDesc: 'مع حضور قوي في الشرق الأوسط وأفريقيا، نقدم حلولًا محلية من خلال فهم الاحتياجات الإقليمية.',
        globalNetwork: 'الشبكة العالمية',
        globalNetworkDesc: 'وصول ممتد مع المتعاونين والشركاء عبر أوروبا وآسيا والأمريكتين، ضمان التأثير الصحي العالمي.',
      },
      teamDiversity: {
        title: 'منظورات متنوعة، مهمة موحدة',
        subtitle: 'يجمع فريقنا العالمي خبراء الرعاية الصحية والمهندسين والمصممين والمبتكرين من خلفيات متنوعة.',
        healthcare: 'خبراء الرعاية الصحية',
        healthcareDesc: 'الأطباء والممرضون ومديرو الرعاية الصحية يجلبون الخبرة السريرية والرؤى الحقيقية.',
        engineers: 'مهندسو البرمجيات',
        engineersDesc: 'مطورو الويب الكامل والمهندسون المعماريون من شركات التكنولوجيا الكبرى، متخصصون في أنظمة الرعاية الصحية.',
        designers: 'مصممو تجربة المستخدم',
        designersDesc: 'مصممون إبداعيون يركزون على واجهات الرعاية الصحية البديهية والقابلة للوصول التي تنقذ الأرواح.',
        innovators: 'مبتكرو المنتجات',
        innovatorsDesc: 'مفكرون استراتيجيون ومديرو منتجات يقودون ابتكار الرعاية الصحية وتجربة المستخدم.',
      },
      advantage: {
        title: 'ميزة كيورينيوم',
        subtitle: 'نحن نبني منصة تضع معايير جديدة في تكنولوجيا الرعاية الصحية، مع التركيز على الأمان والأداء والاستخدام.',
        security: 'أمان المؤسسات',
        securityDesc: 'حماية بيانات المرضى بتشفير متطور وامتثال لمعايير الخصوصية العالمية.',
        technology: 'مجموعة التكنولوجيا الحديثة',
        technologyDesc: 'مبني على بنية سحابية أصلية قابلة للتوسع لضمان الموثوقية والأداء والجاهزية المستقبلية.',
        design: 'التصميم المركز على الطبيب',
        designDesc: 'تم تطويره بالتعاون الوثيق مع متخصصي الرعاية الصحية لإنشاء تدفقات عمل بديهية وفعالة.',
      },
      joinMission: {
        title: 'انضم إلى مهمتنا',
        subtitle: 'نحن لا نوظف بنشاط الآن، لكننا نبحث دائمًا عن أفراد متحمسين للانضمام إلى مهمتنا. لا تتردد في إرسال سيرتك الذاتية!',
        sendResume: 'أرسل سيرتك الذاتية',
      },
      cta: {
        title: 'جاهز لتحويل الرعاية الصحية؟',
        subtitle: 'انضم إلينا في مهمتنا لتحسين اتصال الرعاية الصحية وإنقاذ الأرواح.',
        contactUs: 'اتصل بنا',
        requestDemo: 'اطلب عرضًا توضيحيًا',
      },
    },

    // Careers Page
    careers: {
      hero: {
        title: 'انضم إلى مهمتنا',
        subtitle: 'ساعدنا في بناء مستقبل اتصال الرعاية الصحية',
        description: 'نبحث عن أفراد متحمسين يريدون إحداث تأثير حقيقي في تكنولوجيا الرعاية الصحية. انضم إلى فريقنا المتنوع من المبتكرين وخبراء الرعاية الصحية وقادة التكنولوجيا.',
      },
      whyJoin: {
        title: 'لماذا تنضم إلى كيورينيوم',
        subtitle: 'نحن لسنا مجرد شركة تكنولوجيا أخرى. نحن نبني حلول تنقذ الأرواح وتحسن نتائج الرعاية الصحية.',
      },
      benefits: {
        health: {
          title: 'الصحة والعافية',
          description: 'تأمين صحي شامل، دعم الصحة النفسية، وبرامج العافية'
        },
        flexible: {
          title: 'العمل المرن',
          description: 'ثقافة العمل عن بعد أولاً مع ساعات مرنة وإجازة غير محدودة'
        },
        learning: {
          title: 'التعلم والتطوير',
          description: 'حضور المؤتمرات، الدورات عبر الإنترنت، وميزانية التطوير المهني'
        },
        compensation: {
          title: 'تعويض تنافسي',
          description: 'رواتب رائدة في السوق، مشاركة في الأسهم، ومكافآت الأداء'
        },
        culture: {
          title: 'ثقافة تعاونية',
          description: 'فريق متنوع وشامل مع لقاءات افتراضية وشخصية منتظمة'
        },
        innovation: {
          title: 'تركيز على الابتكار',
          description: 'العمل على تكنولوجيا الرعاية الصحية المتطورة التي تحدث تأثيرًا حقيقيًا'
        }
      },
      openPositions: {
        title: 'الوظائف المتاحة',
        subtitle: 'ابحث عن فرصتك التالية للعمل على مشاريع ذات معنى تحدث فرقًا في الرعاية الصحية.',
        comingSoon: 'الوظائف المتاحة قريبًا',
        comingSoonDesc: 'نحن نبني فريقنا بنشاط وسننشر فرصًا مثيرة في تكنولوجيا الرعاية الصحية، تطوير البرمجيات، وتصميم المنتجات.',
        resumeText: 'إذا كنت متحمسًا لابتكار الرعاية الصحية وتريد أن تكون جزءًا من مهمتنا، نود أن نسمع منك. أرسل لنا سيرتك الذاتية عبر البريد وأخبرنا لماذا ستكون مناسبًا رائعًا.',
      },
      culture: {
        title: 'ثقافتنا',
        subtitle: 'نؤمن بتعزيز بيئة يزدهر فيها الابتكار، يكون التعاون طبيعيًا، ويشعر كل عضو في الفريق بالتقدير والتمكين.',
        innovation: {
          title: 'الابتكار أولاً',
          description: 'نشجع التفكير الإبداعي ونوفر الموارد اللازمة لتحويل الأفكار الجريئة إلى واقع. لدى أعضاء فريقنا الحرية في التجربة والتعلم من النجاحات والإخفاقات.'
        },
        workLife: {
          title: 'توازن العمل والحياة',
          description: 'نفهم أن العمل الرائع يأتي من أفراد سعداء وأصحاء. لذلك نقدم ترتيبات عمل مرنة ونعطي الأولوية لرفاهية فريقنا.'
        },
        learning: {
          title: 'التعلم المستمر',
          description: 'التكنولوجيا تتطور بسرعة، وكذلك نحن. نستثمر في التطوير المهني لفريقنا من خلال المؤتمرات والدورات والفرص التعليمية العملية.'
        },
        values: {
          title: 'ما نقدره',
          collaboration: 'التعاون',
          collaborationDesc: 'نعمل معًا، نشارك المعرفة، وندعم بعضنا البعض',
          excellence: 'التميز',
          excellenceDesc: 'نسعى لأعلى جودة في كل ما نفعله',
          empathy: 'التعاطف',
          empathyDesc: 'نفهم مستخدمينا ونبني بالرحمة'
        }
      },
      cta: {
        title: 'جاهز لإحداث تأثير؟',
        subtitle: 'انضم إلى فريقنا وساعدنا في تحويل اتصال الرعاية الصحية.',
        viewPositions: 'عرض الوظائف المتاحة',
        contactUs: 'اتصل بنا'
      }
    },

    // Features Page
    features: {
      hero: {
        title: 'ميزات قوية للرعاية الصحية الحديثة',
        subtitle: 'مجموعة شاملة من الأدوات المصممة لفرق الرعاية الصحية',
        description: 'اكتشف كيف تحول مجموعة كيورينيوم الشاملة من الميزات اتصال الرعاية الصحية وإدارة رعاية المرضى.',
      },
      coreFeatures: {
        realTimeCommunication: {
          title: 'الاتصال في الوقت الفعلي',
          description: 'رسائل آمنة ومتوافقة مع إشعارات فورية عبر جميع الأقسام والأجهزة.',
          features: ['تشفير من طرف إلى طرف', 'مزامنة متعددة الأجهزة', 'مشاركة الملفات والمرفقات']
        },
        criticalAlerts: {
          title: 'نظام التنبيهات الحرجة',
          description: 'نظام تنبيهات مدرج يضمن وصول الاتصالات العاجلة إلى الأشخاص المناسبين فورًا.',
          features: ['إشعارات مبنية على الأولوية', 'إشعارات دفع ورسائل نصية', 'تدفقات عمل التصعيد']
        },
        ehrSystem: {
          title: 'نظام السجلات الصحية الإلكترونية الكامل',
          description: 'سجلات صحية إلكترونية شاملة مع إدارة المرضى وتتبع العلامات الحيوية والملاحظات السريرية.',
          features: ['ملفات المرضى والتاريخ', 'مراقبة العلامات الحيوية', 'التوثيق السريري']
        },
        shiftManagement: {
          title: 'إدارة المناوبات',
          description: 'تسليمات مناوبات سلسة مع جدولة متكاملة وملاحظات وتحديثات حالة المرضى.',
          features: ['جدولة آلية', 'ملاحظات التسليم', 'تنسيق الموظفين']
        },
        labIntegration: {
          title: 'تكامل المختبر',
          description: 'إدارة طلبات المختبر المبسطة مع تتبع النتائج في الوقت الفعلي وإشعارات آلية.',
          features: ['تتبع الطلبات', 'إشعارات النتائج', 'ضمان الجودة']
        },
        complianceSecurity: {
          title: 'الامتثال والأمان',
          description: 'أمان على مستوى المؤسسات مع امتثال أمني كامل ومسارات تدقيق شاملة.',
          features: ['آمن ومشفر', 'تسجيل التدقيق', 'تشفير البيانات']
        }
      },
      dashboards: {
        title: 'لوحات التحكم المبنية على الأدوار',
        subtitle: 'واجهات مخصصة لكل متخصص في الرعاية الصحية، من الأطباء إلى الإداريين.',
        operational: {
          pharmacy: {
            title: 'لوحة تحكم الصيدلة',
            badge: 'عرض توضيحي مباشر',
            metrics: {
              activeRx: 'وصفات نشطة',
              completed: 'مكتملة',
              cancelled: 'ملغاة',
              totalRx: 'إجمالي الوصفات'
            },
            table: {
              patient: 'المريض',
              medication: 'الدواء',
              dose: 'الجرعة',
              status: 'الحالة'
            },
            data: {
              patients: [
                { name: 'جون سميث', medication: 'أموكسيسيلين 500 مجم', dose: '500 مجم', status: 'نشط' },
                { name: 'سارة جونسون', medication: 'ليسينوبريل 10 مجم', dose: '10 مجم', status: 'مكتمل' },
                { name: 'مايك ديفيس', medication: 'ميتفورمين 1000 مجم', dose: '1000 مجم', status: 'نشط' }
              ]
            }
          },
          lab: {
            title: 'لوحة تحكم المختبر',
            badge: 'نتائج الاختبارات',
            metrics: {
              testsToday: 'اختبارات اليوم',
              completed: 'مكتملة',
              pending: 'معلقة',
              critical: 'حرجة'
            },
            table: {
              patient: 'المريض',
              testType: 'نوع الاختبار',
              status: 'الحالة',
              result: 'النتيجة'
            },
            data: {
              patients: [
                { name: 'إيما ويلسون', testType: 'CBC كامل', status: 'طبيعي', result: 'مكتمل' },
                { name: 'ديفيد براون', testType: 'لوحة الدهون', status: 'غير طبيعي', result: 'مكتمل' },
                { name: 'ليزا تشين', testType: 'وظيفة الغدة الدرقية', status: 'معلق', result: 'قيد التقدم' }
              ]
            }
          },
          reception: {
            title: 'لوحة تحكم الاستقبال',
            badge: 'تدفق المرضى',
            metrics: {
              waiting: 'في الانتظار',
              inRoom: 'في الغرفة',
              checkedOut: 'تم الخروج',
              noShow: 'لم يحضر'
            },
            table: {
              patient: 'المريض',
              appointment: 'الموعد',
              status: 'الحالة',
              room: 'الغرفة'
            },
            data: {
              patients: [
                { name: 'آنا مارتينيز', appointment: '10:00 صباحًا', status: 'في الغرفة', room: '204' },
                { name: 'روبرت لي', appointment: '10:30 صباحًا', status: 'في الانتظار', room: '-' },
                { name: 'ماريا غارسيا', appointment: '11:00 صباحًا', status: 'تم الدخول', room: '-' }
              ]
            }
          }
        },
        clinical: {
          nursing: {
            title: 'لوحة تحكم التمريض',
            badge: 'تدفق العمل الرعائي',
            workflowSteps: ['التقييم', 'المراقبة', 'الأدوية', 'التوثيق', 'تخطيط الرعاية'],
            sections: {
              vitalSigns: 'العلامات الحيوية',
              currentMedications: 'الأدوية الحالية'
            },
            vitals: {
              bloodPressure: 'ضغط الدم',
              heartRate: 'معدل ضربات القلب',
              temperature: 'درجة الحرارة'
            },
            medications: [
              'أموكسيسيلين 500 مجم - 3 مرات يوميًا',
              'إيبوبروفين 400 مجم - حسب الحاجة',
              'فيتامين د 1000 وحدة - يوميًا'
            ]
          },
          physician: {
            title: 'لوحة تحكم الطبيب',
            badge: 'تدفق العمل الطبي',
            workflowSteps: ['التقييم', 'التشخيص', 'الوصفة', 'التوثيق', 'المتابعة'],
            sections: {
              recentDiagnoses: 'التشخيصات الأخيرة',
              upcomingAppointments: 'المواعيد القادمة'
            },
            diagnoses: [
              'عدوى الجهاز التنفسي العلوي',
              'ارتفاع ضغط الدم (المرحلة 1)',
              'نقص فيتامين د'
            ],
            appointments: [
              'متابعة: 15 ديسمبر، 2:00 مساءً',
              'مراجعة المختبر: 20 ديسمبر، 10:00 صباحًا',
              'استشارة: 22 ديسمبر، 3:30 مساءً'
            ]
          },
          sales: {
            title: 'لوحة تحكم المبيعات والتواصل',
            badge: 'إدارة العملاء المحتملين',
            metrics: {
              activeLeads: 'عملاء محتملون نشطون',
              converted: 'محولون',
              meetings: 'اجتماعات',
              pipeline: 'خط الأنابيب'
            },
            table: {
              organization: 'المنظمة',
              contact: 'الاتصال',
              status: 'الحالة',
              value: 'القيمة'
            },
            data: {
              leads: [
                { organization: 'مستشفى المدينة العام', contact: 'د. سارة ميتشل', status: 'عرض توضيحي مجدول', value: '850 ألف دولار' },
                { organization: 'المركز الطبي الإقليمي', contact: 'المدير جونسون', status: 'عقد موقع', value: '1.2 مليون دولار' },
                { organization: 'عيادة الرعاية الصحية المجتمعية', contact: 'مديرة الممرضات لي', status: 'اقتراح مرسل', value: '350 ألف دولار' }
              ]
            }
          }
        },
        administrative: {
          admin: {
            title: 'لوحة تحكم الإدارة',
            badge: 'نظرة عامة على النظام',
            metrics: {
              activeUsers: 'المستخدمون النشطون',
              uptime: 'وقت التشغيل',
              dataProcessed: 'البيانات المعالجة',
              activeSessions: 'الجلسات النشطة'
            },
            table: {
              systemComponent: 'مكون النظام',
              status: 'الحالة',
              performance: 'الأداء',
              lastCheck: 'آخر فحص'
            },
            data: {
              components: [
                { component: 'خادم قاعدة البيانات', status: 'صحي', performance: '98% CPU', lastCheck: 'منذ دقيقتين' },
                { component: 'بوابة API', status: 'صحي', performance: '45ms زمن الاستجابة', lastCheck: 'منذ دقيقة' },
                { component: 'نظام النسخ الاحتياطي', status: 'يعمل', performance: '2.1 جيجابايت/ساعة', lastCheck: 'منذ 5 دقائق' }
              ]
            }
          },
          analytics: {
            title: 'لوحة تحكم التحليلات',
            badge: 'مقاييس الأداء',
            metrics: {
              patientSatisfaction: 'رضا المرضى',
              avgResponseTime: 'متوسط وقت الاستجابة',
              taskCompletion: 'إكمال المهام',
              efficiencyGain: 'زيادة الكفاءة'
            },
            table: {
              department: 'القسم',
              performance: 'الأداء',
              target: 'الهدف',
              trend: 'الاتجاه'
            },
            data: {
              departments: [
                { department: 'غرفة الطوارئ', performance: '96.5%', target: '95%', trend: '↗ +2.1%' },
                { department: 'المختبر', performance: '98.2%', target: '97%', trend: '↗ +1.8%' },
                { department: 'الصيدلة', performance: '97.8%', target: '96%', trend: '↗ +0.9%' }
              ]
            }
          },
          hr: {
            title: 'لوحة تحكم الموارد البشرية والتوظيف',
            badge: 'إدارة القوى العاملة',
            metrics: {
              totalStaff: 'إجمالي الموظفين',
              staffSatisfaction: 'رضا الموظفين',
              openPositions: 'الوظائف الشاغرة',
              avgTrainingHours: 'متوسط ساعات التدريب'
            },
            table: {
              department: 'القسم',
              staffCount: 'عدد الموظفين',
              utilization: 'الاستخدام',
              trainingStatus: 'حالة التدريب'
            },
            data: {
              departments: [
                { department: 'التمريض', staffCount: '89', utilization: '94%', trainingStatus: 'مكتمل' },
                { department: 'الأطباء', staffCount: '34', utilization: '87%', trainingStatus: 'قيد التقدم' },
                { department: 'الإدارة', staffCount: '22', utilization: '91%', trainingStatus: 'مكتمل' }
              ]
            }
          }
        }
      },
      cta: {
        title: 'جاهز لتحويل سير عملك؟',
        subtitle: 'اختبر ميزات كيورينيوم القوية في العمل.',
        startTrial: 'ابدأ التجربة المجانية',
        contactSales: 'اتصل بالمبيعات'
      }
    },

    // Pricing Page
    pricing: {
      hero: {
        title: 'أسعار بسيطة وشفافة',
        subtitle: 'اختر الخطة التي تناسب مؤسسة الرعاية الصحية الخاصة بك',
        description: 'أسعار مرنة مصممة للمستشفيات بجميع الأحجام، من العيادات الصغيرة إلى شبكات الرعاية الصحية الكبيرة.',
      },
      billing: {
        monthly: 'شهريًا',
        yearly: 'سنويًا',
        save12: 'وفر 12%',
      },
      plans: {
        basic: {
          name: 'أساسي',
          description: 'اتصال أساسي ووصول للسجلات الصحية الإلكترونية للمستشفيات الحساسة للأسعار',
          features: [
            'رسائل آمنة وتنبيهات',
            'عرض أساسي للسجلات الصحية الإلكترونية وسجلات المرضى',
            'جدولة المواعيد',
            'تقارير أساسية',
            'دعم عبر البريد الإلكتروني',
            'وصول تطبيق الهاتف المحمول'
          ],
          limitations: [
            'لا توجد ميزات سجلات صحية إلكترونية متقدمة',
            'تكاملات محدودة',
            'تحليلات أساسية فقط',
            'ساعات دعم قياسية'
          ]
        },
        pro: {
          name: 'احترافي',
          description: 'حل كامل لمعظم المستشفيات - موصى به للرعاية المثلى',
          features: [
            'جميع ميزات الأساسي',
            'نظام سجلات صحية إلكترونية كامل',
            'رسائل وتنبيهات متقدمة',
            'تكامل المختبر',
            'تحليلات متقدمة',
            'دعم ذو أولوية',
            'تكاملات مخصصة',
            'وصول API'
          ],
          limitations: [
            'لا توجد خيارات علامة بيضاء',
            'لا يوجد دعم مخصص'
          ]
        },
        enterprise: {
          name: 'مؤسسي',
          description: 'حل شامل الميزات للمستشفيات الكبيرة وشبكات الرعاية الصحية',
          features: [
            'جميع ميزات الاحترافي',
            'مستخدمون غير محدودين',
            'رؤى مدعومة بالذكاء الاصطناعي',
            'حل علامة بيضاء',
            'دعم مخصص 24/7',
            'تطوير مخصص',
            'أمان متقدم',
            'أتمتة الامتثال',
            'اتفاقية مستوى الخدمة ذات الأولوية'
          ],
          limitations: []
        }
      },
      ui: {
        mostPopular: 'الأكثر شعبية',
        startFreeTrial: 'ابدأ التجربة المجانية',
        getStarted: 'ابدأ الآن',
        whatsIncluded: 'ما هو مشمول',
        limitations: 'القيود',
        perUserMonth: '/مستخدم/شهر',
        billedAnnually: 'تُفوتر سنويًا بـ',
        perUserYear: '/مستخدم/سنة',
        for100Users: 'لـ 100 مستخدم',
        orFlat: 'أو',
        flatUpTo100: 'ثابت (حتى 100 مستخدم)'
      },
      addons: {
        title: 'خدمات إضافية وإضافات',
        subtitle: 'وسع تجربة كيورينيوم الخاصة بك مع خدمات متخصصة وميزات متقدمة.',
        broadcastMessaging: {
          title: 'رسائل البث',
          description: 'تذكيرات المرضى، حملات المواعيد، وإشعارات جماعية.',
          pricing: [
            '10 آلاف رسالة مشمولة مجانًا',
            '10–49 ألف: 299–399 دولار/شهر',
            '50 ألف+: أسعار مخصصة'
          ]
        },
        prioritySupport: {
          title: 'دعم ذو أولوية واتفاقية مستوى الخدمة',
          description: 'دعم مخصص 24/7 مع أوقات استجابة مضمونة.',
          pricing: [
            '2–5 دولار/مستخدم/شهر',
            'أو خيارات رسوم ثابتة',
            'اتفاقية مستوى الخدمة 99.9% وقت التشغيل'
          ]
        },
        implementation: {
          title: 'التنفيذ والتدريب',
          description: 'إعداد احترافي، تكامل السجلات الصحية الإلكترونية، وتدريب الفريق.',
          pricing: [
            'تكامل السجلات الصحية الإلكترونية: 1–4 آلاف دولار',
            'التدريب: 500–1.2 ألف دولار/يوم',
            'تتبع النجاح مشمول'
          ]
        },
        pilotProgram: {
          title: 'عرض برنامج الطيار الخاص',
          description: 'جرب كيورينيوم بدون مخاطر مع برنامج الطيار لمدة 3 أشهر. احصل على ميزات مستوى احترافي لما يصل إلى 100 مستخدم بسعر مخفض قدره 1,200 دولار إجمالي (بالإضافة إلى رسوم تكامل بسيطة).',
          learnMore: 'اعرف المزيد'
        }
      },
      faq: {
        title: 'الأسئلة الشائعة',
        subtitle: 'كل ما تحتاج لمعرفته حول أسعار كيورينيوم وميزاته.',
        questions: {
          perUserPricing: {
            question: 'كيف يعمل تسعير كل مستخدم؟',
            answer: 'تدفع بناءً على عدد المستخدمين النشطين في مؤسستك. على سبيل المثال، 100 مستخدم على خطة احترافي سيكون 800 دولار/شهر. يمكن إضافة أو إزالة المستخدمين في أي وقت، ويتم تعديل الفواتير تلقائيًا.'
          },
          flatBundle: {
            question: 'ما الفرق بين تسعير كل مستخدم وحزمة ثابتة؟',
            answer: 'تسعير كل مستخدم يتوسع مع حجم فريقك. تقدم الحزم الثابتة تكاليف قابلة للتنبؤ للمؤسسات حتى 100 مستخدم - ادفع سعرًا ثابتًا واحدًا بغض النظر عن عدد المستخدمين لديك حتى الحد.'
          },
          planChanges: {
            question: 'هل يمكنني تغيير الخطط في أي وقت؟',
            answer: 'نعم، يمكنك ترقية أو خفض الخطة في أي وقت. تدخل التغييرات حيز التنفيذ فورًا، وسنقوم بتعديل الرسوم. بالنسبة للحزم الثابتة، يمكنك التبديل إلى تسعير كل مستخدم إذا تغيرت احتياجاتك.'
          },
          freeTrial: {
            question: 'هل هناك تجربة مجانية؟',
            answer: 'نعم! نقدم تجربة مجانية لمدة 14 يومًا لجميع الخطط. لا يتطلب بطاقة ائتمان للبدء. اتصل بالمبيعات لبرامج الطيار مع فترات تجريبية ممتدة.'
          },
          implementationCosts: {
            question: 'ماذا عن تكاليف التنفيذ والتدريب؟',
            answer: 'يبدأ تكامل السجلات الصحية الإلكترونية من 1,000–4,000 دولار حسب التعقيد. تتراوح حزم التدريب من 500–1,200 دولار يوميًا. نقدم أيضًا تنفيذًا قائمًا على النجاح مع تتبع العائد على الاستثمار والدعم المستمر.'
          },
          annualDiscounts: {
            question: 'هل تقدمون خصومات سنوية؟',
            answer: 'نعم! يشمل الفوترة السنوية خصمًا بنسبة 12%. نقدم أيضًا خصومات 18-20% لالتزامات مدتها عامين، مما يجعل التخطيط طويل الأمد أكثر فعالية من حيث التكلفة.'
          }
        }
      },
      cta: {
        title: 'جاهز للبدء؟',
        subtitle: 'انضم إلى مئات المؤسسات الصحية التي تستخدم كيورينيوم بالفعل.',
        startPilot: 'ابدأ برنامج الطيار',
        viewCalculator: 'عرض حاسبة الأسعار'
      }
    },

    // Security Page
    security: {
      hero: {
        title: 'أمان المؤسسات',
        subtitle: 'بياناتك محمية بأعلى معايير الأمان',
        description: 'نطبق تدابير أمان شاملة لحماية بيانات المرضى وضمان الامتثال للوائح الرعاية الصحية.',
      },
      features: {
        endToEndEncryption: {
          title: 'التشفير من طرف إلى طرف',
          description: 'جميع البيانات مشفرة أثناء النقل وعند الراحة باستخدام تشفير AES-256 القياسي في الصناعة.',
          details: [
            'TLS 1.3 لبيانات أثناء النقل',
            'تشفير AES-256 عند الراحة',
            'هندسة معرفة صفرية'
          ]
        },
        secureInfrastructure: {
          title: 'البنية التحتية الآمنة',
          description: 'مبنية على بنية تحتية سحابية من مستوى المؤسسات مع طبقات متعددة من الأمان.',
          details: [
            'متوافق مع SOC 2 Type II',
            'معتمد ISO 27001',
            'عمليات تدقيق أمني منتظمة'
          ]
        },
        accessControl: {
          title: 'التحكم في الوصول',
          description: 'يضمن التحكم في الوصول المبني على الأدوار أن يرى المستخدمون فقط البيانات التي يحتاجون إلى الوصول إليها.',
          details: [
            'المصادقة متعددة العوامل',
            'الأذونات المبنية على الأدوار',
            'تسجيل التدقيق'
          ]
        },
        dataProtection: {
          title: 'حماية البيانات',
          description: 'تدابير شاملة لحماية البيانات تحمي معلومات المرضى.',
          details: [
            'النسخ الاحتياطية المنتظمة',
            'إخفاء هوية البيانات',
            'التخلص الآمن من البيانات'
          ]
        },
        privacyByDesign: {
          title: 'الخصوصية حسب التصميم',
          description: 'يتم بناء اعتبارات الخصوصية في كل ميزة وعملية.',
          details: [
            'جمع البيانات الأدنى',
            'إدارة موافقة المستخدم',
            'قابلية نقل البيانات'
          ]
        },
        threatDetection: {
          title: 'كشف التهديدات',
          description: 'أنظمة مراقبة وكشف تهديدات متقدمة تحمي من الحوادث الأمنية.',
          details: [
            'المراقبة في الوقت الفعلي',
            'التنبيهات الآلية',
            'خطة استجابة الحوادث'
          ]
        }
      },
      standards: {
        title: 'معايير الأمان والامتثال',
        subtitle: 'نلتزم بأعلى معايير الأمان ونخضع بانتظام لعمليات تدقيق مستقلة لضمان بقاء بياناتك محمية.',
        certifications: {
          soc2: {
            title: 'SOC 2 Type II',
            description: 'معايير خدمات الثقة للأمان والتوفر والسرية'
          },
          iso27001: {
            title: 'ISO 27001',
            description: 'المعيار الدولي لإدارة أمن المعلومات'
          },
          gdpr: {
            title: 'GDPR',
            description: 'امتثال اللائحة العامة لحماية البيانات'
          },
          aes256: {
            title: 'AES-256',
            description: 'المعيار المتقدم للتشفير لحماية البيانات'
          }
        }
      },
      cta: {
        title: 'أمان يمكنك الوثوق به',
        subtitle: 'تعرف على المزيد عن تدابير الأمان والشهادات الامتثالية لدينا.',
        getStarted: 'ابدأ',
        securityInquiry: 'استفسار الأمان'
      }
    },

    // Contact Page
    contact: {
      hero: {
        title: 'تواصل معنا',
        subtitle: 'نحن هنا لمساعدتك في تحويل اتصال الرعاية الصحية الخاصة بك',
        description: 'لديك أسئلة حول كيورينيوم؟ تريد جدولة عرض توضيحي؟ فريقنا جاهز لمساعدتك على البدء.',
      },
      demo: {
        title: 'احجز مكالمة عرض توضيحي مجانية',
        subtitle: 'شاهد كيورينيوم في العمل! جدول مكالمة عرض توضيحي مخصصة مع خبراء الرعاية الصحية لدينا. سنوضح لك كيف يمكن لكيورينيوم تحويل سير عمل الاتصال في الرعاية الصحية.',
        scheduleDemo: 'جدول مكالمة العرض التوضيحي',
        viewFeatures: 'عرض الميزات',
        duration: '30 دقيقة',
        durationLabel: 'مدة العرض التوضيحي',
        cost: 'مجاني',
        costLabel: 'بدون تكلفة',
        custom: 'مخصص',
        customLabel: 'مصمم لك'
      },
      contactInfo: {
        email: {
          title: 'راسلنا عبر البريد الإلكتروني',
          details: ['info@plannorium.com', 'support@plannorium.com'],
          description: 'أرسل لنا بريدًا إلكترونيًا وسنرد خلال 24 ساعة.'
        },
        phone: {
          title: 'اتصل بنا',
          details: ['+٢٣٤٨٠٦٨٩٢٦٥٤٧', '+٩٦٦ ٥٣ ١٦٦ ٥٠٢١'],
          description: 'متاح لمكالمات العرض التوضيحي والدعم.'
        },
        location: {
          title: 'زورنا',
          details: ['الرياض، المملكة العربية السعودية'],
          description: 'يقع في قلب الرياض، المملكة العربية السعودية.'
        }
      },
      form: {
        title: 'أرسل لنا رسالة',
        subtitle: 'املأ النموذج أدناه وسنعود إليك في أقرب وقت ممكن.',
        labels: {
          name: 'الاسم الكامل *',
          email: 'عنوان البريد الإلكتروني *',
          company: 'الشركة/المؤسسة',
          phone: 'رقم الهاتف',
          inquiryType: 'نوع الاستفسار',
          subject: 'الموضوع *',
          message: 'الرسالة *'
        },
        inquiryTypes: {
          general: 'استفسار عام',
          demo: 'طلب عرض توضيحي',
          sales: 'المبيعات',
          support: 'الدعم الفني',
          partnership: 'الشراكة'
        },
        submit: 'إرسال الرسالة',
        submitting: 'جاري الإرسال...'
      },
      office: {
        title: 'زور مكتبنا',
        subtitle: 'يقع في قلب الحي الطبي، مكتبنا مصمم لمتخصصي الرعاية الصحية.',
        locationTitle: 'موقعنا',
        location: 'الرياض، المملكة العربية السعودية'
      },
      support: {
        hours: '24/7',
        label: 'الدعم متاح'
      },
      cta: {
        title: 'دعونا نعمل معًا',
        subtitle: 'جاهز لتحويل اتصال الرعاية الصحية الخاصة بك؟ نود أن نسمع منك.',
        startTrial: 'ابدأ التجربة المجانية',
        viewPricing: 'عرض الأسعار'
      }
    },

    // Privacy Page
    privacy: {
      hero: {
        title: 'سياسة الخصوصية',
        description: 'خصوصيتك أولويتنا. تعرف على كيفية حماية كيورينيوم لبياناتك وضمان الاتصال الآمن في الرعاية الصحية.',
      },
      sections: {
        informationWeCollect: {
          title: 'المعلومات التي نجمعها',
          description: 'نجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب، استخدام خدماتنا، أو الاتصال بنا للدعم. يشمل ذلك:',
          items: [
            'معلومات الحساب (الاسم، البريد الإلكتروني، المنظمة)',
            'البيانات الصحية التي تختار مشاركتها من خلال منصتنا',
            'بيانات الاتصال (الرسائل، الملفات، التنبيهات)',
            'بيانات الاستخدام ومعلومات الجهاز'
          ]
        },
        howWeUse: {
          title: 'كيف نستخدم معلوماتك',
          description: 'نستخدم المعلومات التي نجمعها لـ:',
          items: [
            'تقديم خدماتنا وصيانتها وتحسينها',
            'ضمان الأمان والامتثال في اتصالات الرعاية الصحية',
            'معالجة المعاملات وإرسال المعلومات ذات الصلة',
            'إرسال الإشعارات الفنية والتحديثات ورسائل الدعم',
            'الرد على تعليقاتك وأسئلتك'
          ]
        },
        dataSecurity: {
          title: 'أمان البيانات',
          description: 'نطبق التدابير التقنية والتنظيمية المناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به، التغيير، الكشف، أو التدمير. تستخدم منصتنا التشفير من طرف إلى طرف لجميع الاتصالات وتتوافق مع معايير حماية البيانات الصحية.'
        },
        dataSharing: {
          title: 'مشاركة البيانات',
          description: 'لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف ثالثة دون موافقتك، باستثناء ما هو موضح في هذه السياسة. قد نشارك المعلومات في الحالات التالية:',
          items: [
            'مع موافقتك الصريحة',
            'للامتثال للالتزامات القانونية',
            'لحماية حقوقنا ومنع الاحتيال',
            'مع مقدمي الخدمات الذين يساعدون في عملياتنا'
          ]
        },
        yourRights: {
          title: 'حقوقك',
          description: 'لديك الحق في:',
          items: [
            'الوصول إلى معلوماتك الشخصية وتحديثها',
            'طلب حذف بياناتك',
            'الانسحاب من معالجة بيانات معينة',
            'طلب قابلية نقل البيانات'
          ]
        },
        contactUs: {
          title: 'اتصل بنا',
          description: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على:',
          contactInfo: 'البريد الإلكتروني: privacy@plannorium.com\nالعنوان: [عنوانك هنا]'
        }
      }
    },

    // Terms Page
    terms: {
      hero: {
        title: 'شروط الخدمة',
        description: 'يرجى قراءة هذه الشروط بعناية قبل استخدام كيورينيوم. باستخدام خدمتنا، توافق على الالتزام بهذه الشروط.',
      },
      sections: {
        acceptanceOfTerms: {
          title: 'قبول الشروط',
          description: 'بالوصول إلى كيورينيوم واستخدامه، أنت تقبل وتوافق على الالتزام بشروط وأحكام هذه الاتفاقية. إذا كنت لا توافق على الالتزام بما سبق، يرجى عدم استخدام هذه الخدمة.'
        },
        useLicense: {
          title: 'ترخيص الاستخدام',
          description: 'يُمنح الإذن باستخدام كيورينيوم مؤقتًا للعرض الشخصي غير التجاري المؤقت فقط. هذا منح ترخيص، وليس نقل ملكية، وتحت هذا الترخيص لا يمكنك:',
          restrictions: [
            'تعديل أو نسخ المواد',
            'استخدام المواد لأي غرض تجاري أو لأي عرض عام',
            'محاولة تفكيك أو عكس هندسة أي برمجيات موجودة على منصتنا',
            'إزالة أي حقوق نشر أو إشعارات ملكية أخرى من المواد'
          ]
        },
        userResponsibilities: {
          title: 'مسؤوليات المستخدم',
          description: 'كمستخدم لكيورينيوم، أنت توافق على:',
          responsibilities: [
            'استخدام الخدمة للأغراض القانونية فقط',
            'الحفاظ على سرية بيانات اعتماد حسابك',
            'احترام خصوصية المريض ولوائح الرعاية الصحية',
            'الإبلاغ عن أي مخاوف أمنية أو استخدام غير مصرح به',
            'عدم مشاركة الوصول مع أفراد غير مصرح لهم'
          ]
        },
        healthcareCompliance: {
          title: 'الامتثال للرعاية الصحية',
          description: 'تم تصميم كيورينيوم لمتخصصي الرعاية الصحية. يجب على المستخدمين الامتثال لجميع القوانين واللوائح والمعايير المعمول بها في الرعاية الصحية بما في ذلك GDPR، واللوائح المحلية للرعاية الصحية. المنصة ليست بديلاً عن النصيحة الطبية المهنية أو خدمات الطوارئ.'
        },
        serviceAvailability: {
          title: 'توفر الخدمة',
          description: 'نسعى لتقديم خدمة مستمرة لكننا لا نضمن الوصول غير المنقطع. نحتفظ بالحق في تعديل أو تعليق أو إيقاف الخدمة مع أو بدون إشعار. لن نكون مسؤولين عن أي انقطاع أو توقف للخدمة.'
        },
        limitationOfLiability: {
          title: 'تحديد المسؤولية',
          description: 'في أي حال من الأحوال، لن يكون كيورينيوم أو موردوه مسؤولين عن أي أضرار (بما في ذلك، على سبيل المثال لا الحصر، أضرار فقدان البيانات أو الربح، أو بسبب انقطاع الأعمال) الناشئة عن استخدام أو عدم القدرة على استخدام الخدمة، حتى لو تم إخطار كيورينيوم شفهيًا أو كتابيًا بإمكانية حدوث مثل هذا الضرر.'
        },
        contactInformation: {
          title: 'معلومات الاتصال',
          description: 'إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا على support@plannorium.com.'
        }
      }
    },

    // Compliance Page
    compliance: {
      hero: {
        title: 'الامتثال والأمان',
        description: 'يلتزم كيورينيوم بالحفاظ على أعلى معايير الأمان والامتثال في اتصالات الرعاية الصحية.',
      },
      sections: {
        regulatoryCompliance: {
          title: 'الامتثال التنظيمي',
          description: 'تتوافق كيورينيوم مع اللوائح والمعايير الرئيسية للرعاية الصحية:',
          items: [
            'GDPR (اللائحة العامة لحماية البيانات)',
            'HITECH (تكنولوجيا المعلومات الصحية للصحة الاقتصادية والسريرية)',
            'اللوائح المحلية للرعاية الصحية في منطقة الخليج'
          ]
        },
        securityMeasures: {
          title: 'إجراءات الأمان',
          description: 'تنفذ منصتنا إجراءات أمان شاملة:',
          items: [
            'التشفير من طرف إلى طرف لجميع الاتصالات',
            'المصادقة متعددة العوامل',
            'عمليات التدقيق الأمني والاختبار بالاختراق بانتظام',
            'تشفير البيانات أثناء الراحة وعند النقل',
            'ضوابط الوصول والأذونات المبنية على الأدوار'
          ]
        },
        dataProtection: {
          title: 'حماية البيانات',
          description: 'نحمي بيانات المرضى بممارسات أمان رائدة في الصناعة. جميع البيانات مشفرة، يتم تسجيل الوصول ومراقبته، ونحافظ على ضوابط صارمة بشأن من يمكنه الوصول إلى المعلومات الحساسة. تضمن النسخ الاحتياطية المنتظمة توفر البيانات بينما تحمي خطط استرداد الكوارث من فقدان البيانات.'
        },
        auditMonitoring: {
          title: 'التدقيق والمراقبة',
          description: 'تحافظ كيورينيوم على سجلات تدقيق شاملة لجميع الأنشطة:',
          items: [
            'أحداث الوصول والمصادقة للمستخدمين',
            'سجلات الوصول إلى البيانات وتعديلها',
            'أحداث النظام والأمان',
            'عمليات التدقيق الامتثالية المنتظمة'
          ]
        },
        incidentResponse: {
          title: 'استجابة الحوادث',
          description: 'لقد أنشأنا إجراءات استجابة للحوادث لمعالجة أي مخاوف أمنية بسرعة. فريقنا متاح 24/7 للرد على الحوادث الأمنية المحتملة، ونخطر المستخدمين المتضررين والسلطات كما يتطلبه القانون.'
        },
        certifications: {
          title: 'الشهادات',
          description: 'تحمل كيورينيوم الشهادات التالية:',
          items: [
            'امتثال SOC 2 Type II',
            'شهادة ISO 27001',
            'تقييمات أمنية خارجية منتظمة'
          ]
        },
        contactSecurity: {
          title: 'اتصل بفريق الأمان لدينا',
          description: 'للمخاوف الأمنية أو أسئلة الامتثال، اتصل بفريق الأمان لدينا على security@plannorium.com أو اتصل بخط الدعم الأمني لدينا 24/7.'
        }
      }
    },

    // Unauthorized Page
    unauthorized: {
      title: 'تم رفض الوصول',
      description: 'ليس لديك إذن للوصول إلى هذه الصفحة. يرجى الاتصال بمديرك أو العودة إلى لوحة التحكم.',
      status: 'حالة الوصول',
      goToDashboard: 'اذهب إلى لوحة التحكم',
      returnHome: 'العودة إلى الصفحة الرئيسية',
      helpText: 'تحتاج مساعدة؟ اتصل بالدعم على support@plannorium.com',
      accessDenied: 'تم رفض الوصول',
      needHelp: 'تحتاج مساعدة؟ اتصل بالدعم على'
    },

    // Footer
    footer: {
      logoAlt: "شعار كيورينيوم",
      description: "منصة اتصالات للرعاية الصحية &bull; تعاون في الوقت الفعلي &bull; إدارة المرضى",
      tags: {
        realTime: "فوري",
        secure: "آمن",
        compliant: "متوافق",
      },
      sections: {
        product: "المنتج",
        company: "الشركة",
        legal: "قانوني",
      },
      links: {
        features: "الميزات",
        pricing: "الأسعار",
        security: "الأمان",
        about: "عنا",
        careers: "الوظائف",
        contact: "اتصل بنا",
        privacy: "الخصوصية",
        terms: "الشروط",
        compliance: "الامتثال",
      },
      social: {
        twitter: "تويتر",
        linkedin: "لينكد إن",
        instagram: "انستغرام",
        facebook: "فيسبوك",
      },
      copyright: "كل الحقوق محفوظة.",
    },
  },
};