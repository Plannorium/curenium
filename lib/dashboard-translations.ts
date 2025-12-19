export const dashboardTranslations = {
  en: {
    // Dashboard Page
    dashboard: {
      welcome: "Welcome back",
      loadingDashboard: "Loading your dashboard...",
      loading: "Loading Dashboard...",
      currentShift: "Current Shift",
      upcomingShift: "Upcoming Shift",
      noPersonalShifts: "No personal shifts",
      activeShifts: "active",
      activeAlerts: "Active Alerts",
      critical: "Critical",
      urgent: "Urgent",
      pendingAppointments: "Pending Appointments",
      overdue: "Overdue",
      activeStaff: "Active Staff",
      cardiologyDepartment: "Cardiology Department",
      askAIAssistant: "Ask AI Assistant",
      departmentActivity: "Department Activity",
      recentAuditLogs: "Recent Audit Logs",
      remaining: "remaining",
      startsIn: "Starts in",
      noUpcomingShifts: "No upcoming shifts",
    },

    // Sidebar
    sidebar: {
      home: "Home",
      chat: "Chat",
      alerts: "Alerts",
      shifts: "Shifts",
      ehr: "EHR",
      admin: "Admin",
      settings: "Settings",
      logout: "Logout",
      ehrMenu: "EHR Menu",
      patients: "Patients",
      appointments: "Appointments",
      lab: "Lab",
      auditLogs: "Audit Logs",
      admissions: "Admissions",
      discharges: "Discharges",
      shiftTracking: "Shift Tracking",
      hospitalMgmt: "Hospital Mgmt",
      doctorDashboard: "Doctor Dashboard",
      nurseDashboard: "Nurse Dashboard",
      pharmacy: "Pharmacy",
      channels: "Channels",
      general: "General",
      directMessages: "Direct Messages",
      notesToSelf: "Notes to self",
      personalSpace: "Personal space",
    },

    // Chat Component
    chat: {
      callStarted: "A call started",
      callEnded: "Call ended. Duration: {duration}",
      joinCall: "Join Call",
      messageDeleted: "message deleted by {by}",
      replyingTo: "Replying to {name}",
      file: "File",
      attachedFiles: "Attached Files",
      processing: "Processing",
      typeMessage: "Type your message...",
      newMessage: "New Message",
      searchPeople:
        "Search for people in your organization to start a conversation.",
      searchConversations: "Search conversations",
      startNewChat: "Start a new chat",
      startSyncCall: "Start Sync Call",
      callPermissions:
        "To start a call, we need access to your camera and microphone. Your browser will ask you for permission.",
      proceed: "Proceed",
      signInMessage: "Sign in to view conversations.",
      signInToView: "Sign in to view conversations.",
      general: "General",
      directMessages: "Direct Messages",
      notesToSelf: "Notes to self",
      personalSpace: "Personal space",
      channels: "Channels",
      addChannel: "Add Channel",
      today: "Today",
      searchInChat: "Search in chat...",
      of: "of",
      areYouSure: "Are you sure?",
      deleteMessageWarning:
        "This action will permanently delete the message. This cannot be undone.",
      typing: "Typing...",
      aiAssistant: "AI Assistant",
      conversationSummary: "Conversation Summary",
      comingSoon: "Coming Soon",
      active: "Active",
      offHours: "Off-hours",
      labOrders: "Lab Orders",
      newOrder: "New Order",
      labDashboard: "Lab Dashboard",
      noLabOrders: "No Lab Orders Yet",
      requestLabTests: "Request laboratory tests and track their status here.",
      requestFirstOrder: "Request First Lab Order",
      testsRequested: "Tests Requested",
      orderedOn: "Ordered On",
      completedOn: "Completed On",
    },

    // Audit Logs Component
    auditLogs: {
      failedToLoad: "Failed to load audit logs",
      viewAll: "View all audit logs",
      globalAuditLogs: "Global Audit Logs",
      date: "Date",
      action: "Action",
      user: "User",
      targetType: "Target Type",
      targetId: "Target ID",
      noAuditLogsFound: "No audit logs found.",
    },

    // Shift View Component
    shiftView: {
      title: "Shift Schedule",
      subtitle: "Manage team schedules and on-call assignments",
      addShift: "Add Shift",
      todaysShifts: "Today's Shifts",
      shifts: "shifts",
      shift: "shift",
      noShiftsScheduled: "No shifts scheduled",
      noShiftsMessage: "No shifts are scheduled for this day.",
      scheduleShift: "Schedule Shift",
      onCallTeam: "On-Call Team",
      onCall: "On-Call",
      noOnCallStaff: "No on-call staff for this day",
      viewNotes: "View Notes",
      clockIn: "Clock In",
      clockOut: "Clock Out",
      goOnCall: "Go On Call",
      goOffCall: "Go Off Call",
      advanced: "Advanced",
      unknown: "Unknown",
      malformed: "!",
      status: {
        "on-shift": "On Shift",
        "on-call": "On Call",
        upcoming: "Upcoming",
      },
    },

    // Invite List Component
    inviteList: {
      title: "Team Invitations",
      subtitle: "Manage and track user invitations",
      inviteUser: "Invite User",
      noInvitations: "No invitations yet",
      buildTeamMessage:
        "Start building your team by sending your first invitation.",
      sendFirstInvite: "Send First Invite",
      roles: {
        admin: "Administrator - Full access",
        doctor: "Doctor - Patient care access",
        nurse: "Nurse - Care coordination",
        labtech: "Lab Technician - Lab results",
        reception: "Reception - Patient intake",
        manager: "Manager - Department oversight",
        staff: "Staff - Basic access",
        user: "User - Basic access",
      },
      status: {
        pending: "pending",
        accepted: "accepted",
        rejected: "rejected",
      },
      expires: "Expires {date}",
    },

    // Invite Modal Component
    inviteModal: {
      title: "Invite Team Member",
      subtitle: "Send an invitation to join your organization",
      emailAddress: "Email Address",
      emailPlaceholder: "colleague@hospital.com",
      rolePermissions: "Role & Permissions",
      failedToSend: "Failed to send invite.",
      networkError: "Network error. Please try again.",
      sending: "Sending...",
      sendInvitation: "Send Invitation",
    },

    // Alerts Page
    alerts: {
      title: "Alerts",
      sendAlert: "Send Alert",
    },

    // Send Alert Modal
    sendAlertModal: {
      criticalAlert: "Critical Alert",
      criticalDescription: "Medical emergency, requires immediate attention.",
      urgentAlert: "Urgent Alert",
      urgentDescription: "Assistance required, prompt response needed.",
      infoAlert: "Info Alert",
      infoDescription: "General update for all team members.",
      sendNewAlert: "Send New Alert",
      alertType: "Alert Type",
      selectAlertType: "Select alert type",
      critical: "Critical",
      urgent: "Urgent",
      info: "Info",
      recipients: "Recipients",
      searchUsersOrChannels: "Search users or channels...",
      selectRecipientError: "Please select at least one user or channel.",
      message: "Message",
      describeSituation: "Describe the situation...",
      cancel: "Cancel",
      sending: "Sending...",
      sendAlert: "Send Alert",
    },

    // Notifications Page
    notifications: {
      loading: "Loading notifications...",
      title: "Notifications",
      subtitle: "Stay updated with your latest activities and alerts",
      markAllRead: "Mark All Read",
      total: "Total",
      unread: "Unread",
      read: "Read",
      noNotifications: "No notifications yet",
      allCaughtUp:
        "You're all caught up! We'll notify you when there's something new to see.",
      viewDetails: "View Details",
      from: "From:",
      new: "New",
    },

    // Add Shift Modal
    addShiftModal: {
      title: "Schedule Advanced Shift",
      assignToUser: "Assign to User",
      loadingUsers: "Loading users...",
      selectUser: "Select a user",
      role: "Role",
      rolePlaceholder: "Role will auto-populate when user is selected",
      department: "Department",
      selectDepartment: "Select department (optional)",
      ward: "Ward",
      selectWard: "Select ward (optional)",
      selectDepartmentFirst: "Select department first",
      startDate: "Start Date",
      endDate: "End Date",
      multiDayShift: "Multi-day shift: {days} days",
      startTime: "Start Time",
      endTime: "End Time",
      shiftNotes: "Shift Notes (Optional)",
      shiftNotesPlaceholder: "Any special notes for this shift",
      cancel: "Cancel",
      adding: "Adding...",
      addShift: "Add Shift",
    },

    // Add Patient Modal
    addPatientModal: {
      title: "Add New Patient",
    },

    // Add Lab Order Modal
    addLabOrderModal: {
      title: "Request Lab Order",
      testName: "Test Name",
      testNamePlaceholder: "e.g., Blood Work Panel",
      tests: "Tests",
      testsPlaceholder: "e.g., CBC, TSH, Lipid Panel",
      notes: "Notes",
      notesPlaceholder: "Optional notes or details...",
      cancel: "Cancel",
      submitting: "Submitting...",
      submit: "Submit",
    },

    // Common
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      create: "Create",
      update: "Update",
      confirm: "Confirm",
      close: "Close",
      proceed: "Proceed",
    },

    // Channel Members Modal
    channelMembersModal: {
      title: "Channel Members",
      searchMembers: "Search members...",
      noMembersFound: "No members found.",
    },

    // User Profile Card
    userProfileCard: {
      channels: "Channels",
      notMemberOfChannels: "Not a member of any channels yet.",
      message: "Message",
    },

    // Create Channel Modal
    createChannelModal: {
      title: "Create New Channel",
      nameLabel: "Name",
      namePlaceholder: "e.g., patient-updates",
      emptyNameError: "Channel name cannot be empty.",
      createFailedError: "Failed to create channel.",
      unexpectedError: "An unexpected error occurred.",
      cancel: "Cancel",
      createChannel: "Create Channel",
    },

    // Add Prescription Modal
    addPrescriptionModal: {
      title: "Professional Prescription",
      prescriptionItems: "Prescription Items",
      addItem: "Add Item",
      prescriptionItemsReady: "prescription item(s) ready",
      prescriptionDetails: "Prescription Details",
      calendarType: "Calendar Type",
      gregorian: "Gregorian (AD)",
      hijri: "Hijri (AH)",
      startDate: "Start Date",
      endDate: "End Date (Optional)",
      reasonForPrescription: "Reason for Prescription",
      additionalNotes: "Additional Notes",
      createPrescription: "Create Prescription",
      create: "Create",
      creating: "Creating...",
      prescriptionTypes: {
        medication: "Medication",
        treatment: "Treatment",
        procedure: "Procedure",
        therapy: "Therapy",
        device: "Medical Device",
        other: "Other",
      },
      dosageForms: {
        tablet: "Tablet",
        capsule: "Capsule",
        syrup: "Syrup",
        injection: "Injection",
        cream: "Cream",
        ointment: "Ointment",
        suppository: "Suppository",
        inhaler: "Inhaler",
        nebulizer: "Nebulizer",
        drops: "Drops",
        spray: "Spray",
        patch: "Patch",
        gel: "Gel",
        lotion: "Lotion",
      },
      routes: {
        oral: "Oral",
        intravenous: "Intravenous",
        intramuscular: "Intramuscular",
        subcutaneous: "Subcutaneous",
        topical: "Topical",
        inhaled: "Inhaled",
        rectal: "Rectal",
        vaginal: "Vaginal",
        ophthalmic: "Ophthalmic",
        otic: "Otic",
        nasal: "Nasal",
        sublingual: "Sublingual",
        buccal: "Buccal",
      },
      frequencies: {
        onceDaily: "Once daily",
        twiceDaily: "Twice daily",
        threeTimesDaily: "Three times daily",
        fourTimesDaily: "Four times daily",
        every4Hours: "Every 4 hours",
        every6Hours: "Every 6 hours",
        every8Hours: "Every 8 hours",
        every12Hours: "Every 12 hours",
        asNeeded: "As needed",
        beforeMeals: "Before meals",
        afterMeals: "After meals",
        atBedtime: "At bedtime",
        weekly: "Weekly",
        monthly: "Monthly",
      },
      durationUnits: {
        days: "Days",
        weeks: "Weeks",
        months: "Months",
      },
      labels: {
        type: "Type",
        name: "Name",
        strengthDose: "Strength/Dose",
        form: "Form",
        route: "Route",
        frequency: "Frequency",
        duration: "Duration",
        quantity: "Quantity",
        refills: "Refills",
        specificInstructions: "Specific Instructions",
      },
      placeholders: {
        enterName: "Enter name",
        strengthExample: "e.g., 500mg",
        selectForm: "Select form",
        selectRoute: "Select route",
        selectFrequency: "Select frequency",
        duration: "Duration",
        quantity: "Quantity",
        refills: "Refills",
        specificInstructions: "Enter specific instructions for this prescription item...",
        reasonForPrescription: "Enter the medical reason for this prescription...",
        additionalNotes: "Any additional notes or special instructions...",
      },
    },

    // Add SOAP Note Modal
    addSOAPNoteModal: {
      title: "Add SOAP Note",
      subtitle: "Comprehensive patient documentation using SOAP format",
      subjective: "Subjective",
      subjectivePlaceholder: "Patient's subjective report...",
      objective: "Objective",
      objectivePlaceholder: "Objective findings...",
      assessment: "Assessment",
      assessmentPlaceholder: "Your assessment...",
      plan: "Plan",
      planPlaceholder: "Your plan for the patient...",
      visibility: "Visibility",
      selectVisibility: "Select visibility",
      team: "Team",
      private: "Private",
      public: "Public",
      cancel: "Cancel",
      saveSOAPNote: "Save SOAP Note",
      saving: "Saving...",
      subjectiveRequired: "Subjective section cannot be empty",
      objectiveRequired: "Objective section cannot be empty",
      assessmentRequired: "Assessment section cannot be empty",
      planRequired: "Plan section cannot be empty",
      soapNoteAdded: "SOAP note added successfully",
      failedToAddSOAPNote: "Failed to add SOAP note",
      errorAddingSOAPNote: "An error occurred while adding the SOAP note",
    },

    // Clinical Notes Display
    clinicalNotesDisplay: {
      title: "Clinical Notes",
      subtitle: "Document patient findings and observations",
      newNote: "New Note",
      soapNote: "SOAP Note",
      clinicalNote: "Clinical Note",
      soapNoteLabel: "SOAP Note",
      subjective: "Subjective",
      objective: "Objective",
      assessment: "Assessment",
      plan: "Plan",
      noNotesYet: "No clinical notes yet",
      startDocumenting:
        "Start documenting patient findings and observations by creating your first clinical note.",
      errorFetchingNotes: "An error occurred while fetching notes",
    },

    // Add Clinical Note Modal
    addClinicalNoteModal: {
      title: "Add Clinical Note",
      subtitle: "Document patient findings and observations",
      noteContent: "Note Content",
      noteContentPlaceholder: "Write your clinical note here...",
      visibility: "Visibility",
      selectVisibility: "Select visibility",
      team: "Team",
      private: "Private",
      public: "Public",
      cancel: "Cancel",
      saveNote: "Save Note",
      clinicalNoteAdded: "Clinical note added successfully",
      failedToAddClinicalNote: "Failed to add clinical note",
      errorAddingClinicalNote:
        "An error occurred while adding the clinical note",
      noteContentRequired: "Note content cannot be empty",
    },

    // Nursing Care Plan Display
    nursingCarePlanDisplay: {
      title: "Nursing Care Plans",
      subtitle: "Comprehensive care planning and monitoring",
      addCarePlan: "Add Care Plan",
      noCarePlansYet: "No nursing care plans yet",
      noNursingCarePlansYet: "No nursing care plans yet",
      createCarePlans:
        "Create comprehensive care plans to monitor and track patient care progress.",
      createNursingCarePlans:
        "Create comprehensive nursing care plans with diagnoses, interventions, and expected outcomes.",
      diagnoses: "Diagnoses",
      interventions: "Interventions",
      expectedOutcomes: "Expected Outcomes",
      evaluation: "Evaluation",
      active: "Active",
      resolved: "Resolved",
      inactive: "Inactive",
    },

    // Add Nursing Care Plan Modal
    addNursingCarePlanModal: {
      title: "Add Nursing Care Plan",
      diagnosesLabel: "Diagnoses (comma-separated)",
      interventionsLabel: "Interventions (comma-separated)",
      outcomesLabel: "Outcomes (comma-separated)",
      evaluationLabel: "Evaluation",
      statusLabel: "Status",
      selectStatus: "Select status",
      active: "Active",
      resolved: "Resolved",
      inactive: "Inactive",
      cancel: "Cancel",
      adding: "Adding...",
      addPlan: "Add Plan",
      evaluationRequired:
        "Evaluation is required when status is Inactive or Resolved.",
      planAdded: "Nursing care plan added successfully",
      failedToAdd: "Failed to add nursing care plan",
    },

    // Patient Detail Component
    patientDetail: {
      overview: "Overview",
      appointments: "Appointments",
      insurance: "Insurance",
      auditLog: "Audit Log",
      clinicalNotes: "Clinical Notes",
      assignment: "Assignment",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      email: "Email",
      phone: "Phone",
      address: "Address",
      emergencyContact: "Emergency Contact",
      mrn: "MRN",
      careTeamAssignment: "Care Team Assignment",
      careTeamAssignmentDesc:
        "Assign healthcare providers and manage patient placement",
      editAssignment: "Edit Assignment",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      saving: "Saving...",
      assignmentUpdated: "Patient assignment updated successfully",
      assignmentUpdateFailed: "Failed to update patient assignment",
      assignmentError: "An error occurred while updating the assignment",
      careTeam: "Care Team",
      assignedNurse: "Assigned Nurse",
      assignedDoctor: "Assigned Doctor",
      selectNurse: "Select a nurse",
      selectDoctor: "Select a doctor",
      unassigned: "Unassigned",
      notAssigned: "Not assigned",
      locationAdmission: "Location & Admission",
      ward: "Ward",
      department: "Department",
      room: "Room",
      bed: "Bed",
      wardPlaceholder: "e.g., ICU, Ward 3A",
      departmentPlaceholder: "e.g., Cardiology",
      roomPlaceholder: "Room number",
      bedPlaceholder: "Bed number",
      admissionDetails: "Admission Details",
      admissionType: "Admission Type",
      careLevel: "Care Level",
      admissionDate: "Admission Date",
      dischargeDate: "Discharge Date",
      selectAdmissionType: "Select admission type",
      selectCareLevel: "Select care level",
      notSpecified: "Not specified",
      inpatient: "Inpatient",
      outpatient: "Outpatient",
      emergency: "Emergency",
      daySurgery: "Day Surgery",
      critical: "Critical",
      intermediate: "Intermediate",
      basic: "Basic",
      notSet: "Not set",
      safetyMobility: "Safety & Mobility",
      isolationStatus: "Isolation Status",
      fallRisk: "Fall Risk",
      mobilityStatus: "Mobility Status",
      selectIsolationStatus: "Select isolation status",
      selectFallRisk: "Select fall risk level",
      selectMobilityStatus: "Select mobility status",
      none: "None",
      contact: "Contact",
      droplet: "Droplet",
      airborne: "Airborne",
      notAssessed: "Not assessed",
      low: "Low",
      medium: "Medium",
      high: "High",
      independent: "Independent",
      assisted: "Assisted",
      wheelchair: "Wheelchair",
      bedridden: "Bedridden",
    },

    // Appointments Display Componen

    // Appointments
    appointments: {
      title: "Appointments",
      bookAppointment: "Book Appointment",
      allAppointments: "All Appointments",
      appointmentsFor: "Appointments for",
      noAppointments: "No appointments found",
      searchPatients: "Search patients...",
      selectPatient: "Select patient...",
      noPatientFound: "No patient found.",
      appointmentType: "Appointment Type",
      selectType: "Select a type",
      purposeOfVisit: "Purpose of Visit",
      specifyReason: "Please specify the reason",
      selectDate: "Select an available time",
      noSlots: "No available slots",
      selectDateAndPersonnel: "Select date and personnel first",
      personnelType: "Personnel Type",
      selectPersonnelType: "Select a type",
      healthPersonnel: "Health Personnel",
      selectProfessional: "Select a professional",
      booking: "Booking...",
      bookAppointmentBtn: "Book Appointment",
      bookNewAppointment: "Book New Appointment",
      scheduleAppointment: "Schedule a new appointment for the patient",
      findPatient: "Find Patient",
      generalConsultation: "General Consultation",
      followup: "Follow-up",
      specialistConsultation: "Specialist Consultation",
      therapySession: "Therapy Session",
      routineTest: "Routine Test",
      emergency: "Emergency",
      other: "Other",
      doctor: "Doctor",
      nurse: "Nurse",
      therapist: "Therapist",
      labTechnician: "Lab Technician",
      admin: "Admin",
      selectPatientError: "Please select a patient.",
      selectDateError: "Please select an appointment date.",
      selectTimeError: "Please select an appointment time.",
      selectPersonnelError: "Please select a health professional.",
      bookingSuccess: "Appointment booked successfully!",
      bookingFailed: "Failed to book appointment.",
      serverError: "Unexpected server error.",
      date: "Date",
      time: "Time",
    },

    // Create Diagnosis Component
    createDiagnosis: {
      title: "Create Diagnosis",
      icd10CodeLabel: "ICD-10 Code *",
      icd10CodePlaceholder: "e.g., J00, I10, E11.9",
      severityLabel: "Severity",
      selectSeverityPlaceholder: "Select severity level",
      diagnosisDescriptionLabel: "Diagnosis Description *",
      diagnosisDescriptionPlaceholder: "Provide a detailed description of the diagnosis...",
      onsetDateLabel: "Onset Date",
      markAsPrimaryDiagnosis: "Mark as Primary Diagnosis",
      clinicalNotesLabel: "Clinical Notes",
      clinicalNotesPlaceholder: "Add any additional clinical notes, observations, or treatment considerations...",
      creatingDiagnosis: "Creating Diagnosis...",
      createDiagnosis: "Create Diagnosis",
      icd10CodeRequired: "ICD-10 Code is required",
      diagnosisDescriptionRequired: "Diagnosis description is required",
      severityRequired: "Please select a severity level",
      invalidOnsetDate: "Please select a valid onset date",
      diagnosisCreated: "Diagnosis created successfully",
      failedToCreate: "Failed to create diagnosis",
      errorCreating: "An error occurred while creating the diagnosis",
    },

    // Doctor Dashboard Page
    doctorDashboard: {
      title: "Physician Dashboard",
      subtitle: "Select a patient to begin your medical workflow",
      searchPlaceholder: "Search patients by name or MRN...",
      noPatientsFound: "No patients found",
      noPatientsFoundDesc: "Try adjusting your search terms or check the spelling",
      searchForPatients: "Search for patients",
      searchForPatientsDesc: "Enter a patient name or MRN in the search box above to get started",
      backToPatients: "Back to Patients",
      activePatient: "Active Patient",
      medicalWorkflow: "Medical Workflow",
      patientAssessment: "Patient Assessment",
      patientAssessmentDesc: "Review patient history and current status",
      patientOverview: "Patient Overview",
      fullName: "Full Name",
      mrn: "MRN",
      dateOfBirth: "Date of Birth",
      email: "Email",
      phone: "Phone",
      gender: "Gender",
      admissionDate: "Admission Date",
      admissionType: "Admission Type",
      department: "Department",
      diagnosisAndTreatment: "Diagnosis & Treatment",
      diagnosisAndTreatmentDesc: "Create and view patient diagnoses",
      createDiagnosis: "Create Diagnosis",
      diagnosisHistory: "Diagnosis History",
      noDiagnosesRecorded: "No diagnoses recorded yet",
      prescriptionManagement: "Prescription Management",
      prescriptionManagementDesc: "Manage patient prescriptions and medications",
      addPrescription: "Add Prescription",
      documentationAndConsent: "Documentation & Consent",
      documentationAndConsentDesc: "Complete patient documentation and manage consent forms",
      followupAndScheduling: "Follow-up & Scheduling",
      followupAndSchedulingDesc: "Schedule follow-ups and manage appointments",
      diagnosisDetails: "Diagnosis Details",
      icd10Code: "ICD-10 Code",
      severity: "Severity",
      onsetDate: "Onset Date",
      documentedBy: "Documented By",
      documentedAt: "Documented At",
      description: "Description",
      onsetLabel: "Onset",
      byLabel: "By",
      ageLabel: "Age",
      diagnosisCreatedSuccess: "Diagnosis created successfully!",
      consentUploadedSuccess: "Consent form uploaded successfully!",
      prescriptionAddedSuccess: "Prescription added successfully!",
    },

    consentForm: {
      title: "Consent Form Management",
      consentTypes: {
        treatmentConsent: {
          label: "Treatment Consent",
          description: "General treatment authorization"
        },
        surgicalConsent: {
          label: "Surgical Consent",
          description: "Authorization for surgical procedures"
        },
        medicationConsent: {
          label: "Medication Consent",
          description: "Authorization for medication administration"
        },
        disclosureConsent: {
          label: "Information Disclosure",
          description: "Authorization for information sharing"
        },
        researchConsent: {
          label: "Research Participation",
          description: "Consent for research study participation"
        },
        photographyConsent: {
          label: "Photography Consent",
          description: "Authorization for medical photography"
        }
      },
      signingMethods: {
        digital: {
          label: "Digital Signature",
          description: "Electronic signature via secure platform"
        },
        inPerson: {
          label: "In-Person Signature",
          description: "Physical signature collected in person"
        },
        witnessed: {
          label: "Witnessed Signature",
          description: "Signature witnessed by healthcare provider"
        }
      },
      formType: "Consent Form Type *",
      signingMethod: "Signing Method",
      uploadDocument: "Upload Consent Document *",
      selectFormType: "Select consent form type",
      selectSigningMethod: "Select signing method",
      dragDropText: "Drag & drop a file here, or click to select",
      fileTypes: "PDF, DOC, DOCX, PNG, JPG, GIF up to 10MB",
      readyToUpload: "Ready to upload",
      uploading: "Uploading consent form...",
      uploadAndSign: "Upload & Sign Consent",
      errors: {
        selectFile: "Please select a file to upload",
        selectFormType: "Please select a consent form type",
        selectSigningMethod: "Please select a signing method"
      },
      success: {
        uploaded: "Consent form uploaded and signed successfully"
      },
      failed: {
        uploadFailed: "Failed to upload consent form",
        errorOccurred: "An error occurred while uploading the consent form"
      }
    },

    vitals: {
      title: "Latest Vitals",
      heartRate: "Heart Rate",
      bloodPressure: "Blood Pressure",
      spo2: "SpO2",
      temperature: "Temperature",
      respiratoryRate: "Resp. Rate",
      noVitalsRecorded: "No vitals recorded for this patient yet.",
      recordVitals: "Record Vitals",
      viewAll: "View All",
      bloodPressureCategories: {
        crisis: "Crisis",
        highStage2: "High (Stage 2)",
        highStage1: "High (Stage 1)",
        elevated: "Elevated",
        normal: "Normal",
        nA: "N/A"
      },
      recordVitalsModal: {
        title: "Record Vitals for {patientName}",
        description: "Enter the patient's latest vital signs. All fields are required.",
        fields: {
          bpSystolic: "BP Systolic (mmHg)",
          bpDiastolic: "BP Diastolic (mmHg)",
          heartRate: "Heart Rate (bpm)",
          temperature: "Temperature (°F)",
          respiratoryRate: "Respiratory Rate (breaths/min)",
          spo2: "SpO2 (%)",
          height: "Height (in)",
          weight: "Weight (lbs)",
          notes: "Notes"
        },
        bmi: "Body Mass Index (BMI):",
        markAsUrgent: "Mark as Urgent",
        cancel: "Cancel",
        saveVitals: "Save Vitals",
        success: "Vitals recorded successfully!",
        failed: "Failed to record vitals.",
        error: "An unexpected error occurred."
      }
    },

    labResults: {
      title: "Latest Lab Result",
      result: "Result",
      collected: "Collected",
      reference: "Reference",
      reported: "Reported",
      notes: "Notes",
      noLabResultsYet: "No Lab Results Yet",
      labResultsDescription: "Laboratory test results will appear here once they are available.",
      viewAllResults: "View All Results",
      status: {
        normal: "Normal",
        abnormal: "Abnormal",
        unknown: "Unknown"
      },
      error: "Error",
      failedToFetch: "Failed to fetch lab results"
    },

    // Prescriptions Page
    prescriptionsPage: {
      title: "Prescription History",
      subtitle: "Active prescriptions • {count} total",
      backToPatient: "Back to Patient",
      back: "Back",
      searchPlaceholder: "Search medications, dosage, or frequency...",
      filterByStatus: "Filter by status",
      allPrescriptions: "All Prescriptions",
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled",
      medications: "Medications",
      dose: "Dose",
      frequency: "Frequency",
      route: "Route",
      status: "Status",
      statusReason: "Status Reason",
      prescribed: "Prescribed",
      duration: "Duration",
      administrations: "Administrations",
      noMedicationSpecified: "No medication specified",
      days: "days",
      none: "None",
      administrationsCount: "administrations",
      viewDetails: "View Details",
      noPrescriptionsFound: "No prescriptions found",
      noPrescriptionsYet: "No prescriptions yet",
      tryAdjustingSearch: "Try adjusting your search or filter criteria.",
      prescriptionsWillAppear: "Prescriptions will appear here once they are prescribed.",
      clearFilters: "Clear Filters",
      failedToFetch: "Failed to fetch historical prescriptions.",
      unexpectedError: "An unexpected error occurred while fetching prescriptions.",
      statusUpdated: "Status updated successfully",
      failedToUpdateStatus: "Failed to update status",
      errorUpdatingStatus: "An error occurred while updating status",
    },

    labResultsPage: {
      backToPatient: "Back to Patient",
      title: "Lab Results History",
      subtitle: "{count} test results • Track patient diagnostics over time",
      exportCsv: "Export CSV",
      filtersAndSearch: "Filters & Search",
      searchPlaceholder: "Search by test name or result...",
      filterByStatus: "Filter by status",
      filterOptions: {
        all: "All Results",
        normal: "Normal",
        abnormal: "Abnormal"
      },
      tableHeaders: {
        testName: "Test Name",
        result: "Result",
        units: "Units",
        refRange: "Ref Range",
        status: "Status",
        collectedAt: "Collected At"
      },
      status: {
        normal: "Normal",
        abnormal: "Abnormal",
        unknown: "Unknown"
      },
      noResultsFound: "No lab results found matching your criteria.",
      showingResults: "Showing {start} to {end} of {total} results",
      previous: "Previous",
      next: "Next",
      pageInfo: "Page {current} of {total}"
    },

    // Administration Details Modal
    administrationDetailsModal: {
      title: "Administration History",
      administeredBy: "Administered By:",
      doseAdministered: "Dose Administered:",
      notes: "Notes:",
      noAdministrations: "No Administrations Yet",
      noAdministrationsMessage:
        "This prescription has not been administered yet.",
    },

    // Appointment Card
    appointmentCard: {
      mrn: "MRN",
      scheduled: "scheduled",
      confirmed: "confirmed",
      cancelled: "cancelled",
    },

    // Manage Channel Modal
    manageChannelModal: {
      title: "Manage #{channelName}",
      addMembers: "Add Members",
      searchPlaceholder: "Search people to add...",
      noUsersFound: "No users found.",
      membersCount: "{count} Member(s)",
      memberAdded: "Member added successfully.",
      memberRemoved: "Member removed successfully.",
      failedToAdd: "Failed to add member.",
      failedToRemove: "Failed to remove member.",
      errorAdding: "An error occurred while trying to add a member.",
      errorRemoving: "An error occurred while trying to remove a member.",
    },

    // Thread View
    threadView: {
      title: "Thread",
      replyPlaceholder: "Reply in thread...",
    },

    // Patient Form
    patientForm: {
      personalInformation: "Personal Information",
      firstName: "First Name",
      firstNamePlaceholder: "John",
      lastName: "Last Name",
      lastNamePlaceholder: "Doe",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      selectGender: "Select a gender",
      male: "Male",
      female: "Female",
      other: "Other",
      contactInformation: "Contact Information",
      emailAddress: "Email Address",
      emailPlaceholder: "john.doe@example.com",
      phoneNumber: "Phone Number",
      phonePlaceholder: "123-456-7890",
      address: "Address",
      street: "Street",
      streetPlaceholder: "123 Main St",
      city: "City",
      cityPlaceholder: "Anytown",
      state: "State",
      statePlaceholder: "CA",
      zip: "Zip",
      zipPlaceholder: "12345",
      emergencyContact: "Emergency Contact",
      fullName: "Full Name",
      emergencyNamePlaceholder: "Jane Doe",
      insurance: "Insurance",
      provider: "Provider",
      providerPlaceholder: "Health Inc.",
      policyNumber: "Policy Number",
      policyNumberPlaceholder: "ABC123456789",
      previous: "Previous",
      next: "Next",
      submit: "Submit",
    },

    // Prescriptions Display
    prescriptionsDisplay: {
      prescriptions: "Prescriptions",
      addPrescription: "Add Prescription",
      fullView: "Full View",
      administer: "Administer",
      hideDetails: "Hide Details",
      showDetails: "Show Details",
      strengthDose: "Strength/Dose",
      frequency: "Frequency",
      route: "Route",
      duration: "Duration",
      days: "days",
      refills: "Refills",
      prescribed: "Prescribed",
      startDate: "Start Date",
      endDate: "End Date",
      instructions: "Instructions",
      reasonForPrescription: "Reason for Prescription",
      additionalNotes: "Additional Notes",
      administrationTimeline: "Administration Timeline",
      noPrescriptionsYet: "No Prescriptions Yet",
      noPrescriptionsDescription: "Prescriptions and medications will be displayed here once they are prescribed.",
      addFirstPrescription: "Add First Prescription",
      therapyTreatment: "Therapy/Treatment",
      procedure: "Procedure",
      medicalDevice: "Medical Device",
      medication: "Medication",
      status: {
        active: "active",
        completed: "completed",
        cancelled: "cancelled",
      },
      administrationStatus: {
        administered: "administered",
        missed: "missed",
      },
      administeredBy: "Administered by",
      dose: "Dose",
      notes: "Notes",
    },

    pharmacy: {
      title: "Pharmacy Dashboard",
      stats: {
        pendingDispensing: "Pending Dispensing",
        dispensed: "Dispensed",
        totalPrescriptions: "Total Prescriptions"
      },
      search: {
        placeholder: "Search by patient or medication...",
        filterByStatus: "Filter by status",
        allStatuses: "All Statuses",
        active: "Active",
        completed: "Completed",
        cancelled: "Cancelled"
      },
      tabs: {
        pendingDispensing: "Pending Dispensing",
        dispensed: "Dispensed"
      },
      table: {
        headers: {
          patient: "Patient",
          medication: "Medication",
          dose: "Dose",
          frequency: "Frequency",
          date: "Date",
          status: "Status",
          actions: "Actions"
        },
        status: {
          dispensed: "Dispensed",
          markAsDispensed: "Mark as Dispensed"
        }
      },
      empty: {
        noPrescriptions: "No prescriptions",
        noPendingDispensing: "No prescriptions pending dispensing",
        noDispensedFound: "No dispensed prescriptions found"
      },
      errors: {
        loadingError: "Error loading prescriptions",
        refreshFailed: "Failed to refresh prescriptions"
      }
    },

    testDetailsModal: {
      title: "Test Details",
      sections: {
        patientInformation: "Patient Information",
        testInformation: "Test Information",
        notes: "Notes",
        results: "Results"
      },
      labels: {
        name: "Name",
        testName: "Test Name",
        testsRequested: "Tests Requested",
        status: "Status",
        requestedOn: "Requested On",
        submittedOn: "Submitted On"
      },
      fileTypes: {
        pdf: "PDF Document",
        png: "PNG Image",
        jpg: "JPEG Image",
        jpeg: "JPEG Image",
        gif: "GIF Image",
        unknown: "Unknown File"
      },
      buttons: {
        close: "Close"
      }
    },

    uploadResultModal: {
      titles: {
        edit: "Edit Lab Result",
        upload: "Upload Lab Result"
      },
      labels: {
        forOrder: "For order:",
        notes: "Notes (optional)",
        selectedFiles: "Selected Files:",
        currentResults: "Current Results:",
        viewResult: "View Result"
      },
      placeholders: {
        notes: "Add any additional notes or details about the lab result...",
        dragDrop: "Drag & drop a file here, or click to select",
        dragActive: "Drop the files here ..."
      },
      fileTypes: "PDF, PNG, JPG, GIF up to 10MB",
      buttons: {
        cancel: "Cancel",
        uploading: "Uploading...",
        updating: "Updating...",
        addResults: "Add Results",
        uploadResults: "Upload Results",
        updateNotes: "Update Notes",
        uploadResult: "Upload Result"
      }
    },

    dischargesPage: {
      title: "Discharge Management",
      subtitle: "Plan and manage patient discharges",
      loading: "Loading discharges...",
      errors: {
        fetchFailed: "Failed to fetch discharges",
        fetchError: "An error occurred while fetching discharges",
        actionFailed: "Failed to {action} discharge",
        actionError: "An error occurred while {action}ing discharge",
        actionSuccess: "Discharge {action} successfully"
      },
      buttons: {
        planDischarge: "Plan Discharge",
        viewDetails: "View Details",
        startProcess: "Start Process",
        complete: "Complete",
        cancel: "Cancel"
      },
      stats: {
        planned: "Planned",
        inProgress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled"
      },
      tabs: {
        all: "All",
        planned: "Planned",
        inProgress: "In Progress",
        completed: "Completed"
      },
      cardTitle: "Discharges",
      emptyState: {
        noDischarges: "No discharges found",
        noPlansYet: "No discharge plans have been created yet.",
        noTabDischarges: "No {tab} discharges."
      },
      status: {
        planned: "PLANNED",
        in_progress: "IN PROGRESS",
        completed: "COMPLETED",
        cancelled: "CANCELLED"
      },
      dischargeTypes: {
        routine: "ROUTINE",
        against_medical_advice: "AGAINST MEDICAL ADVICE",
        transfer: "TRANSFER",
        death: "DEATH"
      },
      labels: {
        mrn: "MRN:",
        doctor: "Doctor:",
        matronNurse: "Matron Nurse:",
        plannedDate: "Planned Date:",
        actualDate: "Actual Date:",
        initiated: "Initiated:",
        reason: "Reason:"
      }
    },

    shiftTrackingPage: {
      title: "Shift Tracking",
      subtitle: "Advanced shift management and time tracking",
      loading: "Loading shift data...",
      errors: {
        fetchFailed: "Failed to fetch shifts",
        fetchError: "An error occurred while fetching shifts",
        actionFailed: "Failed to {action} shift",
        actionError: "An error occurred while {action}ing shift",
        actionSuccess: "Shift {action} successfully"
      },
      buttons: {
        scheduleShift: "Schedule Shift",
        add: "Add",
        details: "Details",
        clockIn: "Clock In",
        clockInShort: "In",
        clockOut: "Clock Out",
        clockOutShort: "Out",
        break: "Break",
        endBreak: "End Break",
        endBreakShort: "End",
        markAbsent: "Mark Absent",
        markAbsentShort: "Absent"
      },
      stats: {
        activeShifts: "Active Shifts",
        onBreak: "On Break",
        completedToday: "Completed Today",
        totalStaff: "Total Staff",
        missedShifts: "Missed Shifts"
      },
      tabs: {
        today: "Today",
        week: "Week",
        active: "Active",
        missed: "Missed",
        completed: "Done",
        all: "All"
      },
      cardTitle: "Shifts",
      emptyState: {
        noMissedShifts: "No missed shifts",
        noShiftsFound: "No shifts found",
        allOnTrack: "Great! All scheduled shifts are on track.",
        noShiftsScheduled: "No shifts have been scheduled yet.",
        noTabShifts: "No {tab} shifts."
      },
      status: {
        scheduled: "SCHEDULED",
        active: "ACTIVE",
        on_break: "ON BREAK",
        completed: "COMPLETED",
        absent: "ABSENT",
        cancelled: "CANCELLED",
        missed: "MISSED ({duration}min late)"
      },
      labels: {
        date: "Date:",
        scheduled: "Scheduled:",
        started: "Started:",
        ended: "Ended:",
        dept: "Dept:",
        ward: "Ward:",
        breaks: "Breaks:",
        performance: "Performance:",
        tasks: "Tasks:",
        incidents: "Incidents:",
        interactions: "Interactions:"
      },
      badges: {
        basic: "Basic"
      }
    },

    hospitalManagementPage: {
      title: "Hospital Management",
      subtitle: "Manage departments, wards, and hospital infrastructure",
      loading: "Loading hospital data...",
      errors: {
        fetchFailed: "Failed to load hospital data",
        departmentDeactivated: "Department deactivated successfully",
        departmentDeactivateFailed: "Failed to deactivate department",
        departmentDeactivateError: "An error occurred while deactivating department",
        wardDeactivated: "Ward deactivated successfully",
        wardDeactivateFailed: "Failed to deactivate ward",
        wardDeactivateError: "An error occurred while deactivating ward"
      },
      buttons: {
        refresh: "Refresh",
        addDepartment: "Add Department",
        addWard: "Add Ward",
        view: "View",
        edit: "Edit",
        deactivate: "Deactivate",
        createTask: "Create Task",
        assignStaff: "Assign Staff",
        assign: "Assign"
      },
      stats: {
        departments: "Departments",
        totalWards: "Total Wards",
        totalBeds: "Total Beds",
        availableBeds: "Available Beds",
        totalRooms: "Total Rooms"
      },
      tabs: {
        departments: "Departments",
        wards: "Wards"
      },
      sections: {
        departments: "Departments",
        wards: "Wards"
      },
      status: {
        active: "Active",
        inactive: "Inactive"
      },
      wardTypes: {
        icu: "ICU",
        emergency: "EMERGENCY",
        maternity: "MATERNITY",
        pediatric: "PEDIATRIC",
        surgical: "SURGICAL"
      },
      labels: {
        head: "Head:",
        specialties: "Specialties:",
        department: "Department:",
        beds: "Beds:",
        location: "Location:",
        chargeNurse: "Charge Nurse:",
        noDescription: "No description",
        totalRooms: "Total Rooms",
        available: "available",
        rooms: "rooms"
      },
      confirm: {
        deactivateDepartment: "Are you sure you want to deactivate this department?",
        deactivateWard: "Are you sure you want to deactivate this ward?"
      },
      modals: {
        createTask: {
          title: "Create Patient Task",
          patient: "Patient",
          assignTo: "Assign To",
          taskTitle: "Task Title",
          description: "Description",
          taskType: "Task Type",
          priority: "Priority",
          dueDateTime: "Due Date & Time",
          cancel: "Cancel",
          createTask: "Create Task",
          creating: "Creating...",
          fillRequiredFields: "Please fill in all required fields",
          assignPermissionError: "Can only assign tasks to nurses in the same department or ward as the patient",
          success: "Task created successfully",
          failed: "Failed to create task",
          insufficientPermissions: "Insufficient permissions to create tasks",
          loading: "Loading patients and nurses..."
        },
        wardDetails: {
          title: "Ward Details",
          wardInformation: "Ward Information",
          name: "Name",
          type: "Type",
          wardNumber: "Ward Number",
          department: "Department",
          beds: "Beds",
          chargeNurse: "Charge Nurse",
          location: "Location",
          assignedNurses: "Assigned Nurses ({count})",
          noNursesAssigned: "No nurses assigned to this ward",
          assignFirstNurse: "Assign First Nurse",
          close: "Close"
        },
        departmentDetails: {
          title: "Department Details",
          departmentInformation: "Department Information",
          name: "Name",
          status: "Status",
          headOfDepartment: "Head of Department",
          description: "Description",
          specialties: "Specialties",
          assignedStaff: "Assigned Staff ({count})",
          noStaffAssigned: "No staff members assigned to this department",
          assignFirstStaff: "Assign First Staff Member",
          close: "Close"
        },
        assignStaff: {
          title: "Assign Staff to {department}",
          description: "Select staff members to assign to this department.",
          selected: "selected",
          noStaffAvailable: "No staff members available for assignment."
        },
        assignNurses: {
          title: "Assign Nurses to {ward}",
          description: "Select nurses to assign to this ward. Only nurses from the same department can be assigned.",
          selected: "selected",
          noNursesAvailable: "No nurses available for assignment in this department."
        },
        addDepartment: {
          title: "Add New Department",
          departmentName: "Department Name *",
          description: "Description",
          headOfDepartment: "Head of Department",
          selectHead: "Select head of department",
          specialties: "Specialties",
          enterSpecialty: "Enter specialty name",
          phone: "Phone",
          email: "Email",
          cancel: "Cancel",
          creating: "Creating...",
          createDepartment: "Create Department",
          success: "Department created successfully",
          failed: "Failed to create department",
          error: "An error occurred while creating the department"
        },
        addWard: {
          title: "Add New Ward",
          wardName: "Ward Name *",
          wardNumber: "Ward Number *",
          department: "Department *",
          selectDepartment: "Select department",
          totalBeds: "Total Beds *",
          wardType: "Ward Type *",
          selectWardType: "Select ward type",
          floor: "Floor",
          building: "Building",
          phone: "Phone",
          extension: "Extension",
          description: "Description",
          descriptionPlaceholder: "Ward description and facilities...",
          cancel: "Cancel",
          creating: "Creating...",
          createWard: "Create Ward",
          success: "Ward created successfully",
          failed: "Failed to create ward",
          error: "An error occurred while creating the ward"
        },
        viewWard: {
          title: "Ward Details",
          totalBeds: "Total Beds",
          available: "Available",
          department: "Department",
          location: "Location",
          chargeNurse: "Charge Nurse",
          assignedNurses: "Assigned Nurses ({count})",
          contactInfo: "Contact Information",
          phone: "Phone:",
          extension: "Extension:",
          facilities: "Facilities",
          created: "Created",
          close: "Close",
          active: "Active",
          inactive: "Inactive"
        },
        editWard: {
          title: "Edit Ward",
          wardName: "Ward Name *",
          wardNumber: "Ward Number *",
          department: "Department *",
          selectDepartment: "Select department",
          totalBeds: "Total Beds *",
          wardType: "Ward Type *",
          selectWardType: "Select ward type",
          floor: "Floor",
          building: "Building",
          phone: "Phone",
          extension: "Extension",
          cancel: "Cancel",
          updating: "Updating...",
          updateWard: "Update Ward",
          success: "Ward updated successfully",
          failed: "Failed to update ward",
          error: "An error occurred while updating the ward"
        },
        editDepartment: {
          title: "Edit Department",
          departmentName: "Department Name *",
          description: "Description",
          headOfDepartment: "Head of Department",
          selectHead: "Select head of department",
          specialties: "Specialties",
          addSpecialty: "Add new specialty",
          phone: "Phone",
          email: "Email",
          cancel: "Cancel",
          updating: "Updating...",
          updateDepartment: "Update Department",
          success: "Department updated successfully",
          failed: "Failed to update department",
          error: "An error occurred while updating the department"
        },
        viewDepartment: {
          title: "Department Details",
          description: "Description",
          headOfDepartment: "Head of Department",
          specialties: "Specialties",
          contactInfo: "Contact Information",
          created: "Created",
          close: "Close",
          active: "Active",
          inactive: "Inactive"
        },
      }
    },

    createTaskModal: {
      title: "إنشاء مهمة مريض",
      patient: "المريض",
      assignTo: "تعيين إلى",
      taskTitle: "عنوان المهمة",
      description: "الوصف",
      taskType: "نوع المهمة",
      priority: "الأولوية",
      dueDateTime: "تاريخ ووقت الاستحقاق",
      cancel: "إلغاء",
      createTask: "إنشاء مهمة",
      creating: "جارٍ الإنشاء...",
      fillRequiredFields: "يرجى ملء جميع الحقول المطلوبة",
      assignPermissionError: "يمكن تعيين المهام فقط للممرضات في نفس القسم أو الجناح كالمريض",
      success: "تم إنشاء المهمة بنجاح",
      failed: "فشل في إنشاء المهمة",
      insufficientPermissions: "صلاحيات غير كافية لإنشاء المهام",
      loading: "جارٍ تحميل المرضى والممرضات...",
      selectPatient: "اختر مريضاً",
      selectNurse: "اختر ممرضة",
      taskTitlePlaceholder: "مثال: إعطاء مضادات حيوية وريدية",
      descriptionPlaceholder: "تفاصيل إضافية أو تعليمات...",
      taskTypes: {
        assessment: "تقييم",
        medication: "أدوية",
        vital_check: "فحص العلامات الحيوية",
        documentation: "توثيق",
        custom: "مخصص"
      },
      priorities: {
        low: "منخفض",
        medium: "متوسط",
        high: "عالي",
        urgent: "عاجل"
      }
    },

    // Patients Page
    patientsPage: {
      title: "Patient Management",
      addPatient: "Add Patient",
      noPatientSelected: "No Patient Selected",
      noPatientSelectedDesc: "Search for a patient to view their details, or create a new patient record.",
    },

    // Patient Search Component
    patientSearch: {
      placeholder: "Search for a patient by name or MRN...",
      searching: "Searching...",
      noPatientsFound: "No patients found.",
      startTyping: "Start typing to search.",
    },

    // Nurse Dashboard
    nurseDashboard: {
      title: "Nursing Dashboard",
      subtitle: "Comprehensive patient care and monitoring",
      searchPatients: "Search Patients",
      searchPatientsDesc: "Find and access patient records across the system",
      myPatients: "My Patients",
      patientsUnderCare: "{count} patients under your care",
      patientSearch: "Patient Search",
      patientSearchDesc: "Search and access patient records",
      backToOverview: "Back to Overview",
      searchPlaceholder: "Search patients by name or MRN...",
      noPatientsFound: "No patients found",
      noPatientsFoundDesc:
        "Try adjusting your search terms or check the spelling",
      searchForPatients: "Search for patients",
      searchForPatientsDesc:
        "Enter a patient name or MRN in the search box above to get started",
      noPatientsAssigned: "No patients assigned",
      noPatientsAssignedDesc:
        "You currently have no patients assigned to your care.",
      underCare: "Under Care",
      mrn: "MRN",
      nursingCareWorkflow: "Nursing Care Workflow",
      patientAssessment: "Patient Assessment",
      patientAssessmentDesc: "Review patient history and current status",
      fullName: "Full Name",
      dateOfBirth: "Date of Birth",
      email: "Email",
      phone: "Phone",
      admissionType: "Admission Type",
      department: "Department",
      vitalSignsMonitoring: "Vital Signs Monitoring",
      vitalSignsMonitoringDesc: "Monitor and record patient vital signs",
      medicationAdministration: "Medication Administration",
      medicationAdministrationDesc: "Manage and administer patient medications",
      careDocumentation: "Care Documentation",
      careDocumentationDesc:
        "Document nursing care and observations using SOAP notes and clinical notes",
      nursingCarePlanning: "Nursing Care Planning",
      nursingCarePlanningDesc:
        "Create and manage comprehensive nursing care plans with diagnoses, interventions, and outcomes",
      activityFeedComingSoon: "Activity Feed Coming Soon",
      activityFeedDesc:
        "Real-time activity tracking for patient care actions will be available soon. This will show vital sign recordings, medication administrations, and other care activities.",
    },


    appointmentsDisplay: {
      title: "Appointments",
      bookAppointment: "Book Appointment",
      noAppointmentsYet: "No Appointments Yet",
      scheduleAppointmentsDesc:
        "Schedule appointments to track patient visits and follow-ups.",
      scheduleFirstAppointment: "Schedule First Appointment",
      date: "Date",
      reason: "Reason",
      status: "Status",
      scheduled: "scheduled",
      confirmed: "confirmed",
      completed: "completed",
      cancelled: "cancelled",
      confirm: "Confirm",
      failedToFetch: "Failed to fetch appointments",
      failedToConfirm: "Failed to confirm appointment",
    },

    // Call Component
    call: {
      cameraOff: "Camera is off",
      inCallMessages: "In-call messages",
      typeMessage: "Type a message...",
      callLinkCopied: "Call link copied to clipboard!",
      yourScreen: "Your Screen",
      screenSharingOptions: "Screen sharing options",
      shareScreen: "Share screen",
      stopSharing: "Stop Sharing",
      shareSomethingElse: "Share Something Else",
      gestureControlEnabled: "Gesture control enabled!",
      videoNotReady: "Video not ready yet – try again in a second.",
      unmute: "Unmute",
      mute: "Mute",
      turnCameraOn: "Turn Camera On",
      turnCameraOff: "Turn Camera Off",
      endCall: "End Call",
      maximize: "Maximize",
      disableGestures: "Disable Gestures",
      enableGestures: "Enable Gestures",
      inviteMembers: "Invite Members",
      copyInviteLink: "Copy Invite Link",
      minimize: "Minimize",
      closeChat: "Close Chat",
      openChat: "Open Chat",
      disableGestureControl: "Disable Gesture Control",
      enableGestureControl: "Enable Gesture Control",
      gestureControlDisabled: "Gesture control disabled.",
    },

    auditLogDisplay: {
      title: "Audit Log",
      date: "Date",
      action: "Action",
      user: "User",
      error: "Error",
      noAuditLogsYet: "No Audit Logs Yet",
      auditLogsDescription: "Audit logs will appear here as actions are performed on this patient's record.",
      failedToFetch: "Failed to fetch audit logs"
    },

    labOrdersDisplay: {
      title: "Lab Orders",
      newOrder: "New Order",
      labDashboard: "Lab Dashboard",
      labOrderPrefix: "Lab Order #",
      testsRequested: "Tests Requested",
      orderedOn: "Ordered On",
      completedOn: "Completed On",
      view: "View",
      noLabOrdersYet: "No Lab Orders Yet",
      labOrdersDescription: "Request laboratory tests and track their status here.",
      requestFirstLabOrder: "Request First Lab Order",
      failedToFetch: "Failed to fetch lab orders"
    },

    labTechnicianDashboard: {
      newLabOrderRequest: "New Lab Order Request",
      newLabOrderDescription: "A new lab order has been created for patient {patientId}"
    },

    insuranceDisplay: {
      title: "Insurance",
      error: "Error",
      provider: "Provider",
      policyNumber: "Policy Number",
      groupNumber: "Group Number",
      subscriber: "Subscriber",
      subscriberDob: "Subscriber DOB",
      relationship: "Relationship",
      noInsuranceInformation: "No Insurance Information",
      insuranceDetailsDescription: "Insurance details will be displayed here once they are added to the patient's record.",
      failedToFetch: "Failed to fetch insurance details"
    },

    admissionsPage: {
      title: "Admission Management",
      subtitle: "Manage patient admissions and ward assignments",
      requestAdmission: "Request Admission",
      new: "New",
      stats: {
        pendingReview: "Pending Review",
        approved: "Approved",
        assigned: "Assigned",
        totalActive: "Total Active"
      },
      tabs: {
        all: "All",
        pending: "Pending",
        approved: "Approved",
        assigned: "Assigned",
        done: "Done"
      },
      emptyState: {
        noAdmissionsFound: "No admissions found",
        noAdmissionsYet: "No admissions have been requested yet.",
        noTabAdmissions: "No {tab} admissions."
      },
      labels: {
        mrn: "MRN:",
        doctor: "Doctor:",
        requested: "Requested:",
        matronNurse: "Matron Nurse:",
        ward: "Ward:",
        bed: "Bed:",
        reason: "Reason:",
        doctorNotes: "Doctor Notes:",
        matronNurseNotes: "Matron Nurse Notes:"
      },
      buttons: {
        view: "View",
        approve: "Approve",
        assignWard: "Assign Ward",
        assign: "Assign",
        cancel: "Cancel"
      },
      errors: {
        failedToFetch: "Failed to fetch admissions",
        errorFetching: "An error occurred while fetching admissions",
        failedToAction: "Failed to {action} admission",
        errorActioning: "An error occurred while {action}ing admission"
      },
      success: {
        actionSuccess: "Admission {action} successfully"
      },
      loading: "Loading admissions..."
    },

    labDashboard: {
      title: "Lab Dashboard",
      stats: {
        pendingOrders: "Pending Orders",
        completedOrders: "Completed Orders",
        totalOrders: "Total Orders"
      },
      searchPlaceholder: "Search by patient or test...",
      filter: {
        allStatuses: "All Statuses",
        pending: "Pending",
        completed: "Completed",
        cancelled: "Cancelled"
      },
      labels: {
        testsRequested: "Tests Requested",
        requestedOn: "Requested On",
        submittedOn: "Submitted On",
        notes: "Notes"
      },
      buttons: {
        viewDetails: "View Details",
        uploadResult: "Upload Result",
        editResult: "Edit Result"
      },
      emptyState: {
        noMatchingOrders: "No Matching Lab Orders",
        adjustSearch: "Try adjusting your search or filter."
      }
    },

    addAdmissionModal: {
      title: "Request Patient Admission",
      labels: {
        selectPatient: "Select Patient",
        loadingPatients: "Loading patients...",
        selectPatientPlaceholder: "Select a patient",
        reasonForAdmission: "Reason for Admission *",
        reasonPlaceholder: "Describe the medical reason for admission...",
        urgencyLevel: "Urgency Level *",
        urgencyLevelPlaceholder: "Select urgency level",
        department: "Department *",
        loadingDepartments: "Loading departments...",
        selectDepartment: "Select department",
        ward: "Ward *",
        selectDepartmentFirst: "Select department first",
        loadingWards: "Loading wards...",
        selectWard: "Select ward",
        estimatedStay: "Estimated Stay (days)",
        estimatedStayPlaceholder: "Optional: estimated length of stay",
        specialRequirements: "Special Requirements",
        doctorNotes: "Doctor Notes",
        doctorNotesPlaceholder: "Additional notes or instructions..."
      },
      urgencyLevels: {
        routine: "Routine",
        urgent: "Urgent",
        emergency: "Emergency"
      },
      specialRequirements: [
        "Isolation",
        "Intensive Care",
        "Ventilator Support",
        "Dialysis",
        "Telemetry Monitoring",
        "Private Room",
        "Wheelchair Accessible",
        "Bariatric Bed"
      ],
      wardDisplayText: "{name} (Ward {number}) - {available} beds available",
      buttons: {
        cancel: "Cancel",
        submitting: "Submitting...",
        requestAdmission: "Request Admission"
      },
      success: {
        submitted: "Admission request submitted successfully"
      },
      errors: {
        failedToSubmit: "Failed to submit admission request",
        errorSubmitting: "An error occurred while submitting the admission request"
      }
    },

    admissionDetailsModal: {
      title: "Admission Details",
      labels: {
        mrn: "MRN:",
        age: "Age:",
        gender: "Gender:",
        doctor: "Doctor:",
        requested: "Requested:",
        status: "Status:",
        reasonForAdmission: "Reason for Admission",
        estimatedStay: "Estimated Stay",
        specialRequirements: "Special Requirements",
        doctorNotes: "Doctor Notes",
        matronNurseNotes: "Matron Nurse Notes",
        wardAssignment: "Ward Assignment",
        approvalNotes: "Approval Notes",
        approvalNotesPlaceholder: "Add approval notes...",
        departmentRequired: "Department *",
        selectDepartment: "Select department",
        wardRequired: "Ward *",
        selectDepartmentFirst: "Select department first",
        loadingWards: "Loading wards...",
        selectWard: "Select ward",
        department: "Department",
        ward: "Ward",
        bedNumber: "Bed Number",
        bedNumberPlaceholder: "e.g., B001"
      },
      sections: {
        approveAdmissionRequest: "Approve Admission Request",
        assignWardAndBed: "Assign Ward and Bed"
      },
      buttons: {
        approveAdmission: "Approve Admission",
        assignWardAndBed: "Assign Ward & Bed",
        close: "Close",
        cancelAdmission: "Cancel Admission"
      },
      success: {
        actionSuccess: "Admission {action} successfully"
      },
      errors: {
        failedToAction: "Failed to {action} admission",
        errorActioning: "An error occurred while {action}ing admission"
      },
      wardDisplayText: "{name} (Ward {number}) - {available} beds available"
    },
  },

  ar: {
    // Dashboard Page
    dashboard: {
      welcome: "أهلاً بعودتك",
      loadingDashboard: "جارٍ تحميل لوحة التحكم الخاصة بك...",
      loading: "جارٍ تحميل لوحة التحكم...",
      currentShift: "المناوبة الحالية",
      upcomingShift: "المناوبة القادمة",
      noPersonalShifts: "لا توجد مناوبات شخصية",
      activeShifts: "نشط",
      activeAlerts: "التنبيهات النشطة",
      critical: "حرج",
      urgent: "عاجل",
      pendingAppointments: "المواعيد المعلقة",
      overdue: "متأخر",
      activeStaff: "الموظفين النشطين",
      cardiologyDepartment: "قسم القلب",
      askAIAssistant: "اسأل مساعد الذكاء الاصطناعي",
      departmentActivity: "نشاط القسم",
      recentAuditLogs: "سجلات التدقيق الأخيرة",
      remaining: "متبقي",
      startsIn: "يبدأ خلال",
      noUpcomingShifts: "لا توجد مناوبات قادمة",
    },

    // Sidebar
    sidebar: {
      home: "الرئيسية",
      chat: "الدردشة",
      alerts: "التنبيهات",
      shifts: "المناوبات",
      ehr: "نظام السجلات الطبية",
      admin: "الإدارة",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      ehrMenu: "قائمة السجلات الطبية",
      patients: "المرضى",
      appointments: "المواعيد",
      lab: "المختبر",
      auditLogs: "سجلات التدقيق",
      admissions: "القبول",
      discharges: "الخروج",
      shiftTracking: "تتبع المناوبات",
      hospitalMgmt: "إدارة المستشفى",
      doctorDashboard: "لوحة الطبيب",
      nurseDashboard: "لوحة الممرضة",
      pharmacy: "الصيدلية",
      channels: "القنوات",
      general: "عام",
      directMessages: "الرسائل المباشرة",
      notesToSelf: "ملاحظات للنفس",
      personalSpace: "مساحة شخصية",
    },

    // Common Dashboard Elements
    common: {
      loading: "جارٍ التحميل...",
      error: "خطأ",
      success: "نجح",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تعديل",
      view: "عرض",
      create: "إنشاء",
      update: "تحديث",
      confirm: "تأكيد",
      close: "إغلاق",
    },

    // Chat Component
    chat: {
      callStarted: "بدأ مكالمة",
      callEnded: "انتهت المكالمة. المدة: {duration}",
      joinCall: "انضم للمكالمة",
      messageDeleted: "حذف الرسالة بواسطة {by}",
      replyingTo: "رد على {name}",
      file: "ملف",
      attachedFiles: "الملفات المرفقة",
      processing: "معالجة",
      typeMessage: "اكتب رسالتك...",
      newMessage: "رسالة جديدة",
      searchPeople: "ابحث عن الأشخاص في مؤسستك لبدء محادثة.",
      searchConversations: "البحث في المحادثات",
      startNewChat: "ابدأ محادثة جديدة",
      startSyncCall: "ابدأ مكالمة متزامنة",
      callPermissions:
        "لبدء مكالمة، نحتاج إلى الوصول إلى الكاميرا والميكروفون. سيطلب المتصفح إذنك.",
      proceed: "متابعة",
      sending: "إرسال",
      signInMessage: "سجل الدخول لعرض المحادثات.",
      signInToView: "سجل الدخول لعرض المحادثات.",
      general: "عام",
      directMessages: "الرسائل المباشرة",
      notesToSelf: "ملاحظات للنفس",
      personalSpace: "مساحة شخصية",
      channels: "القنوات",
      addChannel: "إضافة قناة",
      today: "اليوم",
      searchInChat: "البحث في المحادثة...",
      of: "من",
      areYouSure: "هل أنت متأكد؟",
      deleteMessageWarning:
        "سيؤدي هذا الإجراء إلى حذف الرسالة نهائياً. لا يمكن التراجع عن ذلك.",
      typing: "يكتب...",
      aiAssistant: "المساعد الذكي",
      conversationSummary: "ملخص المحادثة",
      comingSoon: "قريباً",
      active: "نشط",
      offHours: "خارج ساعات العمل",
      labOrders: "طلبات المختبر",
      newOrder: "طلب جديد",
      labDashboard: "لوحة المختبر",
      noLabOrders: "لا توجد طلبات مختبر بعد",
      requestLabTests: "اطلب فحوصات المختبر وتتبع حالتها هنا.",
      requestFirstOrder: "اطلب الطلب الأول",
      testsRequested: "الفحوصات المطلوبة",
      orderedOn: "مطلوب في",
      completedOn: "مكتمل في",
    },

    // Audit Logs Component
    auditLogs: {
      failedToLoad: "فشل في تحميل سجلات التدقيق",
      viewAll: "عرض جميع سجلات التدقيق",
      globalAuditLogs: "سجلات التدقيق العالمية",
      date: "التاريخ",
      action: "الإجراء",
      user: "المستخدم",
      targetType: "نوع الهدف",
      targetId: "معرف الهدف",
      noAuditLogsFound: "لم يتم العثور على سجلات تدقيق.",
    },

    // Shift View Component
    shiftView: {
      title: "جدول المناوبات",
      subtitle: "إدارة جداول العمل والمناوبات المتاحة",
      addShift: "إضافة مناوبة",
      todaysShifts: "مناوبات اليوم",
      shifts: "مناوبات",
      shift: "مناوبة",
      noShiftsScheduled: "لا توجد مناوبات مجدولة",
      noShiftsMessage: "لا توجد مناوبات مجدولة لهذا اليوم.",
      scheduleShift: "جدولة مناوبة",
      onCallTeam: "فريق المناوبة",
      onCall: "متاح",
      noOnCallStaff: "لا يوجد موظفين متاحين لهذا اليوم",
      viewNotes: "عرض الملاحظات",
      clockIn: "تسجيل الدخول",
      clockOut: "تسجيل الخروج",
      goOnCall: "الانتقال للمناوبة",
      goOffCall: "الخروج من المناوبة",
      advanced: "متقدم",
      unknown: "غير معروف",
      malformed: "!",
      status: {
        "on-shift": "في المناوبة",
        "on-call": "متاح",
        upcoming: "قادم",
      },
    },

    // Invite List Component
    inviteList: {
      title: "دعوات الفريق",
      subtitle: "إدارة وتتبع دعوات المستخدمين",
      inviteUser: "دعوة مستخدم",
      noInvitations: "لا توجد دعوات بعد",
      buildTeamMessage: "ابدأ في بناء فريقك بإرسال دعوتك الأولى.",
      sendFirstInvite: "إرسال الدعوة الأولى",
      roles: {
        admin: "مدير - وصول كامل",
        doctor: "طبيب - وصول لرعاية المرضى",
        nurse: "ممرض - تنسيق الرعاية",
        labtech: "فني مختبر - نتائج المختبر",
        reception: "استقبال - قبول المرضى",
        manager: "مدير - إشراف القسم",
        staff: "موظف - وصول أساسي",
        user: "مستخدم - وصول أساسي",
      },
      status: {
        pending: "معلق",
        accepted: "مقبول",
        rejected: "مرفوض",
      },
      expires: "تنتهي في {date}",
    },

    // Invite Modal Component
    inviteModal: {
      title: "دعوة عضو فريق",
      subtitle: "إرسال دعوة للانضمام إلى مؤسستك",
      emailAddress: "عنوان البريد الإلكتروني",
      emailPlaceholder: "colleague@hospital.com",
      rolePermissions: "الدور والصلاحيات",
      failedToSend: "فشل في إرسال الدعوة.",
      networkError: "خطأ في الشبكة. يرجى المحاولة مرة أخرى.",
      sending: "إرسال",
      sendInvitation: "إرسال الدعوة",
    },

    // Alerts Page
    alerts: {
      title: "التنبيهات",
      sendAlert: "إرسال تنبيه",
    },

    // Send Alert Modal
    sendAlertModal: {
      criticalAlert: "تنبيه حرج",
      criticalDescription: "طوارئ طبية، يتطلب انتباهاً فورياً.",
      urgentAlert: "تنبيه عاجل",
      urgentDescription: "مطلوب مساعدة، يحتاج رد سريع.",
      infoAlert: "تنبيه معلوماتي",
      infoDescription: "تحديث عام لجميع أعضاء الفريق.",
      sendNewAlert: "إرسال تنبيه جديد",
      alertType: "نوع التنبيه",
      selectAlertType: "اختر نوع التنبيه",
      critical: "حرج",
      urgent: "عاجل",
      info: "معلوماتي",
      recipients: "المستلمون",
      searchUsersOrChannels: "البحث في المستخدمين أو القنوات...",
      selectRecipientError: "يرجى اختيار مستخدم أو قناة واحدة على الأقل.",
      message: "الرسالة",
      describeSituation: "وصف الوضع...",
      cancel: "إلغاء",
      sending: "جارٍ الإرسال...",
      sendAlert: "إرسال التنبيه",
    },

    // Notifications Page
    notifications: {
      loading: "جارٍ تحميل الإشعارات...",
      title: "الإشعارات",
      subtitle: "ابق على اطلاع بأحدث أنشطتك وتنبيهاتك",
      markAllRead: "تحديد الكل كمقروء",
      total: "المجموع",
      unread: "غير مقروء",
      read: "مقروء",
      noNotifications: "لا توجد إشعارات بعد",
      allCaughtUp:
        "أنت على اطلاع بكل شيء! سنخطرك عندما يكون هناك شيء جديد لرؤيته.",
      viewDetails: "عرض التفاصيل",
      from: "من:",
      new: "جديد",
    },

    // Add Shift Modal
    addShiftModal: {
      title: "جدولة مناوبة متقدمة",
      assignToUser: "تعيين للمستخدم",
      loadingUsers: "جارٍ تحميل المستخدمين...",
      selectUser: "اختر مستخدم",
      role: "الدور",
      rolePlaceholder: "سيتم ملء الدور تلقائياً عند اختيار المستخدم",
      department: "القسم",
      selectDepartment: "اختر القسم (اختياري)",
      ward: "الجناح",
      selectWard: "اختر الجناح (اختياري)",
      selectDepartmentFirst: "اختر القسم أولاً",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      multiDayShift: "مناوبة متعددة الأيام: {days} أيام",
      startTime: "وقت البداية",
      endTime: "وقت النهاية",
      shiftNotes: "ملاحظات المناوبة (اختياري)",
      shiftNotesPlaceholder: "أي ملاحظات خاصة لهذه المناوبة",
      cancel: "إلغاء",
      adding: "جارٍ الإضافة...",
      addShift: "إضافة مناوبة",
    },

    // Add Patient Modal
    addPatientModal: {
      title: "إضافة مريض جديد",
    },

    // Add Lab Order Modal
    addLabOrderModal: {
      title: "طلب فحص مختبري",
      testName: "اسم الفحص",
      testNamePlaceholder: "مثال: لوحة عمل الدم",
      tests: "الفحوصات",
      testsPlaceholder: "مثال: تعداد الدم، TSH، لوحة الدهون",
      notes: "ملاحظات",
      notesPlaceholder: "ملاحظات اختيارية أو تفاصيل...",
      cancel: "إلغاء",
      submitting: "جارٍ الإرسال...",
      submit: "إرسال",
    },

    // Call Component
    call: {
      cameraOff: "الكاميرا مغلقة",
      inCallMessages: "رسائل أثناء المكالمة",
      typeMessage: "اكتب رسالة...",
      callLinkCopied: "تم نسخ رابط المكالمة إلى الحافظة!",
      yourScreen: "شاشتك",
      screenSharingOptions: "خيارات مشاركة الشاشة",
      shareScreen: "مشاركة الشاشة",
      stopSharing: "إيقاف المشاركة",
      shareSomethingElse: "مشاركة شيء آخر",
      gestureControlEnabled: "تم تفعيل التحكم بالإيماءات!",
      videoNotReady: "الفيديو غير جاهز بعد - جرب مرة أخرى خلال ثانية.",
      unmute: "تشغيل الصوت",
      mute: "كتم الصوت",
      turnCameraOn: "تشغيل الكاميرا",
      turnCameraOff: "إيقاف الكاميرا",
      endCall: "إنهاء المكالمة",
      maximize: "تكبير",
      disableGestures: "تعطيل الإيماءات",
      enableGestures: "تفعيل الإيماءات",
      inviteMembers: "دعوة الأعضاء",
      copyInviteLink: "نسخ رابط الدعوة",
      minimize: "تصغير",
      closeChat: "إغلاق الدردشة",
      openChat: "فتح الدردشة",
      disableGestureControl: "تعطيل التحكم بالإيماءات",
      enableGestureControl: "تفعيل التحكم بالإيماءات",
      gestureControlDisabled: "تم تعطيل التحكم بالإيماءات.",
    },

    // Channel Members Modal
    channelMembersModal: {
      title: "أعضاء القناة",
      searchMembers: "البحث في الأعضاء...",
      noMembersFound: "لم يتم العثور على أعضاء.",
    },

    // User Profile Card
    userProfileCard: {
      channels: "القنوات",
      notMemberOfChannels: "ليس عضواً في أي قنوات بعد.",
      message: "رسالة",
    },

    // Create Channel Modal
    createChannelModal: {
      title: "إنشاء قناة جديدة",
      nameLabel: "الاسم",
      namePlaceholder: "مثال: تحديثات-المرضى",
      emptyNameError: "لا يمكن أن يكون اسم القناة فارغاً.",
      createFailedError: "فشل في إنشاء القناة.",
      unexpectedError: "حدث خطأ غير متوقع.",
      cancel: "إلغاء",
      createChannel: "إنشاء قناة",
    },

    // Add Prescription Modal
    addPrescriptionModal: {
      title: "الوصفة الطبية المهنية",
      prescriptionItems: "عناصر الوصفة",
      addItem: "إضافة عنصر",
      prescriptionItemsReady: "عنصر(عناصر) الوصفة جاهز",
      prescriptionDetails: "تفاصيل الوصفة",
      calendarType: "نوع التقويم",
      gregorian: "الميلادي (م)",
      hijri: "الهجري (هـ)",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية (اختياري)",
      reasonForPrescription: "سبب الوصفة الطبية",
      additionalNotes: "ملاحظات إضافية",
      createPrescription: "إنشاء وصفة طبية",
      create: "إنشاء",
      creating: "جارٍ الإنشاء...",
      prescriptionTypes: {
        medication: "الدواء",
        treatment: "العلاج",
        procedure: "الإجراء",
        therapy: "العلاج",
        device: "الجهاز الطبي",
        other: "أخرى",
      },
      dosageForms: {
        tablet: "حبة",
        capsule: "كبسولة",
        syrup: "شراب",
        injection: "حقنة",
        cream: "كريم",
        ointment: "مرهم",
        suppository: "تحميلة",
        inhaler: "استنشاقي",
        nebulizer: "بخاخ",
        drops: "قطرات",
        spray: "رذاذ",
        patch: "لاصقة",
        gel: "جيل",
        lotion: "لوشن",
      },
      routes: {
        oral: "فموي",
        intravenous: "وريدي",
        intramuscular: "عضلي",
        subcutaneous: "تحت الجلد",
        topical: "موضعي",
        inhaled: "استنشاقي",
        rectal: "شرجي",
        vaginal: "مهبلي",
        ophthalmic: "عيني",
        otic: "أذني",
        nasal: "أنفي",
        sublingual: "تحت اللسان",
        buccal: "خدي",
      },
      frequencies: {
        onceDaily: "مرة يومياً",
        twiceDaily: "مرتين يومياً",
        threeTimesDaily: "ثلاث مرات يومياً",
        fourTimesDaily: "أربع مرات يومياً",
        every4Hours: "كل 4 ساعات",
        every6Hours: "كل 6 ساعات",
        every8Hours: "كل 8 ساعات",
        every12Hours: "كل 12 ساعات",
        asNeeded: "حسب الحاجة",
        beforeMeals: "قبل الوجبات",
        afterMeals: "بعد الوجبات",
        atBedtime: "عند النوم",
        weekly: "أسبوعياً",
        monthly: "شهرياً",
      },
      durationUnits: {
        days: "أيام",
        weeks: "أسابيع",
        months: "أشهر",
      },
      labels: {
        type: "النوع",
        name: "الاسم",
        strengthDose: "القوة/الجرعة",
        form: "الشكل",
        route: "الطريقة",
        frequency: "التكرار",
        duration: "المدة",
        quantity: "الكمية",
        refills: "التجديدات",
        specificInstructions: "تعليمات محددة",
      },
      placeholders: {
        enterName: "أدخل الاسم",
        strengthExample: "مثال: 500 مجم",
        selectForm: "اختر الشكل",
        selectRoute: "اختر الطريقة",
        selectFrequency: "اختر التكرار",
        duration: "المدة",
        quantity: "الكمية",
        refills: "التجديدات",
        specificInstructions: "أدخل تعليمات محددة لهذا العنصر الطبي...",
        reasonForPrescription: "أدخل السبب الطبي لهذه الوصفة...",
        additionalNotes: "أي ملاحظات إضافية أو تعليمات خاصة...",
      },
    },

    // Administration Details Modal
    administrationDetailsModal: {
      title: "سجل الإعطاء",
      administeredBy: "أعطى:",
      doseAdministered: "الجرعة المعطاة:",
      notes: "ملاحظات:",
      noAdministrations: "لا توجد إعطاءات بعد",
      noAdministrationsMessage: "لم يتم إعطاء هذا الوصفة الطبية بعد.",
    },

    // Appointment Card
    appointmentCard: {
      mrn: "رقم السجل الطبي",
      scheduled: "مجدول",
      confirmed: "مؤكد",
      cancelled: "ملغي",
    },

    // Add SOAP Note Modal
    addSOAPNoteModal: {
      title: "إضافة ملاحظة SOAP",
      subtitle: "توثيق شامل للمريض باستخدام تنسيق SOAP",
      subjective: "الذاتي",
      subjectivePlaceholder: "تقرير المريض الذاتي...",
      objective: "الموضوعي",
      objectivePlaceholder: "النتائج الموضوعية...",
      assessment: "التقييم",
      assessmentPlaceholder: "تقييمك...",
      plan: "الخطة",
      planPlaceholder: "خطتك للمريض...",
      visibility: "الرؤية",
      selectVisibility: "اختر الرؤية",
      team: "الفريق",
      private: "خاص",
      public: "عام",
      cancel: "إلغاء",
      saveSOAPNote: "حفظ ملاحظة SOAP",
      saving: "جارٍ الحفظ...",
      subjectiveRequired: "لا يمكن أن يكون القسم الذاتي فارغاً",
      objectiveRequired: "لا يمكن أن يكون القسم الموضوعي فارغاً",
      assessmentRequired: "لا يمكن أن يكون القسم التقييمي فارغاً",
      planRequired: "لا يمكن أن يكون قسم الخطة فارغاً",
      soapNoteAdded: "تم إضافة ملاحظة SOAP بنجاح",
      failedToAddSOAPNote: "فشل في إضافة ملاحظة SOAP",
      errorAddingSOAPNote: "حدث خطأ أثناء إضافة ملاحظة SOAP",
    },

    // Clinical Notes Display
    clinicalNotesDisplay: {
      title: "الملاحظات السريرية",
      subtitle: "توثيق نتائج المريض وملاحظاته",
      newNote: "ملاحظة جديدة",
      soapNote: "ملاحظة SOAP",
      clinicalNote: "ملاحظة سريرية",
      soapNoteLabel: "ملاحظة SOAP",
      subjective: "الذاتي",
      objective: "الموضوعي",
      assessment: "التقييم",
      plan: "الخطة",
      noNotesYet: "لا توجد ملاحظات سريرية بعد",
      startDocumenting:
        "ابدأ في توثيق نتائج المريض وملاحظاته بإنشاء ملاحظتك السريرية الأولى.",
      errorFetchingNotes: "حدث خطأ أثناء جلب الملاحظات",
    },

    // Add Clinical Note Modal
    addClinicalNoteModal: {
      title: "إضافة ملاحظة سريرية",
      subtitle: "توثيق نتائج المريض وملاحظاته",
      noteContent: "محتوى الملاحظة",
      noteContentPlaceholder: "اكتب ملاحظتك السريرية هنا...",
      visibility: "الرؤية",
      selectVisibility: "اختر الرؤية",
      team: "الفريق",
      private: "خاص",
      public: "عام",
      cancel: "إلغاء",
      saveNote: "حفظ الملاحظة",
      clinicalNoteAdded: "تم إضافة الملاحظة السريرية بنجاح",
      failedToAddClinicalNote: "فشل في إضافة الملاحظة السريرية",
      errorAddingClinicalNote: "حدث خطأ أثناء إضافة الملاحظة السريرية",
      noteContentRequired: "لا يمكن أن يكون محتوى الملاحظة فارغاً",
    },

    // Nursing Care Plan Display
    nursingCarePlanDisplay: {
      title: "خطط الرعاية التمريضية",
      subtitle: "تخطيط ومراقبة الرعاية الشاملة",
      addCarePlan: "إضافة خطة رعاية",
      noCarePlansYet: "لا توجد خطط رعاية تمريضية بعد",
      noNursingCarePlansYet: "لا توجد خطط رعاية تمريضية بعد",
      createCarePlans: "أنشئ خطط رعاية شاملة لمراقبة وتتبع تقدم رعاية المريض.",
      createNursingCarePlans:
        "أنشئ خطط رعاية تمريضية شاملة مع التشخيصات والتدخلات والنتائج المتوقعة.",
      diagnoses: "التشخيصات",
      interventions: "التدخلات",
      expectedOutcomes: "النتائج المتوقعة",
      evaluation: "التقييم",
      active: "نشط",
      resolved: "محلول",
      inactive: "غير نشط",
    },

    // Appointments Display Component
    appointmentsDisplay: {
      title: "المواعيد",
      bookAppointment: "حجز موعد",
      noAppointmentsYet: "لا توجد مواعيد بعد",
      scheduleAppointmentsDesc:
        "جدولة المواعيد لتتبع زيارات المرضى والمتابعات.",
      scheduleFirstAppointment: "جدولة الموعد الأول",
      date: "التاريخ",
      reason: "السبب",
      status: "الحالة",
      scheduled: "مجدول",
      confirmed: "مؤكد",
      completed: "مكتمل",
      cancelled: "ملغي",
      confirm: "تأكيد",
      failedToFetch: "فشل في جلب المواعيد",
      failedToConfirm: "فشل في تأكيد الموعد",
    },

    // Add Nursing Care Plan Modal
    addNursingCarePlanModal: {
      title: "إضافة خطة رعاية تمريضية",
      diagnosesLabel: "التشخيصات (مفصولة بفواصل)",
      interventionsLabel: "التدخلات (مفصولة بفواصل)",
      outcomesLabel: "النتائج (مفصولة بفواصل)",
      evaluationLabel: "التقييم",
      statusLabel: "الحالة",
      selectStatus: "اختر الحالة",
      active: "نشط",
      resolved: "محلول",
      inactive: "غير نشط",
      cancel: "إلغاء",
      adding: "جارٍ الإضافة...",
      addPlan: "إضافة الخطة",
      evaluationRequired: "التقييم مطلوب عندما تكون الحالة غير نشطة أو محلولة.",
      planAdded: "تم إضافة خطة الرعاية التمريضية بنجاح",
      failedToAdd: "فشل في إضافة خطة الرعاية التمريضية",
    },

    // Patient Detail Component
    patientDetail: {
      overview: "نظرة عامة",
      appointments: "المواعيد",
      insurance: "التأمين",
      auditLog: "سجل التدقيق",
      clinicalNotes: "الملاحظات السريرية",
      assignment: "التعيين",
      dateOfBirth: "تاريخ الميلاد",
      gender: "الجنس",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      emergencyContact: "جهة الاتصال في حالات الطوارئ",
      mrn: "رقم السجل الطبي",
      careTeamAssignment: "تعيين فريق الرعاية",
      careTeamAssignmentDesc: "تعيين مقدمي الرعاية الصحية وإدارة وضع المريض",
      editAssignment: "تعديل التعيين",
      cancel: "إلغاء",
      saveChanges: "حفظ التغييرات",
      saving: "جارٍ الحفظ...",
      assignmentUpdated: "تم تحديث تعيين المريض بنجاح",
      assignmentUpdateFailed: "فشل في تحديث تعيين المريض",
      assignmentError: "حدث خطأ أثناء تحديث التعيين",
      careTeam: "فريق الرعاية",
      assignedNurse: "الممرضة المعينة",
      assignedDoctor: "الطبيب المعين",
      selectNurse: "اختر ممرضة",
      selectDoctor: "اختر طبيباً",
      unassigned: "غير معين",
      notAssigned: "غير معين",
      locationAdmission: "الموقع والقبول",
      ward: "الجناح",
      department: "القسم",
      room: "الغرفة",
      bed: "السرير",
      wardPlaceholder: "مثال: العناية المركزة، الجناح 3أ",
      departmentPlaceholder: "مثال: القلب",
      roomPlaceholder: "رقم الغرفة",
      bedPlaceholder: "رقم السرير",
      admissionDetails: "تفاصيل القبول",
      admissionType: "نوع القبول",
      careLevel: "مستوى الرعاية",
      admissionDate: "تاريخ القبول",
      dischargeDate: "تاريخ الخروج",
      selectAdmissionType: "اختر نوع القبول",
      selectCareLevel: "اختر مستوى الرعاية",
      notSpecified: "غير محدد",
      inpatient: "مريض داخلي",
      outpatient: "مريض خارجي",
      emergency: "طوارئ",
      daySurgery: "جراحة يومية",
      critical: "حرج",
      intermediate: "متوسط",
      basic: "أساسي",
      notSet: "غير محدد",
      safetyMobility: "السلامة والحركة",
      isolationStatus: "حالة العزل",
      fallRisk: "خطر السقوط",
      mobilityStatus: "حالة الحركة",
      selectIsolationStatus: "اختر حالة العزل",
      selectFallRisk: "اختر مستوى خطر السقوط",
      selectMobilityStatus: "اختر حالة الحركة",
      none: "لا يوجد",
      contact: "مخالطة",
      droplet: "قطيرات",
      airborne: "جوي",
      notAssessed: "غير مقيم",
      low: "منخفض",
      medium: "متوسط",
      high: "عالي",
      independent: "مستقل",
      assisted: "مساعد",
      wheelchair: "كرسي متحرك",
      bedridden: "مقعد على السرير",
    },

    // Appointments
    appointments: {
      title: "المواعيد",
      bookAppointment: "حجز موعد",
      allAppointments: "جميع المواعيد",
      appointmentsFor: "مواعيد لـ",
      noAppointments: "لم يتم العثور على مواعيد",
      searchPatients: "البحث عن المرضى...",
      selectPatient: "اختر مريضاً...",
      noPatientFound: "لم يتم العثور على مريض.",
      appointmentType: "نوع الموعد",
      selectType: "اختر نوعاً",
      purposeOfVisit: "غرض الزيارة",
      specifyReason: "يرجى تحديد السبب",
      selectDate: "اختر وقتاً متاحاً",
      noSlots: "لا توجد فترات متاحة",
      selectDateAndPersonnel: "اختر التاريخ والموظف أولاً",
      personnelType: "نوع الموظف",
      selectPersonnelType: "اختر نوعاً",
      healthPersonnel: "الموظف الصحي",
      selectProfessional: "اختر متخصصاً",
      booking: "جارٍ الحجز...",
      bookAppointmentBtn: "حجز الموعد",
      bookNewAppointment: "حجز موعد جديد",
      scheduleAppointment: "جدولة موعد جديد للمريض",
      findPatient: "البحث عن مريض",
      generalConsultation: "استشارة عامة",
      followup: "متابعة",
      specialistConsultation: "استشارة متخصص",
      therapySession: "جلسة علاج",
      routineTest: "فحص روتيني",
      emergency: "طوارئ",
      other: "أخرى",
      doctor: "طبيب",
      nurse: "ممرضة",
      therapist: "معالج",
      labTechnician: "فني مختبر",
      admin: "مدير",
      selectPatientError: "يرجى اختيار مريض.",
      selectDateError: "يرجى اختيار تاريخ الموعد.",
      selectTimeError: "يرجى اختيار وقت الموعد.",
      selectPersonnelError: "يرجى اختيار متخصص صحي.",
      bookingSuccess: "تم حجز الموعد بنجاح!",
      bookingFailed: "فشل في حجز الموعد.",
      serverError: "خطأ غير متوقع في الخادم.",
      date: "التاريخ",
      time: "الوقت",
    },

    // Create Diagnosis Component
    createDiagnosis: {
      title: "إنشاء تشخيص",
      icd10CodeLabel: "رمز ICD-10 *",
      icd10CodePlaceholder: "مثال: J00، I10، E11.9",
      severityLabel: "الشدة",
      selectSeverityPlaceholder: "اختر مستوى الشدة",
      diagnosisDescriptionLabel: "وصف التشخيص *",
      diagnosisDescriptionPlaceholder: "قدم وصفاً مفصلاً للتشخيص...",
      onsetDateLabel: "تاريخ البداية",
      markAsPrimaryDiagnosis: "وضع علامة كتشخيص أساسي",
      clinicalNotesLabel: "الملاحظات السريرية",
      clinicalNotesPlaceholder: "أضف أي ملاحظات سريرية إضافية أو ملاحظات أو اعتبارات علاجية...",
      creatingDiagnosis: "جارٍ إنشاء التشخيص...",
      createDiagnosis: "إنشاء تشخيص",
      icd10CodeRequired: "رمز ICD-10 مطلوب",
      diagnosisDescriptionRequired: "وصف التشخيص مطلوب",
      severityRequired: "يرجى اختيار مستوى الشدة",
      invalidOnsetDate: "يرجى اختيار تاريخ بداية صحيح",
      diagnosisCreated: "تم إنشاء التشخيص بنجاح",
      failedToCreate: "فشل في إنشاء التشخيص",
      errorCreating: "حدث خطأ أثناء إنشاء التشخيص",
      severity: {
        mild: "خفيف",
        moderate: "متوسط",
        severe: "شديد",
      },
    },

    // Manage Channel Modal
    manageChannelModal: {
      title: "إدارة #{channelName}",
      addMembers: "إضافة أعضاء",
      searchPlaceholder: "البحث عن أشخاص للإضافة...",
      noUsersFound: "لم يتم العثور على مستخدمين.",
      membersCount: "{count} عضو(أعضاء)",
      memberAdded: "تم إضافة العضو بنجاح.",
      memberRemoved: "تم إزالة العضو بنجاح.",
      failedToAdd: "فشل في إضافة العضو.",
      failedToRemove: "فشل في إزالة العضو.",
      errorAdding: "حدث خطأ أثناء محاولة إضافة عضو.",
      errorRemoving: "حدث خطأ أثناء محاولة إزالة عضو.",
    },

    // Thread View
    threadView: {
      title: "المحادثة",
      replyPlaceholder: "الرد في المحادثة...",
    },

    // Patients Page
    patientsPage: {
      title: "إدارة المرضى",
      addPatient: "إضافة مريض",
      noPatientSelected: "لم يتم اختيار مريض",
      noPatientSelectedDesc: "ابحث عن مريض لعرض تفاصيله، أو أنشئ سجل مريض جديد.",
    },

    // Patient Search Component
    patientSearch: {
      placeholder: "البحث عن مريض بالاسم أو رقم السجل...",
      searching: "جارٍ البحث...",
      noPatientsFound: "لم يتم العثور على مرضى.",
      startTyping: "ابدأ الكتابة للبحث.",
    },

    // Nurse Dashboard
    nurseDashboard: {
      title: "لوحة الممرضة",
      subtitle: "رعاية شاملة للمرضى والمراقبة",
      searchPatients: "البحث عن المرضى",
      searchPatientsDesc: "العثور على سجلات المرضى والوصول إليها عبر النظام",
      myPatients: "مرضاي",
      patientsUnderCare: "{count} مريض تحت رعايتي",
      patientSearch: "البحث عن المريض",
      patientSearchDesc: "البحث في سجلات المرضى والوصول إليها",
      backToOverview: "العودة إلى النظرة العامة",
      searchPlaceholder: "البحث عن المرضى بالاسم أو رقم السجل...",
      noPatientsFound: "لم يتم العثور على مرضى",
      noPatientsFoundDesc: "جرب تعديل مصطلحات البحث أو تحقق من الإملاء",
      searchForPatients: "البحث عن المرضى",
      searchForPatientsDesc:
        "أدخل اسم مريض أو رقم سجل في مربع البحث أعلاه للبدء",
      noPatientsAssigned: "لا يوجد مرضى مخصصون",
      noPatientsAssignedDesc: "ليس لديك حالياً أي مرضى مخصصين لرعايتك.",
      underCare: "تحت الرعاية",
      mrn: "رقم السجل الطبي",
      nursingCareWorkflow: "سير عمل الرعاية التمريضية",
      patientAssessment: "تقييم المريض",
      patientAssessmentDesc: "مراجعة تاريخ المريض والحالة الحالية",
      fullName: "الاسم الكامل",
      dateOfBirth: "تاريخ الميلاد",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      admissionType: "نوع القبول",
      department: "القسم",
      vitalSignsMonitoring: "مراقبة العلامات الحيوية",
      vitalSignsMonitoringDesc: "مراقبة وتسجيل العلامات الحيوية للمريض",
      medicationAdministration: "إعطاء الأدوية",
      medicationAdministrationDesc: "إدارة وإعطاء أدوية المريض",
      careDocumentation: "توثيق الرعاية",
      careDocumentationDesc:
        "توثيق الرعاية التمريضية والملاحظات باستخدام ملاحظات SOAP والملاحظات السريرية",
      nursingCarePlanning: "تخطيط الرعاية التمريضية",
      nursingCarePlanningDesc:
        "إنشاء وإدارة خطط الرعاية التمريضية الشاملة مع التشخيصات والتدخلات والنتائج",
      activityFeedComingSoon: "تغذية الأنشطة قريباً",
      activityFeedDesc:
        "سيكون تتبع الأنشطة في الوقت الفعلي متاحاً قريباً لإجراءات رعاية المرضى. سيعرض هذا تسجيلات العلامات الحيوية وإعطاءات الأدوية والأنشطة الأخرى.",
    },

    // Doctor Dashboard
    doctorDashboard: {
      title: "لوحة الطبيب",
      subtitle: "اختر مريضاً لبدء سير العمل الطبي",
      searchPlaceholder: "البحث عن المرضى بالاسم أو رقم السجل...",
      noPatientsFound: "لم يتم العثور على مرضى",
      noPatientsFoundDesc: "جرب تعديل مصطلحات البحث أو تحقق من الإملاء",
      searchForPatients: "البحث عن المرضى",
      searchForPatientsDesc:
        "أدخل اسم مريض أو رقم سجل في مربع البحث أعلاه للبدء",
      backToPatients: "العودة إلى المرضى",
      activePatient: "المريض النشط",
      medicalWorkflow: "سير العمل الطبي",
      patientAssessment: "تقييم المريض",
      patientAssessmentDesc: "مراجعة تاريخ المريض والحالة الحالية",
      patientOverview: "نظرة عامة على المريض",
      fullName: "الاسم الكامل",
      mrn: "رقم السجل الطبي",
      dateOfBirth: "تاريخ الميلاد",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      gender: "الجنس",
      admissionDate: "تاريخ القبول",
      admissionType: "نوع القبول",
      department: "القسم",
      diagnosisAndTreatment: "التشخيص والعلاج",
      diagnosisAndTreatmentDesc: "إنشاء وعرض تشخيصات المريض",
      createDiagnosis: "إنشاء تشخيص",
      diagnosisHistory: "تاريخ التشخيصات",
      noDiagnosesRecorded: "لم يتم تسجيل تشخيصات بعد",
      prescriptionManagement: "إدارة الوصفات الطبية",
      prescriptionManagementDesc: "إدارة وصفات المريض والأدوية",
      addPrescription: "إضافة وصفة طبية",
      documentationAndConsent: "التوثيق والموافقة",
      documentationAndConsentDesc: "إكمال توثيق المريض وإدارة نماذج الموافقة",
      followupAndScheduling: "المتابعة والجدولة",
      followupAndSchedulingDesc: "جدولة المتابعات وإدارة المواعيد",
      diagnosisDetails: "تفاصيل التشخيص",
      icd10Code: "رمز ICD-10",
      severity: "الشدة",
      onsetDate: "تاريخ البداية",
      documentedBy: "وثق بواسطة",
      documentedAt: "وثق في",
      description: "الوصف",
    },

    consentForm: {
      title: "إدارة نماذج الموافقة",
      consentTypes: {
        treatmentConsent: {
          label: "موافقة على العلاج",
          description: "إذن عام للعلاج"
        },
        surgicalConsent: {
          label: "موافقة جراحية",
          description: "إذن للإجراءات الجراحية"
        },
        medicationConsent: {
          label: "موافقة على الأدوية",
          description: "إذن لإعطاء الأدوية"
        },
        disclosureConsent: {
          label: "كشف المعلومات",
          description: "إذن لمشاركة المعلومات"
        },
        researchConsent: {
          label: "المشاركة في البحث",
          description: "موافقة على المشاركة في دراسة بحثية"
        },
        photographyConsent: {
          label: "موافقة على التصوير",
          description: "إذن للتصوير الطبي"
        }
      },
      signingMethods: {
        digital: {
          label: "توقيع رقمي",
          description: "توقيع إلكتروني عبر منصة آمنة"
        },
        inPerson: {
          label: "توقيع حضوري",
          description: "توقيع مادي يتم جمعه حضورياً"
        },
        witnessed: {
          label: "توقيع مشهود",
          description: "توقيع يشهده مقدم الرعاية الصحية"
        }
      },
      formType: "نوع نموذج الموافقة *",
      signingMethod: "طريقة التوقيع",
      uploadDocument: "تحميل وثيقة الموافقة *",
      selectFormType: "اختر نوع نموذج الموافقة",
      selectSigningMethod: "اختر طريقة التوقيع",
      dragDropText: "اسحب وأفلت ملف هنا، أو انقر للاختيار",
      fileTypes: "PDF، DOC، DOCX، PNG، JPG، GIF حتى 10 ميغابايت",
      readyToUpload: "جاهز للتحميل",
      uploading: "جارٍ تحميل نموذج الموافقة...",
      uploadAndSign: "تحميل وتوقيع الموافقة",
      errors: {
        selectFile: "يرجى اختيار ملف للتحميل",
        selectFormType: "يرجى اختيار نوع نموذج الموافقة",
        selectSigningMethod: "يرجى اختيار طريقة التوقيع"
      },
      success: {
        uploaded: "تم تحميل وتوقيع نموذج الموافقة بنجاح"
      },
      failed: {
        uploadFailed: "فشل في تحميل نموذج الموافقة",
        errorOccurred: "حدث خطأ أثناء تحميل نموذج الموافقة"
      }
    },

    vitals: {
      title: "آخر العلامات الحيوية",
      heartRate: "معدل ضربات القلب",
      bloodPressure: "ضغط الدم",
      spo2: "تشبع الأكسجين",
      temperature: "درجة الحرارة",
      respiratoryRate: "معدل التنفس",
      noVitalsRecorded: "لم يتم تسجيل علامات حيوية لهذا المريض بعد.",
      recordVitals: "تسجيل العلامات الحيوية",
      viewAll: "عرض الكل",
      bloodPressureCategories: {
        crisis: "أزمة",
        highStage2: "مرتفع (المرحلة 2)",
        highStage1: "مرتفع (المرحلة 1)",
        elevated: "مرتفع قليلاً",
        normal: "طبيعي",
        nA: "غير متوفر"
      },
      recordVitalsModal: {
        title: "تسجيل العلامات الحيوية لـ {patientName}",
        description: "أدخل آخر علامات حيوية للمريض. جميع الحقول مطلوبة.",
        fields: {
          bpSystolic: "ضغط الدم الانقباضي (ملم زئبق)",
          bpDiastolic: "ضغط الدم الانبساطي (ملم زئبق)",
          heartRate: "معدل ضربات القلب (ضربة/دقيقة)",
          temperature: "درجة الحرارة (°ف)",
          respiratoryRate: "معدل التنفس (نفس/دقيقة)",
          spo2: "تشبع الأكسجين (%)",
          height: "الطول (بوصة)",
          weight: "الوزن (رطل)",
          notes: "ملاحظات"
        },
        bmi: "مؤشر كتلة الجسم (BMI):",
        markAsUrgent: "وضع علامة كعاجل",
        cancel: "إلغاء",
        saveVitals: "حفظ العلامات الحيوية",
        success: "تم تسجيل العلامات الحيوية بنجاح!",
        failed: "فشل في تسجيل العلامات الحيوية.",
        error: "حدث خطأ غير متوقع."
      }
    },

    labResults: {
      title: "آخر نتيجة مختبرية",
      result: "النتيجة",
      collected: "تم جمعها",
      reference: "المرجع",
      reported: "تم الإبلاغ",
      notes: "ملاحظات",
      noLabResultsYet: "لا توجد نتائج مختبرية بعد",
      labResultsDescription: "ستظهر نتائج الفحوصات المخبرية هنا عند توفرها.",
      viewAllResults: "عرض جميع النتائج",
      status: {
        normal: "طبيعي",
        abnormal: "غير طبيعي",
        unknown: "غير معروف"
      },
      error: "خطأ",
      failedToFetch: "فشل في جلب نتائج المختبر"
    },

    // // Prescriptions Page
    // prescriptionsPage: {
    //   title: "تاريخ الوصفات الطبية",
    //   subtitle: "وصفات طبية نشطة • {count} إجمالي",
    //   backToPatient: "العودة إلى المريض",
    //   back: "العودة",
    //   searchPlaceholder: "البحث في الأدوية، الجرعة، أو التكرار...",
    //   filterByStatus: "تصفية حسب الحالة",
    //   allPrescriptions: "جميع الوصفات",
    //   active: "نشط",
    //   completed: "مكتمل",
    //   cancelled: "ملغي",
    //   medications: "الأدوية",
    //   dose: "الجرعة",
    //   frequency: "التكرار",
    //   route: "الطريقة",
    //   status: "الحالة",
    //   statusReason: "سبب الحالة",
    //   prescribed: "موصوف",
    //   duration: "المدة",
    //   administrations: "الإعطاءات",
    //   noMedicationSpecified: "لم يتم تحديد دواء",
    //   days: "أيام",
    //   none: "لا يوجد",
    //   administrationsCount: "إعطاءات",
    //   viewDetails: "عرض التفاصيل",
    //   noPrescriptionsFound: "لم يتم العثور على وصفات",
    //   noPrescriptionsYet: "لا توجد وصفات بعد",
    //   tryAdjustingSearch: "جرب تعديل البحث أو معايير التصفية.",
    //   prescriptionsWillAppear: "ستظهر الوصفات هنا عند وصفها.",
    //   clearFilters: "مسح المرشحات",
    //   failedToFetch: "فشل في جلب الوصفات التاريخية.",
    //   unexpectedError: "حدث خطأ غير متوقع أثناء جلب الوصفات.",
    //   statusUpdated: "تم تحديث الحالة بنجاح",
    //   failedToUpdateStatus: "فشل في تحديث الحالة",
    //   errorUpdatingStatus: "حدث خطأ أثناء تحديث الحالة",
    // },

    labResultsPage: {
      backToPatient: "العودة إلى المريض",
      title: "تاريخ نتائج المختبر",
      subtitle: "{count} نتائج فحص • تتبع تشخيص المريض مع مرور الوقت",
      exportCsv: "تصدير CSV",
      filtersAndSearch: "الفلاتر والبحث",
      searchPlaceholder: "البحث بالاسم أو النتيجة...",
      filterByStatus: "التصفية حسب الحالة",
      filterOptions: {
        all: "جميع النتائج",
        normal: "طبيعي",
        abnormal: "غير طبيعي"
      },
      tableHeaders: {
        testName: "اسم الفحص",
        result: "النتيجة",
        units: "الوحدات",
        refRange: "النطاق المرجعي",
        status: "الحالة",
        collectedAt: "تاريخ الجمع"
      },
      status: {
        normal: "طبيعي",
        abnormal: "غير طبيعي",
        unknown: "غير معروف"
      },
      noResultsFound: "لم يتم العثور على نتائج مختبر مطابقة لمعاييرك.",
      showingResults: "عرض {start} إلى {end} من {total} نتائج",
      previous: "السابق",
      next: "التالي",
      pageInfo: "الصفحة {current} من {total}"
    },

    // Patient Form
    patientForm: {
      personalInformation: "المعلومات الشخصية",
      firstName: "الاسم الأول",
      firstNamePlaceholder: "أحمد",
      lastName: "اسم العائلة",
      lastNamePlaceholder: "محمد",
      dateOfBirth: "تاريخ الميلاد",
      gender: "الجنس",
      selectGender: "اختر الجنس",
      male: "ذكر",
      female: "أنثى",
      other: "أخرى",
      contactInformation: "معلومات الاتصال",
      emailAddress: "عنوان البريد الإلكتروني",
      emailPlaceholder: "ahmed.mohamed@example.com",
      phoneNumber: "رقم الهاتف",
      phonePlaceholder: "123-456-7890",
      address: "العنوان",
      street: "الشارع",
      streetPlaceholder: "شارع الرئيسي 123",
      city: "المدينة",
      cityPlaceholder: "أي مدينة",
      state: "الولاية",
      statePlaceholder: "القاهرة",
      zip: "الرمز البريدي",
      zipPlaceholder: "12345",
      emergencyContact: "جهة الاتصال في حالات الطوارئ",
      fullName: "الاسم الكامل",
      emergencyNamePlaceholder: "فاطمة أحمد",
      insurance: "التأمين",
      provider: "مزود الخدمة",
      providerPlaceholder: "شركة التأمين الصحي",
      policyNumber: "رقم البوليصة",
      policyNumberPlaceholder: "ABC123456789",
      previous: "السابق",
      next: "التالي",
      submit: "إرسال",
    },

    // Prescriptions Display
    prescriptionsDisplay: {
      prescriptions: "الوصفات الطبية",
      addPrescription: "إضافة وصفة طبية",
      fullView: "العرض الكامل",
      administer: "إعطاء",
      hideDetails: "إخفاء التفاصيل",
      showDetails: "إظهار التفاصيل",
      strengthDose: "القوة/الجرعة",
      frequency: "التكرار",
      route: "الطريقة",
      duration: "المدة",
      days: "أيام",
      refills: "التجديدات",
      prescribed: "موصوف",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      instructions: "التعليمات",
      reasonForPrescription: "سبب الوصفة",
      additionalNotes: "ملاحظات إضافية",
      administrationTimeline: "جدول الإعطاء",
      noPrescriptionsYet: "لا توجد وصفات طبية بعد",
      noPrescriptionsDescription: "سيتم عرض الوصفات والأدوية هنا عند وصفها.",
      addFirstPrescription: "إضافة أول وصفة طبية",
      therapyTreatment: "العلاج/المعالجة",
      procedure: "الإجراء",
      medicalDevice: "الجهاز الطبي",
      medication: "الدواء",
      status: {
        active: "نشط",
        completed: "مكتمل",
        cancelled: "ملغي",
      },
      administrationStatus: {
        administered: "تم الإعطاء",
        missed: "فائت",
      },
      administeredBy: "تم الإعطاء بواسطة",
      dose: "الجرعة",
      notes: "الملاحظات",
    },

    pharmacy: {
      title: "لوحة الصيدلية",
      stats: {
        pendingDispensing: "في انتظار التوزيع",
        dispensed: "تم التوزيع",
        totalPrescriptions: "إجمالي الوصفات"
      },
      search: {
        placeholder: "البحث بالمريض أو الدواء...",
        filterByStatus: "تصفية حسب الحالة",
        allStatuses: "جميع الحالات",
        active: "نشط",
        completed: "مكتمل",
        cancelled: "ملغي"
      },
      tabs: {
        pendingDispensing: "في انتظار التوزيع",
        dispensed: "تم التوزيع"
      },
      table: {
        headers: {
          patient: "المريض",
          medication: "الدواء",
          dose: "الجرعة",
          frequency: "التكرار",
          date: "التاريخ",
          status: "الحالة",
          actions: "الإجراءات"
        },
        status: {
          dispensed: "تم التوزيع",
          markAsDispensed: "وضع علامة تم التوزيع"
        }
      },
      empty: {
        noPrescriptions: "لا توجد وصفات",
        noPendingDispensing: "لا توجد وصفات في انتظار التوزيع",
        noDispensedFound: "لم يتم العثور على وصفات موزعة"
      },
      errors: {
        loadingError: "خطأ في تحميل الوصفات",
        refreshFailed: "فشل في تحديث الوصفات"
      }
    },

    testDetailsModal: {
      title: "تفاصيل الفحص",
      sections: {
        patientInformation: "معلومات المريض",
        testInformation: "معلومات الفحص",
        notes: "ملاحظات",
        results: "النتائج"
      },
      labels: {
        name: "الاسم",
        testName: "اسم الفحص",
        testsRequested: "الفحوصات المطلوبة",
        status: "الحالة",
        requestedOn: "مطلوب في",
        submittedOn: "تم الإرسال في"
      },
      fileTypes: {
        pdf: "ملف PDF",
        png: "صورة PNG",
        jpg: "صورة JPEG",
        jpeg: "صورة JPEG",
        gif: "صورة GIF",
        unknown: "ملف غير معروف"
      },
      buttons: {
        close: "إغلاق"
      }
    },

    uploadResultModal: {
      titles: {
        edit: "تعديل نتيجة المختبر",
        upload: "تحميل نتيجة المختبر"
      },
      labels: {
        forOrder: "للطلب:",
        notes: "ملاحظات (اختياري)",
        selectedFiles: "الملفات المحددة:",
        currentResults: "النتائج الحالية:",
        viewResult: "عرض النتيجة"
      },
      placeholders: {
        notes: "أضف أي ملاحظات إضافية أو تفاصيل حول نتيجة المختبر...",
        dragDrop: "اسحب وأفلت ملف هنا، أو انقر للاختيار",
        dragActive: "أفلت الملفات هنا ..."
      },
      fileTypes: "PDF، PNG، JPG، GIF حتى 10 ميغابايت",
      buttons: {
        cancel: "إلغاء",
        uploading: "جارٍ التحميل...",
        updating: "جارٍ التحديث...",
        addResults: "إضافة نتائج",
        uploadResults: "تحميل النتائج",
        updateNotes: "تحديث الملاحظات",
        uploadResult: "تحميل النتيجة"
      }
    },

    dischargesPage: {
      title: "إدارة الخروج",
      subtitle: "تخطيط وإدارة خروج المرضى",
      loading: "جارٍ تحميل عمليات الخروج...",
      errors: {
        fetchFailed: "فشل في جلب عمليات الخروج",
        fetchError: "حدث خطأ أثناء جلب عمليات الخروج",
        actionFailed: "فشل في {action} عملية الخروج",
        actionError: "حدث خطأ أثناء {action} عملية الخروج",
        actionSuccess: "تم {action} عملية الخروج بنجاح"
      },
      buttons: {
        planDischarge: "تخطيط خروج",
        viewDetails: "عرض التفاصيل",
        startProcess: "بدء العملية",
        complete: "إكمال",
        cancel: "إلغاء"
      },
      stats: {
        planned: "مخطط",
        inProgress: "قيد التنفيذ",
        completed: "مكتمل",
        cancelled: "ملغي"
      },
      tabs: {
        all: "الكل",
        planned: "مخطط",
        inProgress: "قيد التنفيذ",
        completed: "مكتمل"
      },
      cardTitle: "عمليات الخروج",
      emptyState: {
        noDischarges: "لم يتم العثور على عمليات خروج",
        noPlansYet: "لم يتم إنشاء خطط خروج بعد.",
        noTabDischarges: "لا توجد عمليات خروج {tab}."
      },
      status: {
        planned: "مخطط",
        in_progress: "قيد التنفيذ",
        completed: "مكتمل",
        cancelled: "ملغي"
      },
      dischargeTypes: {
        routine: "روتيني",
        against_medical_advice: "ضد النصيحة الطبية",
        transfer: "نقل",
        death: "وفاة"
      },
      labels: {
        mrn: "رقم السجل الطبي:",
        doctor: "الطبيب:",
        matronNurse: "الممرضة الرئيسية:",
        plannedDate: "التاريخ المخطط:",
        actualDate: "التاريخ الفعلي:",
        initiated: "بدأ في:",
        reason: "السبب:"
      }
    },

    shiftTrackingPage: {
      title: "تتبع المناوبات",
      subtitle: "إدارة متقدمة للمناوبات وتتبع الوقت",
      loading: "جارٍ تحميل بيانات المناوبات...",
      errors: {
        fetchFailed: "فشل في جلب المناوبات",
        fetchError: "حدث خطأ أثناء جلب المناوبات",
        actionFailed: "فشل في {action} المناوبة",
        actionError: "حدث خطأ أثناء {action} المناوبة",
        actionSuccess: "تم {action} المناوبة بنجاح"
      },
      buttons: {
        scheduleShift: "جدولة مناوبة",
        add: "إضافة",
        details: "التفاصيل",
        clockIn: "تسجيل الدخول",
        clockInShort: "دخول",
        clockOut: "تسجيل الخروج",
        clockOutShort: "خروج",
        break: "استراحة",
        endBreak: "إنهاء الاستراحة",
        endBreakShort: "إنهاء",
        markAbsent: "وضع علامة غائب",
        markAbsentShort: "غائب"
      },
      stats: {
        activeShifts: "المناوبات النشطة",
        onBreak: "في استراحة",
        completedToday: "مكتمل اليوم",
        totalStaff: "إجمالي الموظفين",
        missedShifts: "المناوبات المفقودة"
      },
      tabs: {
        today: "اليوم",
        week: "الأسبوع",
        active: "نشط",
        missed: "مفقود",
        completed: "مكتمل",
        all: "الكل"
      },
      cardTitle: "المناوبات",
      emptyState: {
        noMissedShifts: "لا توجد مناوبات مفقودة",
        noShiftsFound: "لم يتم العثور على مناوبات",
        allOnTrack: "ممتاز! جميع المناوبات المجدولة على المسار الصحيح.",
        noShiftsScheduled: "لم يتم جدولة أي مناوبات بعد.",
        noTabShifts: "لا توجد مناوبات {tab}."
      },
      status: {
        scheduled: "مجدول",
        active: "نشط",
        on_break: "في استراحة",
        completed: "مكتمل",
        absent: "غائب",
        cancelled: "ملغي",
        missed: "مفقود ({duration} دقيقة متأخر)"
      },
      labels: {
        date: "التاريخ:",
        scheduled: "المجدول:",
        started: "بدأ:",
        ended: "انتهى:",
        dept: "القسم:",
        ward: "الجناح:",
        breaks: "الاستراحات:",
        performance: "الأداء:",
        tasks: "المهام:",
        incidents: "الحوادث:",
        interactions: "التفاعلات:"
      },
      badges: {
        basic: "أساسي"
      }
    },

    hospitalManagementPage: {
      title: "Hospital Management",
      subtitle: "Manage departments, wards, and hospital infrastructure",
      loading: "Loading hospital data...",
      errors: {
        fetchFailed: "Failed to load hospital data",
        departmentDeactivated: "Department deactivated successfully",
        departmentDeactivateFailed: "Failed to deactivate department",
        departmentDeactivateError: "An error occurred while deactivating department",
        wardDeactivated: "Ward deactivated successfully",
        wardDeactivateFailed: "Failed to deactivate ward",
        wardDeactivateError: "An error occurred while deactivating ward"
      },
      buttons: {
        refresh: "Refresh",
        addDepartment: "Add Department",
        addWard: "Add Ward",
        view: "View",
        edit: "Edit",
        deactivate: "Deactivate",
        createTask: "Create Task",
        assignStaff: "Assign Staff",
        assign: "Assign"
      },
      stats: {
        departments: "Departments",
        totalWards: "Total Wards",
        totalBeds: "Total Beds",
        availableBeds: "Available Beds",
        totalRooms: "Total Rooms"
      },
      tabs: {
        departments: "Departments",
        wards: "Wards"
      },
      sections: {
        departments: "Departments",
        wards: "Wards"
      },
      status: {
        active: "Active",
        inactive: "Inactive"
      },
      wardTypes: {
        icu: "ICU",
        emergency: "EMERGENCY",
        maternity: "MATERNITY",
        pediatric: "PEDIATRIC",
        surgical: "SURGICAL"
      },
      labels: {
        head: "Head:",
        specialties: "Specialties:",
        department: "Department:",
        beds: "Beds:",
        location: "Location:",
        chargeNurse: "Charge Nurse:",
        noDescription: "No description",
        totalRooms: "Total Rooms",
        available: "available",
        rooms: "rooms"
      },
      confirm: {
        deactivateDepartment: "Are you sure you want to deactivate this department?",
        deactivateWard: "Are you sure you want to deactivate this ward?"
      },
      modals: {
        createTask: {
          title: "Create Patient Task",
          patient: "Patient",
          assignTo: "Assign To",
          taskTitle: "Task Title",
          description: "Description",
          taskType: "Task Type",
          priority: "Priority",
          dueDateTime: "Due Date & Time",
          cancel: "Cancel",
          createTask: "Create Task",
          creating: "Creating...",
          fillRequiredFields: "Please fill in all required fields",
          assignPermissionError: "Can only assign tasks to nurses in the same department or ward as the patient",
          success: "Task created successfully",
          failed: "Failed to create task",
          insufficientPermissions: "Insufficient permissions to create tasks",
          loading: "Loading patients and nurses...",
          selectPatient: "Select patient",
          selectNurse: "Select nurse",
          taskTitlePlaceholder: "e.g., Administer IV antibiotics",
          descriptionPlaceholder: "Additional details or instructions...",
          taskTypes: {
            assessment: "Assessment",
            medication: "Medication",
            vital_check: "Vital Check",
            documentation: "Documentation",
            custom: "Custom"
          },
          priorities: {
            low: "Low",
            medium: "Medium",
            high: "High",
            urgent: "Urgent"
          }
        },
        wardDetails: {
          title: "Ward Details",
          wardInformation: "Ward Information",
          name: "Name",
          type: "Type",
          wardNumber: "Ward Number",
          department: "Department",
          beds: "Beds",
          chargeNurse: "Charge Nurse",
          location: "Location",
          assignedNurses: "Assigned Nurses ({count})",
          noNursesAssigned: "No nurses assigned to this ward",
          assignFirstNurse: "Assign First Nurse",
          close: "Close"
        },
        departmentDetails: {
          title: "Department Details",
          departmentInformation: "Department Information",
          name: "Name",
          status: "Status",
          headOfDepartment: "Head of Department",
          description: "Description",
          specialties: "Specialties",
          assignedStaff: "Assigned Staff ({count})",
          noStaffAssigned: "No staff members assigned to this department",
          assignFirstStaff: "Assign First Staff Member",
          close: "Close"
        },
        assignStaff: {
          title: "Assign Staff to {department}",
          description: "Select staff members to assign to this department.",
          selected: "selected",
          noStaffAvailable: "No staff members available for assignment."
        },
        assignNurses: {
          title: "Assign Nurses to {ward}",
          description: "Select nurses to assign to this ward. Only nurses from the same department can be assigned.",
          selected: "selected",
          noNursesAvailable: "No nurses available for assignment in this department."
        },
        addDepartment: {
          title: "Add New Department",
          departmentName: "Department Name *",
          description: "Description",
          headOfDepartment: "Head of Department",
          selectHead: "Select head of department",
          specialties: "Specialties",
          enterSpecialty: "Enter specialty name",
          phone: "Phone",
          email: "Email",
          cancel: "Cancel",
          creating: "Creating...",
          createDepartment: "Create Department",
          success: "Department created successfully",
          failed: "Failed to create department",
          error: "An error occurred while creating the department"
        },
        addWard: {
          title: "Add New Ward",
          wardName: "Ward Name *",
          wardNumber: "Ward Number *",
          department: "Department *",
          selectDepartment: "Select department",
          totalBeds: "Total Beds *",
          wardType: "Ward Type *",
          selectWardType: "Select ward type",
          floor: "Floor",
          building: "Building",
          phone: "Phone",
          extension: "Extension",
          description: "Description",
          descriptionPlaceholder: "Ward description and facilities...",
          cancel: "Cancel",
          creating: "Creating...",
          createWard: "Create Ward",
          success: "Ward created successfully",
          failed: "Failed to create ward",
          error: "An error occurred while creating the ward"
        },
        viewWard: {
          title: "Ward Details",
          totalBeds: "Total Beds",
          available: "Available",
          department: "Department",
          location: "Location",
          chargeNurse: "Charge Nurse",
          assignedNurses: "Assigned Nurses ({count})",
          contactInfo: "Contact Information",
          phone: "Phone:",
          extension: "Extension:",
          facilities: "Facilities",
          created: "Created",
          close: "Close",
          active: "Active",
          inactive: "Inactive"
        },
        editWard: {
          title: "Edit Ward",
          wardName: "Ward Name *",
          wardNumber: "Ward Number *",
          department: "Department *",
          selectDepartment: "Select department",
          totalBeds: "Total Beds *",
          wardType: "Ward Type *",
          selectWardType: "Select ward type",
          floor: "Floor",
          building: "Building",
          phone: "Phone",
          extension: "Extension",
          cancel: "Cancel",
          updating: "Updating...",
          updateWard: "Update Ward",
          success: "Ward updated successfully",
          failed: "Failed to update ward",
          error: "An error occurred while updating the ward"
        },
        editDepartment: {
          title: "Edit Department",
          departmentName: "Department Name *",
          description: "Description",
          headOfDepartment: "Head of Department",
          selectHead: "Select head of department",
          specialties: "Specialties",
          addSpecialty: "Add new specialty",
          phone: "Phone",
          email: "Email",
          cancel: "Cancel",
          updating: "Updating...",
          updateDepartment: "Update Department",
          success: "Department updated successfully",
          failed: "Failed to update department",
          error: "An error occurred while updating the department"
        },
        viewDepartment: {
          title: "Department Details",
          description: "Description",
          headOfDepartment: "Head of Department",
          specialties: "Specialties",
          contactInfo: "Contact Information",
          created: "Created",
          close: "Close",
          active: "Active",
          inactive: "Inactive"
        }
      }
    },

    createTaskModal: {
      title: "Create Patient Task",
      patient: "Patient",
      assignTo: "Assign To",
      taskTitle: "Task Title",
      description: "Description",
      taskType: "Task Type",
      priority: "Priority",
      dueDateTime: "Due Date & Time",
      cancel: "Cancel",
      createTask: "Create Task",
      creating: "Creating...",
      fillRequiredFields: "Please fill in all required fields",
      assignPermissionError: "Can only assign tasks to nurses in the same department or ward as the patient",
      success: "Task created successfully",
      failed: "Failed to create task",
      insufficientPermissions: "Insufficient permissions to create tasks",
      loading: "Loading patients and nurses...",
      selectPatient: "Select patient",
      selectNurse: "Select nurse",
      taskTitlePlaceholder: "e.g., Administer IV antibiotics",
      descriptionPlaceholder: "Additional details or instructions...",
      taskTypes: {
        assessment: "Assessment",
        medication: "Medication",
        vital_check: "Vital Check",
        documentation: "Documentation",
        custom: "Custom"
      },
      priorities: {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent"
      }
    },

    dispensePrescriptionModal: {
      title: "توزيع الوصفة",
      labels: {
        patient: "المريض:",
        medications: "الأدوية:",
        dose: "الجرعة:",
        frequency: "التكرار:"
      },
      placeholder: "إضافة ملاحظات التوزيع...",
      buttons: {
        cancel: "إلغاء",
        dispensing: "جارٍ التوزيع...",
        markAsDispensed: "وضع علامة تم التوزيع"
      },
      success: "تم وضع علامة تم توزيع الوصفة بنجاح!",
      error: "فشل في توزيع الوصفة"
    },

    // Prescriptions Page
    prescriptionsPage: {
      title: "تاريخ الوصفات الطبية",
      subtitle: "وصفات طبية نشطة • {count} إجمالي",
      backToPatient: "العودة إلى المريض",
      back: "العودة",
      searchPlaceholder: "البحث في الأدوية، الجرعة، أو التكرار...",
      filterByStatus: "تصفية حسب الحالة",
      allPrescriptions: "جميع الوصفات",
      active: "نشط",
      completed: "مكتمل",
      cancelled: "ملغي",
      medications: "الأدوية",
      dose: "الجرعة",
      frequency: "التكرار",
      route: "الطريقة",
      status: "الحالة",
      statusReason: "سبب الحالة",
      prescribed: "موصوف",
      duration: "المدة",
      administrations: "الإعطاءات",
      noMedicationSpecified: "لم يتم تحديد دواء",
      administrationsCount: "إعطاءات",
      lastAdmin: "الأخير: {dose} بواسطة {by} في {date}",
      viewDetails: "عرض التفاصيل",
      noPrescriptionsFound: "لم يتم العثور على وصفات",
      noPrescriptionsYet: "لا توجد وصفات بعد",
      tryAdjustingSearch: "جرب تعديل البحث أو معايير التصفية.",
      prescriptionsWillAppear: "ستظهر الوصفات هنا عند وصفها.",
      clearFilters: "مسح المرشحات",
      failedToFetch: "فشل في جلب الوصفات التاريخية.",
      unexpectedError: "حدث خطأ غير متوقع أثناء جلب الوصفات.",
      statusUpdated: "تم تحديث الحالة بنجاح",
      failedToUpdateStatus: "فشل في تحديث الحالة",
      errorUpdatingStatus: "حدث خطأ أثناء تحديث الحالة",
      days: "أيام",
      none: "لا يوجد",
    },

    auditLogDisplay: {
      title: "سجل التدقيق",
      date: "التاريخ",
      action: "الإجراء",
      user: "المستخدم",
      error: "خطأ",
      noAuditLogsYet: "لا توجد سجلات تدقيق بعد",
      auditLogsDescription: "ستظهر سجلات التدقيق هنا عند تنفيذ الإجراءات على سجل هذا المريض.",
      failedToFetch: "فشل في جلب سجلات التدقيق"
    },

    labOrdersDisplay: {
      title: "طلبات المختبر",
      newOrder: "طلب جديد",
      labDashboard: "لوحة المختبر",
      labOrderPrefix: "طلب المختبر #",
      testsRequested: "الفحوصات المطلوبة",
      orderedOn: "مطلوب في",
      completedOn: "مكتمل في",
      view: "عرض",
      noLabOrdersYet: "لا توجد طلبات مختبر بعد",
      labOrdersDescription: "اطلب فحوصات المختبر وتتبع حالتها هنا.",
      requestFirstLabOrder: "اطلب الطلب الأول",
      failedToFetch: "فشل في جلب طلبات المختبر"
    },

    labTechnicianDashboard: {
      newLabOrderRequest: "طلب مختبر جديد",
      newLabOrderDescription: "تم إنشاء طلب مختبر جديد للمريض {patientId}"
    },

    insuranceDisplay: {
      title: "التأمين",
      error: "خطأ",
      provider: "مزود الخدمة",
      policyNumber: "رقم البوليصة",
      groupNumber: "رقم المجموعة",
      subscriber: "المشترك",
      subscriberDob: "تاريخ ميلاد المشترك",
      relationship: "العلاقة",
      noInsuranceInformation: "لا توجد معلومات تأمين",
      insuranceDetailsDescription: "سيتم عرض تفاصيل التأمين هنا عند إضافتها إلى سجل المريض.",
      failedToFetch: "فشل في جلب تفاصيل التأمين"
    },

    admissionsPage: {
      title: "إدارة القبول",
      subtitle: "إدارة قبول المرضى وتعيين الأجنحة",
      requestAdmission: "طلب قبول",
      new: "جديد",
      stats: {
        pendingReview: "في انتظار المراجعة",
        approved: "معتمد",
        assigned: "مخصص",
        totalActive: "الإجمالي النشط"
      },
      tabs: {
        all: "الكل",
        pending: "معلق",
        approved: "معتمد",
        assigned: "مخصص",
        done: "مكتمل"
      },
      emptyState: {
        noAdmissionsFound: "لم يتم العثور على قبولات",
        noAdmissionsYet: "لم يتم طلب أي قبولات بعد.",
        noTabAdmissions: "لا توجد قبولات {tab}."
      },
      labels: {
        mrn: "رقم السجل الطبي:",
        doctor: "الطبيب:",
        requested: "مطلوب:",
        matronNurse: "ممرضة رئيسية:",
        ward: "الجناح:",
        bed: "السرير:",
        reason: "السبب:",
        doctorNotes: "ملاحظات الطبيب:",
        matronNurseNotes: "ملاحظات الممرضة الرئيسية:"
      },
      buttons: {
        view: "عرض",
        approve: "اعتماد",
        assignWard: "تعيين جناح",
        assign: "تعيين",
        cancel: "إلغاء"
      },
      errors: {
        failedToFetch: "فشل في جلب القبولات",
        errorFetching: "حدث خطأ أثناء جلب القبولات",
        failedToAction: "فشل في {action} القبول",
        errorActioning: "حدث خطأ أثناء {action} القبول"
      },
      success: {
        actionSuccess: "تم {action} القبول بنجاح"
      },
      loading: "جارٍ تحميل القبولات..."
    },

    labDashboard: {
      title: "لوحة المختبر",
      stats: {
        pendingOrders: "الطلبات المعلقة",
        completedOrders: "الطلبات المكتملة",
        totalOrders: "إجمالي الطلبات"
      },
      searchPlaceholder: "البحث بالمريض أو الفحص...",
      filter: {
        allStatuses: "جميع الحالات",
        pending: "معلق",
        completed: "مكتمل",
        cancelled: "ملغي"
      },
      labels: {
        testsRequested: "الفحوصات المطلوبة",
        requestedOn: "مطلوب في",
        submittedOn: "تم الإرسال في",
        notes: "ملاحظات"
      },
      buttons: {
        viewDetails: "عرض التفاصيل",
        uploadResult: "تحميل النتيجة",
        editResult: "تعديل النتيجة"
      },
      emptyState: {
        noMatchingOrders: "لا توجد طلبات مختبر مطابقة",
        adjustSearch: "جرب تعديل البحث أو المرشح."
      }
    },

    addAdmissionModal: {
      title: "طلب قبول المريض",
      labels: {
        selectPatient: "اختيار المريض",
        loadingPatients: "جارٍ تحميل المرضى...",
        selectPatientPlaceholder: "اختر مريضاً",
        reasonForAdmission: "سبب القبول *",
        reasonPlaceholder: "وصف السبب الطبي للقبول...",
        urgencyLevel: "مستوى الإلحاح *",
        department: "القسم *",
        loadingDepartments: "جارٍ تحميل الأقسام...",
        selectDepartment: "اختر القسم",
        ward: "الجناح *",
        selectDepartmentFirst: "اختر القسم أولاً",
        loadingWards: "جارٍ تحميل الأجنحة...",
        selectWard: "اختر الجناح",
        estimatedStay: "الإقامة المقدرة (أيام)",
        estimatedStayPlaceholder: "اختياري: طول الإقامة المقدر",
        specialRequirements: "المتطلبات الخاصة",
        doctorNotes: "ملاحظات الطبيب",
        doctorNotesPlaceholder: "ملاحظات أو تعليمات إضافية..."
      },
      urgencyLevels: {
        routine: "روتيني",
        urgent: "عاجل",
        emergency: "طوارئ"
      },
      specialRequirements: [
        "عزل",
        "عناية مركزة",
        "دعم التنفس الاصطناعي",
        "غسيل كلوي",
        "مراقبة التليمتري",
        "غرفة خاصة",
        "متاح للكراسي المتحركة",
        "سرير بارتيك"
      ],
      wardDisplayText: "{name} (الجناح {number}) - {available} أسرة متاحة",
      buttons: {
        cancel: "إلغاء",
        submitting: "جارٍ الإرسال...",
        requestAdmission: "طلب القبول"
      },
      success: {
        submitted: "تم إرسال طلب القبول بنجاح"
      },
      errors: {
        failedToSubmit: "فشل في إرسال طلب القبول",
        errorSubmitting: "حدث خطأ أثناء إرسال طلب القبول"
      }
    },

    admissionDetailsModal: {
      title: "تفاصيل القبول",
      labels: {
        mrn: "رقم السجل الطبي:",
        age: "العمر:",
        gender: "الجنس:",
        doctor: "الطبيب:",
        requested: "مطلوب:",
        status: "الحالة:",
        reasonForAdmission: "سبب القبول",
        estimatedStay: "الإقامة المقدرة",
        specialRequirements: "المتطلبات الخاصة",
        doctorNotes: "ملاحظات الطبيب",
        matronNurseNotes: "ملاحظات الممرضة الرئيسية",
        wardAssignment: "تعيين الجناح",
        approvalNotes: "ملاحظات الاعتماد",
        approvalNotesPlaceholder: "أضف ملاحظات الاعتماد...",
        departmentRequired: "القسم *",
        selectDepartment: "اختر القسم",
        wardRequired: "الجناح *",
        selectDepartmentFirst: "اختر القسم أولاً",
        loadingWards: "جارٍ تحميل الأجنحة...",
        selectWard: "اختر الجناح",
        department: "القسم",
        ward: "الجناح",
        bedNumber: "رقم السرير",
        bedNumberPlaceholder: "مثال: B001"
      },
      sections: {
        approveAdmissionRequest: "اعتماد طلب القبول",
        assignWardAndBed: "تعيين الجناح والسرير"
      },
      buttons: {
        approveAdmission: "اعتماد القبول",
        assignWardAndBed: "تعيين الجناح والسرير",
        close: "إغلاق",
        cancelAdmission: "إلغاء القبول"
      },
      success: {
        actionSuccess: "تم {action} القبول بنجاح"
      },
      errors: {
        failedToAction: "فشل في {action} القبول",
        errorActioning: "حدث خطأ أثناء {action} القبول"
      },
      wardDisplayText: "{name} (الجناح {number}) - {available} أسرة متاحة"
    },
  },
};
