import type {
  Certification,
  Education,
  Experience,
  PortfolioContent,
  Project,
  SiteSettings,
  Skill,
  SkillCategoryKey,
} from './types';

const draft = { ar: 'draft' as const };

export const skillCategoryLabels: Record<SkillCategoryKey, { en: string; ar: string }> = {
  'programming-languages': { en: 'Programming Languages', ar: 'لغات البرمجة' },
  'frameworks-libraries': { en: 'Frameworks & Libraries', ar: 'الأطر والمكتبات' },
  'mobile-development': { en: 'Mobile Development', ar: 'تطوير تطبيقات الهاتف' },
  'web-development': { en: 'Web Development', ar: 'تطوير الويب' },
  'ai-machine-learning': { en: 'AI & Machine Learning', ar: 'الذكاء الاصطناعي وتعلم الآلة' },
  'embedded-systems': { en: 'Embedded Systems', ar: 'الأنظمة المدمجة' },
  databases: { en: 'Databases', ar: 'قواعد البيانات' },
  'testing-quality': { en: 'Testing & Quality', ar: 'الاختبار وضمان الجودة' },
  'devops-tools': { en: 'DevOps & Tools', ar: 'أدوات التطوير والتشغيل' },
  architecture: { en: 'Architecture', ar: 'هندسة البرمجيات' },
};

export const defaultSiteSettings: SiteSettings = {
  _id: 'main',
  hero: {
    eyebrow: { en: 'AI • Web • Mobile • Embedded Systems', ar: 'ذكاء اصطناعي • ويب • تطبيقات هاتف • أنظمة مدمجة' },
    title: { en: 'Software Engineer', ar: 'مهندسة برمجيات' },
    subtitle: {
      en: 'Recent Computer Engineering and Software Systems graduate building reliable products across AI, full-stack web, mobile, embedded systems, and software testing.',
      ar: 'خريجة حديثة في هندسة الحاسبات وأنظمة البرمجيات تبني منتجات موثوقة في الذكاء الاصطناعي والويب وتطبيقات الهاتف والأنظمة المدمجة واختبار البرمجيات.',
    },
    ctaLabel: { en: 'Explore Projects', ar: 'استعرض المشاريع' },
    secondaryCtaLabel: { en: 'Contact Salma', ar: 'تواصل مع سلمى' },
  },
  about: {
    heading: { en: 'About Salma', ar: 'نبذة عن سلمى' },
    body: {
      en: 'Recent graduate in Computer Engineering and Software Systems with a strong foundation across AI, software development, embedded systems, mobile development, and software testing. Passionate about building innovative solutions and eager to contribute to diverse technical teams. Adaptable, quick to learn, and ready to apply strong problem-solving skills to real-world challenges in any domain. Committed to continuous growth and making a tangible impact in the technology sector.',
      ar: 'خريجة حديثة في هندسة الحاسبات وأنظمة البرمجيات ولديها أساس قوي في الذكاء الاصطناعي وتطوير البرمجيات والأنظمة المدمجة وتطوير تطبيقات الهاتف واختبار البرمجيات. شغوفة ببناء حلول مبتكرة والمساهمة مع فرق تقنية متنوعة، وسريعة التعلم وقادرة على تطبيق مهارات حل المشكلات في تحديات واقعية.',
    },
  },
  contact: {
    email: 'salmasayed269@gmail.com',
    phones: ['+01555031062', '+01050878980'],
    location: { en: 'Egypt, Nasr City, 7th District', ar: 'مصر، مدينة نصر، الحي السابع' },
    githubUrl: 'https://github.com/Salma269',
  },
  seo: {
    title: { en: 'Salma Mohamed Sayed | Software Engineer', ar: 'سلمى محمد سيد | مهندسة برمجيات' },
    description: {
      en: 'Portfolio of Salma Mohamed Sayed, a Computer Engineering and Software Systems graduate focused on AI, full-stack, mobile, embedded systems, and testing.',
      ar: 'ملف أعمال سلمى محمد سيد، خريجة هندسة الحاسبات وأنظمة البرمجيات، وتركز على الذكاء الاصطناعي والتطوير الكامل وتطبيقات الهاتف والأنظمة المدمجة والاختبار.',
    },
  },
  sections: {
    experience: { visible: true, order: 1 },
    skills: { visible: true, order: 2 },
    projects: { visible: true, order: 3 },
    education: { visible: true, order: 4 },
    certifications: { visible: true, order: 5 },
    contact: { visible: true, order: 6 },
  },
  socialLinks: [{ label: 'GitHub', url: 'https://github.com/Salma269', visible: true, order: 1 }],
  localeStatus: draft,
};

export const experiences: Experience[] = [
  {
    title: { en: 'Embedded Systems Trainee', ar: 'متدربة أنظمة مدمجة' },
    organization: { en: 'Edges For Training Academy', ar: 'أكاديمية Edges للتدريب' },
    startDate: '2025-08',
    endDate: '2025-09',
    periodLabel: 'Aug 2025 – Sep 2025',
    bullets: {
      en: [
        'Coded AVR microcontrollers in C, integrating LEDs, buzzers, and sensors into a responsive embedded system.',
        'Validated system reliability through rigorous testing on the eta32mini AVR kit.',
      ],
      ar: [
        'برمجت متحكمات AVR بلغة C مع دمج مصابيح LED وصفارات وحساسات داخل نظام مدمج سريع الاستجابة.',
        'تحققت من موثوقية النظام عبر اختبارات دقيقة على لوحة eta32mini AVR.',
      ],
    },
    order: 1,
    visible: true,
    localeStatus: draft,
  },
  {
    title: { en: 'React Native Trainee', ar: 'متدربة React Native' },
    organization: { en: 'ITI', ar: 'معهد تكنولوجيا المعلومات ITI' },
    startDate: '2024-08',
    endDate: '2024-09',
    periodLabel: 'Aug 2024 – Sep 2024',
    bullets: {
      en: [
        'Engineered cross-platform mobile apps with React Native and Firebase, featuring real-time data sync and secure authentication.',
        'Designed responsive, high-performance UIs optimized for both iOS and Android platforms.',
      ],
      ar: [
        'طورت تطبيقات هاتف متعددة المنصات باستخدام React Native وFirebase مع مزامنة فورية للبيانات ومصادقة آمنة.',
        'صممت واجهات سريعة الاستجابة وعالية الأداء محسنة لمنصتي iOS وAndroid.',
      ],
    },
    order: 2,
    visible: true,
    localeStatus: draft,
  },
  {
    title: { en: 'AI Trainee', ar: 'متدربة ذكاء اصطناعي' },
    organization: { en: 'Telecom Egypt', ar: 'المصرية للاتصالات' },
    startDate: '2023-07',
    endDate: '2023-08',
    periodLabel: 'Jul 2023 – Aug 2023',
    bullets: {
      en: [
        'Built and tuned CNN/RNN models with TensorFlow/Keras for object detection using Mask R-CNN and OpenCV.',
        'Streamlined preprocessing pipelines to boost inference speed and accuracy on video data.',
      ],
      ar: [
        'بنيت وحسنت نماذج CNN/RNN باستخدام TensorFlow/Keras لاكتشاف الأجسام عبر Mask R-CNN وOpenCV.',
        'طورت خطوط معالجة مسبقة لرفع سرعة الاستدلال ودقته على بيانات الفيديو.',
      ],
    },
    order: 3,
    visible: true,
    localeStatus: draft,
  },
];

export const education: Education[] = [
  {
    institution: { en: 'Ain Shams University, Faculty of Engineering', ar: 'جامعة عين شمس، كلية الهندسة' },
    degree: {
      en: 'Bachelor of Science in Electrical Engineering, Computer Engineering, and Software Systems',
      ar: 'بكالوريوس العلوم في الهندسة الكهربائية، هندسة الحاسبات وأنظمة البرمجيات',
    },
    graduationDate: '2026-06',
    gpa: '3.0',
    order: 1,
    visible: true,
    localeStatus: draft,
  },
  {
    institution: { en: 'East London University, Faculty of Engineering', ar: 'جامعة شرق لندن، كلية الهندسة' },
    degree: {
      en: 'Bachelor of Science in Computer Engineering and Software Systems Program (NAF) – Dual Degree Program',
      ar: 'بكالوريوس العلوم في برنامج هندسة الحاسبات وأنظمة البرمجيات (NAF) – برنامج الدرجة المزدوجة',
    },
    graduationDate: '2026-06',
    order: 2,
    visible: true,
    localeStatus: draft,
  },
];

const skillGroups: Array<{ categoryKey: SkillCategoryKey; skills: string[] }> = [
  { categoryKey: 'programming-languages', skills: ['Python', 'Java', 'TypeScript', 'JavaScript', 'C++', 'C', 'C#', 'SQL', 'Dart'] },
  { categoryKey: 'frameworks-libraries', skills: ['Flutter', 'React', 'Angular', 'Django', 'Node.js', 'TensorFlow', 'Keras', 'OpenCV'] },
  { categoryKey: 'mobile-development', skills: ['Flutter', 'Dart', 'BLoC', 'Provider', 'Dependency Injection', 'GoRouter', 'REST APIs'] },
  { categoryKey: 'web-development', skills: ['React', 'Angular', 'HTML', 'CSS', 'Bootstrap', 'REST APIs'] },
  { categoryKey: 'ai-machine-learning', skills: ['TensorFlow', 'Keras', 'Scikit-learn', 'OpenCV', 'CNN', 'RNN', 'Optuna', 'SMOTE'] },
  { categoryKey: 'embedded-systems', skills: ['ARM Cortex (TIVA C)', 'Embedded C', 'UART', 'IAR Workbench', 'AVR'] },
  { categoryKey: 'databases', skills: ['MongoDB', 'MySQL', 'Firebase', 'SQLite'] },
  { categoryKey: 'testing-quality', skills: ['Selenium', 'Postman', 'Flutter Testing', 'Mobile App Testing', 'JUnit'] },
  { categoryKey: 'devops-tools', skills: ['AWS (EC2, SQS, RDS)', 'Git', 'GitHub', 'Jira'] },
  { categoryKey: 'architecture', skills: ['SOLID Principles', 'MVVM', 'MVP', 'Clean Architecture', 'Repository Pattern', 'Design Patterns'] },
];

export const skills: Skill[] = skillGroups.flatMap((group, groupIndex) =>
  group.skills.map((skill, index) => ({
    name: { en: skill, ar: skill },
    categoryKey: group.categoryKey,
    iconId: skill.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    order: groupIndex * 100 + index + 1,
    visible: true,
    localeStatus: draft,
  })),
);

export const projects: Project[] = [
  {
    slug: 'fotoflow-document-workflow-automation-platform',
    title: { en: 'FotoFlow – Document Workflow Automation Platform', ar: 'FotoFlow – منصة أتمتة سير عمل المستندات' },
    shortDescription: {
      en: 'A full-stack visual workflow automation platform for document parsing, AI-powered nodes, async execution, and multi-tenant collaboration.',
      ar: 'منصة كاملة لأتمتة سير عمل المستندات بصرياً مع عقد ذكاء اصطناعي وتنفيذ غير متزامن وتعاون متعدد الصلاحيات.',
    },
    detailedDescription: {
      en: 'Sponsored by FotopiaTech. Built a full-stack visual workflow automation platform with drag-and-drop canvas, asynchronous backend execution engine, and multi-tenant collaboration. Salma contributed production-grade table, column, and cell detection nodes that transform raw invoices into structured JSON/CSV outputs for validation, export, and human-review workflow steps.',
      ar: 'برعاية FotopiaTech. منصة أتمتة سير عمل مرئية كاملة تعتمد على لوحة سحب وإفلات ومحرك تنفيذ خلفي غير متزامن وتعاون متعدد الصلاحيات. ساهمت سلمى في عقد احترافية لاكتشاف الجداول والأعمدة والخلايا لتحويل الفواتير الخام إلى مخرجات JSON/CSV منظمة قابلة للتحقق والتصدير والمراجعة البشرية.',
    },
    highlights: {
      en: [
        'Built a full-stack visual workflow automation platform with drag-and-drop canvas, asynchronous backend execution engine, and multi-tenant collaboration (Owner/Editor/Viewer permissions).',
        'Designed an extensible process catalog enabling users to select from pre-built AI-powered nodes with a pluggable architecture for future ML integration.',
        'Achieved 95.61% accuracy and 0.9092 IoU for table detection using ResNet34/EfficientNetV2-S with ASPP and Mish activation.',
        'Built a column detection pipeline with letterboxing and fixed-pixel shrinking for preprocessing, ResNet18-based TableNet with Squeeze-and-Excitation attention, hybrid BCE-Tversky loss for false positive suppression, and a post-processing pipeline combining morphological erosion, connected component analysis, text-aware consolidation, and strategic boundary expansion – achieving 98.04% Precision and 96.98% IoU.',
        'Developed a dual-strategy cell extractor combining DBNet with adaptive thresholding fallback, plus hierarchical grouping and gap elimination to produce perfectly aligned, gap-free tabular grids ready for OCR and export.',
      ],
      ar: [
        'بنت منصة أتمتة سير عمل مرئية كاملة مع لوحة سحب وإفلات ومحرك تنفيذ خلفي غير متزامن وتعاون متعدد المستأجرين بصلاحيات Owner/Editor/Viewer.',
        'صممت كتالوج عمليات قابل للتوسع يتيح اختيار عقد ذكاء اصطناعي جاهزة مع بنية قابلة للإضافة لتكاملات تعلم الآلة المستقبلية.',
        'حققت دقة 95.61% وIoU بقيمة 0.9092 في اكتشاف الجداول باستخدام ResNet34/EfficientNetV2-S مع ASPP وتفعيل Mish.',
        'بنت خط معالجة لاكتشاف الأعمدة باستخدام letterboxing وتقليص ثابت للبكسلات، وTableNet مبني على ResNet18 مع Squeeze-and-Excitation وخسارة BCE-Tversky هجينة وتقنيات معالجة لاحقة، محققة Precision بقيمة 98.04% وIoU بقيمة 96.98%.',
        'طورت مستخرج خلايا باستراتيجية مزدوجة تجمع DBNet مع adaptive thresholding fallback وتجميع هرمي لإنتاج شبكات جدولية دقيقة جاهزة للـ OCR والتصدير.',
      ],
    },
    technologies: ['React', 'Node.js', 'Python', 'ResNet34', 'EfficientNetV2-S', 'ASPP', 'Mish', 'ResNet18 TableNet', 'DBNet'],
    periodLabel: 'January 2026 – June 2026',
    featured: true,
    published: true,
    order: 1,
    visible: true,
    gallery: [],
    localeStatus: draft,
  },
  {
    slug: 'beacon-app-peer-to-peer-emergency-network',
    title: { en: 'Beacon App – Peer-to-Peer Emergency Network', ar: 'تطبيق Beacon – شبكة طوارئ نظير إلى نظير' },
    shortDescription: { en: 'A decentralized Android app for infrastructure-independent peer-to-peer messaging and coordination during outages.', ar: 'تطبيق أندرويد لا مركزي للتراسل والتنسيق دون الاعتماد على البنية التحتية أثناء الانقطاعات.' },
    detailedDescription: { en: 'Engineered a decentralized Android application for infrastructure-independent peer-to-peer messaging and coordination during network outages, with encrypted local storage and accessibility-oriented voice interaction.', ar: 'تطبيق أندرويد لا مركزي للتراسل والتنسيق أثناء انقطاع الشبكات مع تخزين محلي مشفر وتفاعل صوتي مناسب للظروف الحرجة.' },
    highlights: {
      en: [
        'Engineered a decentralized Android application for infrastructure-independent peer-to-peer messaging and coordination during network outages.',
        'Deployed SQLCipher with AES-256 encryption for secure on-device storage of medical profiles and chat history.',
        'Constructed a robust MVVM framework integrating STT and TTS functionalities for seamless user interaction in critical situations.',
      ],
      ar: [
        'طورت تطبيق أندرويد لا مركزي للتراسل والتنسيق دون بنية تحتية أثناء انقطاع الشبكات.',
        'استخدمت SQLCipher بتشفير AES-256 لتأمين تخزين الملفات الطبية وسجل المحادثات على الجهاز.',
        'بنت هيكل MVVM قوي يدمج STT وTTS لتفاعل سلس في المواقف الحرجة.',
      ],
    },
    technologies: ['Flutter', 'Wi-Fi Direct', 'SQLCipher', 'MVVM', 'STT', 'TTS'],
    periodLabel: 'Jan 2026',
    featured: false,
    published: true,
    order: 2,
    visible: true,
    gallery: [],
    localeStatus: draft,
  },
  {
    slug: 'stroke-prediction-machine-learning-pipeline',
    title: { en: 'Stroke Prediction – Machine Learning Pipeline', ar: 'التنبؤ بالسكتة الدماغية – خط تعلم آلي' },
    shortDescription: { en: 'An end-to-end health-record ML pipeline with SMOTE, PCA, Optuna, SVM, and clustering analysis.', ar: 'خط تعلم آلي شامل لسجلات المرضى باستخدام SMOTE وPCA وOptuna وSVM وتحليل التجميع.' },
    detailedDescription: { en: 'Developed an end-to-end pipeline to predict stroke risk using patient health records with preprocessing, feature engineering, balancing, dimensionality reduction, and hyperparameter tuning.', ar: 'طورت خطاً شاملاً للتنبؤ بخطر السكتة الدماغية من سجلات المرضى مع معالجة مسبقة وهندسة خصائص وموازنة وتقليل أبعاد وضبط معاملات.' },
    highlights: {
      en: [
        'Developed an end-to-end pipeline to predict stroke risk using patient health records with comprehensive preprocessing and feature engineering.',
        'Applied SMOTE balancing, PCA dimensionality reduction, and Optuna hyperparameter optimization to maximize model performance.',
        'Achieved 97.3% accuracy using an RBF-SVM model, with clustering analysis revealing distinct subgroups of high-risk patients.',
      ],
      ar: [
        'طورت خطاً شاملاً للتنبؤ بخطر السكتة الدماغية باستخدام سجلات صحية مع معالجة مسبقة وهندسة خصائص.',
        'طبقت SMOTE وPCA وOptuna لتعظيم أداء النموذج.',
        'حققت دقة 97.3% باستخدام RBF-SVM مع تحليل تجميعي كشف مجموعات فرعية عالية الخطورة.',
      ],
    },
    technologies: ['Python', 'Scikit-Learn', 'SMOTE', 'PCA', 'Optuna', 'SVM', 'K-Means'],
    periodLabel: 'May 2025',
    featured: false,
    published: true,
    order: 3,
    visible: true,
    gallery: [],
    localeStatus: draft,
  },
  {
    slug: 'distributed-web-crawling-indexing-system',
    title: { en: 'Distributed Web Crawling & Indexing System', ar: 'نظام موزع للزحف على الويب والفهرسة' },
    shortDescription: { en: 'A scalable AWS-based distributed crawler and indexer with queue-driven workers and sub-second search.', ar: 'نظام زحف وفهرسة موزع وقابل للتوسع على AWS مع عمال عبر الطوابير وبحث سريع.' },
    detailedDescription: { en: 'Designed a scalable, cloud-based distributed crawling system on AWS leveraging EC2 instances and SQS queues for dynamic job distribution, indexing more than 10,000 URLs with Whoosh search.', ar: 'صممت نظام زحف موزعاً سحابياً على AWS باستخدام EC2 وSQS لتوزيع المهام ديناميكياً وفهرسة أكثر من 10,000 رابط باستخدام Whoosh.' },
    highlights: {
      en: [
        'Designed a scalable, cloud-based distributed crawling system on AWS leveraging EC2 instances and SQS queues for dynamic job distribution.',
        'Crawled and indexed over 10,000 URLs, integrating Whoosh full-text search engine for sub-second query performance.',
        'Implemented heartbeat-based node monitoring for fault tolerance and automatic recovery.',
      ],
      ar: [
        'صممت نظام زحف موزعاً وقابلاً للتوسع على AWS باستخدام EC2 وSQS لتوزيع المهام.',
        'زحفت وفهرست أكثر من 10,000 رابط مع دمج Whoosh للبحث النصي السريع.',
        'طبقت مراقبة للعقد بنظام heartbeat لزيادة تحمل الأعطال والتعافي التلقائي.',
      ],
    },
    technologies: ['AWS EC2', 'AWS SQS', 'AWS RDS', 'Python', 'Scrapy', 'BeautifulSoup', 'Whoosh', 'MPI'],
    periodLabel: 'May 2025',
    featured: false,
    published: true,
    order: 4,
    visible: true,
    gallery: [],
    localeStatus: draft,
  },
  {
    slug: 'e-commerce-platform-for-cosmetics',
    title: { en: 'E-Commerce Platform for Cosmetics', ar: 'منصة تجارة إلكترونية لمستحضرات التجميل' },
    shortDescription: { en: 'A secure cosmetics e-commerce platform with Node.js, MongoDB, JWT authentication, inventory, orders, and analytics.', ar: 'منصة تجارة إلكترونية آمنة لمستحضرات التجميل باستخدام Node.js وMongoDB وJWT وإدارة مخزون وطلبات وتحليلات.' },
    detailedDescription: { en: 'Developed a secure e-commerce platform with Node.js backend, MongoDB storage, JWT-based authentication, admin dashboard, inventory control, order management, sales analytics, and responsive Bootstrap UI.', ar: 'طورت منصة تجارة إلكترونية آمنة بخلفية Node.js وتخزين MongoDB ومصادقة JWT ولوحة إدارة للمخزون والطلبات وتحليلات المبيعات وواجهة Bootstrap متجاوبة.' },
    highlights: {
      en: [
        'Developed a secure e-commerce platform with Node.js backend, MongoDB storage, and JWT-based authentication.',
        'Built an admin dashboard with inventory control, order management, and sales analytics.',
        'Designed a responsive Bootstrap UI with integrated user reviews, ratings, and real-time inventory updates.',
      ],
      ar: [
        'طورت منصة تجارة إلكترونية آمنة باستخدام Node.js وMongoDB ومصادقة JWT.',
        'بنت لوحة إدارة للتحكم في المخزون وإدارة الطلبات وتحليلات المبيعات.',
        'صممت واجهة Bootstrap متجاوبة مع مراجعات وتقييمات وتحديثات مخزون فورية.',
      ],
    },
    technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express.js', 'Bootstrap', 'MongoDB'],
    periodLabel: 'May 2025',
    featured: false,
    published: true,
    order: 5,
    visible: true,
    gallery: [],
    localeStatus: draft,
  },
  {
    slug: 'smart-home-system',
    title: { en: 'Smart Home System', ar: 'نظام منزل ذكي' },
    shortDescription: { en: 'An embedded smart-home application on TIVA C with Qt GUI, UART communication, device control, and safety alerts.', ar: 'تطبيق منزل ذكي مدمج على TIVA C مع واجهة Qt واتصال UART وتحكم بالأجهزة وتنبيهات أمان.' },
    detailedDescription: { en: 'Built an embedded application on TIVA C microcontroller using Embedded C and Qt for real-time monitoring and control of lamps, plugs, doors, safety alerts, and sensor integration.', ar: 'بنت تطبيقاً مدمجاً على متحكم TIVA C باستخدام Embedded C وQt للمراقبة والتحكم اللحظي في المصابيح والمقابس والأبواب وتنبيهات الأمان والحساسات.' },
    highlights: {
      en: [
        'Built an embedded application on TIVA C microcontroller using Embedded C and Qt.',
        'Enabled remote monitoring and control of devices like lamps, plugs, and doors with real-time GUI and UART-based communication.',
        'Included safety alert features and sensor integration.',
      ],
      ar: [
        'بنت تطبيقاً مدمجاً على متحكم TIVA C باستخدام Embedded C وQt.',
        'أتاحت مراقبة وتحكم عن بعد في المصابيح والمقابس والأبواب عبر واجهة لحظية واتصال UART.',
        'أضافت ميزات تنبيه أمان وتكامل حساسات.',
      ],
    },
    technologies: ['C', 'Python', 'Qt', 'Embedded C', 'TIVA C'],
    periodLabel: 'Dec 2024',
    featured: false,
    published: true,
    order: 6,
    visible: true,
    gallery: [],
    localeStatus: draft,
  },
  {
    slug: 'veri-fy-lint-verilog-linter',
    title: { en: 'Veri-fy Lint – Verilog Linter', ar: 'Veri-fy Lint – مدقق Verilog' },
    shortDescription: { en: 'A Python-based Verilog lint parser for overflow, unreachable logic, uninitialized registers, bus conflicts, and inferred latches.', ar: 'مدقق Verilog مبني ببايثون لاكتشاف الفيضان والمنطق غير القابل للوصول والسجلات غير المهيأة وتعارضات الحافلات والـ latches المستنتجة.' },
    detailedDescription: { en: 'Developed a Python-based parser for Veri-fy Lint that addresses arithmetic overflow, unreachable code blocks, uninitialized registers, multi-driven bus or register issues, incomplete or parallel cases, and inferred latches.', ar: 'طورت محللاً ببايثون لأداة Veri-fy Lint يعالج فيضان العمليات الحسابية والكتل غير القابلة للوصول والسجلات غير المهيأة وتعارضات الحافلات أو السجلات والحالات غير المكتملة أو المتوازية والـ latches المستنتجة.' },
    highlights: {
      en: [
        'Developed a Python-based parser for Veri-fy Lint.',
        'Addressed multiple scenarios such as arithmetic overflow, unreachable code blocks, uninitialized registers, multi-driven bus or register issues, incomplete or parallel cases, and inferred latches.',
      ],
      ar: [
        'طورت محللاً ببايثون لأداة Veri-fy Lint.',
        'غطت سيناريوهات متعددة مثل فيضان العمليات الحسابية والكتل غير القابلة للوصول والسجلات غير المهيأة وتعارضات الحافلات والحالات غير المكتملة والـ latches المستنتجة.',
      ],
    },
    technologies: ['Python', 'Verilog'],
    periodLabel: 'Dec 2023',
    featured: false,
    published: true,
    order: 7,
    visible: true,
    gallery: [],
    localeStatus: draft,
  },
];

export const certifications: Certification[] = [
  {
    name: { en: 'IELTS Academic', ar: 'اختبار IELTS الأكاديمي' },
    details: { en: 'Overall Band Score: 5.5', ar: 'الدرجة الكلية: 5.5' },
    dateLabel: 'Overall Band Score: 5.5',
    score: '5.5',
    order: 1,
    visible: true,
    localeStatus: draft,
  },
  {
    name: { en: 'Embedded Systems Training', ar: 'تدريب الأنظمة المدمجة' },
    dateLabel: 'August 2025 to September 2025',
    order: 2,
    visible: true,
    localeStatus: draft,
  },
  {
    name: { en: 'React Native Training', ar: 'تدريب React Native' },
    dateLabel: 'August 2024 to September 2024',
    order: 3,
    visible: true,
    localeStatus: draft,
  },
  {
    name: { en: 'AI Training', ar: 'تدريب الذكاء الاصطناعي' },
    dateLabel: 'July 2023 to August 2023',
    order: 4,
    visible: true,
    localeStatus: draft,
  },
];

export const seedContent: PortfolioContent = {
  siteSettings: defaultSiteSettings,
  experiences,
  education,
  certifications,
  skills,
  projects,
};
