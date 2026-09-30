// Seed data. Deadlines are ISO dates; countdowns are computed live.
const CATEGORIES = {
  Technical: { color: '#2447F9' },
  Cultural:  { color: '#D6249A' },
  Sports:    { color: '#1F9E5B' },
  Literary:  { color: '#D9860C' },
};

const SOCIETIES = [
  {
    id: 'codeforge', meets: 'Wed & Sat, 6pm, Lab 204', size: 140, timeline: [['Intro session','2026-09-22'],['Build night (open)','2026-09-25'],['Applications close','2026-09-28'],['Results','2026-10-03']], name: 'CodeForge', category: 'Technical', icon: '⌘',
    tagline: 'Ship real software with people who care about craft.',
    deadline: '2026-09-28',
    description: 'CodeForge is the campus software guild. We run weekly build nights, ship open-source tools used by other societies, and send teams to national hackathons. You do not need to know everything. You need to want to build.',
    criteria: ['Any branch, any year', 'Show us one thing you have made, however small', 'Comfortable with at least one language, or eager to learn one fast'],
    roles: ['Developer', 'Designer', 'Hackathon lead', 'Content and outreach'],
    traits: { build: 3, team: 2, stage: 0, quiet: 1 },
  },
  {
    id: 'robotics', meets: 'Mon–Fri evenings, Robotics Lab', size: 62, timeline: [['Lab tour','2026-09-23'],['Applications close','2026-10-02'],['Task round','2026-10-06'],['Results','2026-10-10']], name: 'Robotics Cell', category: 'Technical', icon: '⚙',
    tagline: 'Motors, sensors, and things that move when you tell them to.',
    deadline: '2026-10-02',
    description: 'We design and build autonomous bots for national competitions like ABU Robocon and e-Yantra. Mechanical, electronics, and software teams work side by side in the lab from 6 to 10 most evenings.',
    criteria: ['First and second years preferred', 'Basic circuits or CAD is a plus, not a must', 'Willing to spend real hours in the lab before competitions'],
    roles: ['Mechanical design', 'Embedded systems', 'Computer vision', 'Lab manager'],
    traits: { build: 3, team: 3, stage: 0, quiet: 1 },
  },
  {
    id: 'dramatics', meets: 'Daily 5pm, Amphitheatre', size: 85, timeline: [['Open workshop','2026-09-21'],['Auditions','2026-09-23'],['Applications close','2026-09-25'],['Cast list','2026-09-29']], name: 'Rangmanch', category: 'Cultural', icon: '☺',
    tagline: 'Street plays, stage productions, and a lot of shouting in the courtyard.',
    deadline: '2026-09-25',
    description: 'Rangmanch is the dramatics society. We stage two full productions a year and perform nukkad natak on social issues across the city. Auditions are open and nobody is expected to arrive polished.',
    criteria: ['Open to all years', 'Audition with any 2 minute piece, in any language', 'Backstage roles need no audition at all'],
    roles: ['Actor', 'Director', 'Scriptwriter', 'Lights and sound', 'Set and props'],
    traits: { build: 1, team: 3, stage: 3, quiet: 0 },
  },
  {
    id: 'music', meets: 'Tue & Thu, 7pm, Music Room', size: 54, timeline: [['Jam session (open)','2026-09-24'],['Auditions','2026-09-27'],['Applications close','2026-09-30'],['Results','2026-10-04']], name: 'Octaves', category: 'Cultural', icon: '♪',
    tagline: 'Bands, choirs, and the people who run the campus fest stage.',
    deadline: '2026-09-30',
    description: 'Octaves is the music society. We have a rock band, a fusion ensemble, and an acapella group, plus a production crew that runs sound for every event on campus.',
    criteria: ['Any instrument or voice; producers and sound engineers welcome', 'Short audition, unplugged is fine', 'Attend at least one rehearsal a week'],
    roles: ['Vocalist', 'Instrumentalist', 'Music producer', 'Sound engineer'],
    traits: { build: 1, team: 2, stage: 3, quiet: 1 },
  },
  {
    id: 'football', meets: 'Mon, Wed, Fri, 6am, Main Ground', size: 48, timeline: [['Open trials','2026-09-22'],['Applications close','2026-09-24'],['Squad announced','2026-09-27']], name: 'Football Club', category: 'Sports', icon: '⚽',
    tagline: 'Inter-college league, 6am training, no excuses.',
    deadline: '2026-09-24',
    description: 'The college football club fields men and women squads in the state inter-college league. We train three mornings a week and travel for away fixtures on weekends.',
    criteria: ['Open trials on the main ground, all years', 'Medical fitness certificate before first match', 'Commit to the training schedule for the season'],
    roles: ['Player', 'Goalkeeper', 'Team manager', 'Physio assistant'],
    traits: { build: 0, team: 3, stage: 2, quiet: 0 },
  },
  {
    id: 'chess', meets: 'Sat 3pm, Common Room', size: 70, timeline: [['Blitz night (open)','2026-09-26'],['Applications close','2026-10-05'],['Ladder starts','2026-10-08']], name: 'Chess Circle', category: 'Sports', icon: '♞',
    tagline: 'Rated tournaments, blitz nights, and long quiet afternoons.',
    deadline: '2026-10-05',
    description: 'Chess Circle runs the campus rated ladder and sends teams to inter-university tournaments. Most of our time is spent on analysis sessions and blitz nights in the common room.',
    criteria: ['No rating needed to join', 'Play one ladder game a week', 'Coaches welcome from stronger players'],
    roles: ['Player', 'Tournament arbiter', 'Coach'],
    traits: { build: 1, team: 1, stage: 1, quiet: 3 },
  },
  {
    id: 'litsoc', meets: 'Fri 5pm, Seminar Hall B', size: 95, timeline: [['Open mic','2026-09-23'],['Applications close','2026-09-27'],['Debate trials','2026-09-30'],['Results','2026-10-02']], name: 'The Quill', category: 'Literary', icon: '✎',
    tagline: 'Debating, poetry slams, and the college magazine.',
    deadline: '2026-09-27',
    description: 'The Quill is the literary society. We run parliamentary debating, a monthly open mic, and publish Margin, the college magazine, twice a year.',
    criteria: ['Any year, any branch', 'Submit one piece of writing or a 3 minute speech', 'Editors need attention to detail more than flair'],
    roles: ['Debater', 'Poet or writer', 'Magazine editor', 'Illustrator'],
    traits: { build: 1, team: 1, stage: 2, quiet: 2 },
  },
  {
    id: 'quiz', meets: 'Thu 6pm, LT-3', size: 110, timeline: [['Open quiz','2026-09-25'],['Applications close','2026-10-01'],['Welcome quiz','2026-10-03']], name: 'Quiz Club', category: 'Literary', icon: '?',
    tagline: 'Trivia, general quizzes, and the occasional trip to a national final.',
    deadline: '2026-10-01',
    description: 'Quiz Club hosts a weekly quiz and trains teams for inter-college circuits. Half of us are here for the questions, the other half for the arguments about the answers.',
    criteria: ['Open to all', 'Show up to two quizzes and you are in', 'Setters need patience and a lot of reading'],
    roles: ['Quizzer', 'Question setter', 'Quizmaster'],
    traits: { build: 0, team: 2, stage: 1, quiet: 3 },
  },
];

// Quiz: each answer adds to a trait; we match against society trait vectors.
const QUIZ = [
  { q: 'A free Saturday. What do you reach for?',
    a: [ ['A half-finished project', { build: 3 }], ['A group of friends and a plan', { team: 3 }], ['Something with an audience', { stage: 3 }], ['A book and no notifications', { quiet: 3 }] ] },
  { q: 'When a team wins, what did you most likely do?',
    a: [ ['Built the thing that worked', { build: 3, team: 1 }], ['Kept everyone talking to each other', { team: 3 }], ['Was the one out front', { stage: 3 }], ['Thought three moves ahead', { quiet: 3 }] ] },
  { q: 'Pick a place on campus.',
    a: [ ['The lab, after hours', { build: 2, quiet: 1 }], ['The ground at 6am', { team: 2, stage: 1 }], ['The open-air stage', { stage: 3 }], ['The library reading room', { quiet: 3 }] ] },
  { q: 'How much time can you give each week?',
    a: [ ['A lot, I want it to be my thing', { team: 2, build: 1 }], ['A few evenings', { build: 1, stage: 1 }], ['One long session', { quiet: 2 }], ['Whatever it takes near a deadline', { stage: 1, team: 1 }] ] },
];
