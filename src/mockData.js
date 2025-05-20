export const mockJobs = [
  {
    id: '1',
    title: 'Upload Questions to Quiz App',
    url: 'https://www.upwork.com/nx/proposals/job/~021924388673536176784/apply/',
    description: 'This is a real Upwork job for testing the auto-fill feature.'
  },
  {
    id: '2',
    title: 'Full Stack Developer - Node.js & React',
    url: 'https://www.upwork.com/nx/proposals/job/~021924251168216481282/apply/',
    description: 'Need a full stack developer for building a web application'
  },
  {
    id: '3',
    title: 'UI/UX Designer for Mobile App',
    url: 'https://www.example.com',
    description: 'Design modern and intuitive interfaces for our mobile application'
  },
  {
    id: '4',
    title: 'Python Developer - Data Analysis',
    url: 'https://www.example.com',
    description: 'Looking for a Python developer with experience in data analysis'
  },
  {
    id: '5',
    title: 'DevOps Engineer - AWS',
    url: 'https://www.example.com',
    description: 'Need a DevOps engineer to manage our AWS infrastructure'
  },
  {
    id: '6',
    title: 'Mobile App Developer - Flutter',
    url: 'https://www.example.com',
    description: 'Looking for a Flutter developer to build cross-platform mobile apps'
  },
  {
    id: '7',
    title: 'Backend Developer - Java Spring',
    url: 'https://www.example.com',
    description: 'Need a Java developer with Spring Boot experience'
  },
  {
    id: '8',
    title: 'Frontend Developer - Vue.js',
    url: 'https://www.example.com',
    description: 'Looking for a Vue.js developer for our web application'
  },
  {
    id: '9',
    title: 'Database Administrator - PostgreSQL',
    url: 'https://www.example.com',
    description: 'Need a DBA to optimize and maintain our PostgreSQL database'
  },
  {
    id: '10',
    title: 'QA Engineer - Automation',
    url: 'https://www.example.com',
    description: 'Looking for a QA engineer with automation testing experience'
  }
];

export const getMockJobDetails = (jobId) => {
  if (jobId === '1') {
    return {
      pitch: 'Hello, I am very interested in this Upwork job and believe my skills are a perfect match. Please consider my application!',
      questions: [
        {
          id: 'experience',
          answer: 'I have extensive Upwork experience and a proven track record.'
        },
        {
          id: 'availability',
          answer: 'I am available to start immediately.'
        }
      ]
    };
  }
  // Default for other jobs
  return {
    pitch: `I am excited to apply for this position. I have extensive experience in this field and would be a great fit for your project. I have worked on similar projects in the past and can deliver high-quality results.`,
    questions: [
      {
        id: 'experience',
        answer: 'I have 5+ years of experience in this field.'
      },
      {
        id: 'availability',
        answer: 'I am available to start immediately and can work full-time.'
      }
    ]
  };
};
