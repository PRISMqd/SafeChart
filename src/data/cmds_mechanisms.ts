import type { CMDSMechanism, CMDSStage } from '../types';

export const cmdsMechanisms: CMDSMechanism[] = [
  {
    id: 'M1',
    name: 'Harm Minimization',
    description: 'Organizational reframing that reduces the perceived severity of recognized patient risk.',
    observableExpressions: [
      '"That\'s not as bad as it looks."',
      '"You\'re overreacting."',
      'Dismissal of clinical concern without clinical assessment.',
    ],
    crfDisruption: ['Interpretation (Stage 3)', 'Recognition (Stage 2)'],
    nlpTriggerPatterns: [
      'told me I was overreacting',
      'said it was fine',
      'minimized my concern',
    ],
  },
  {
    id: 'M2',
    name: 'Moral Justification',
    description: 'Provision of organizational rationales that make unsafe conditions appear ethically acceptable.',
    observableExpressions: [
      '"We\'re doing the best we can with what we have."',
      '"Policy requires this."',
      '"This is standard here."',
    ],
    crfDisruption: ['Prioritization (Stage 4)', 'Escalation (Stage 6)'],
    nlpTriggerPatterns: [
      'policy says',
      "that's just how it is here",
      "we're short-staffed everywhere",
    ],
  },
  {
    id: 'M3',
    name: 'Perception Destabilization',
    description: "Systematic undermining of a clinician's confidence in their own clinical perception, memory, or judgment. Also named Gaslighting in governance and legal contexts.",
    observableExpressions: [
      '"That didn\'t happen the way you think."',
      '"You\'re too new to understand."',
      '"You\'re the only one who has a problem with this."',
    ],
    crfDisruption: ['Recognition (Stage 2)', 'Communication (Stage 5)'],
    nlpTriggerPatterns: [
      'told me I was wrong',
      'said I imagined it',
      'questioned my judgment',
      'been doing this 15 years and they said I was overreacting',
    ],
  },
  {
    id: 'M4',
    name: 'Institutional Betrayal',
    description: 'Failure of institutional structures to protect clinicians who escalate safety concerns, or active harm directed at those who do.',
    observableExpressions: [
      'Retaliation following escalation.',
      'Adverse personnel actions after safety reports.',
      'Isolation of clinicians who file complaints.',
    ],
    crfDisruption: ['Escalation (Stage 6)', 'Communication (Stage 5)'],
    nlpTriggerPatterns: [
      'nobody listened',
      'nothing happened when I reported',
      'got in trouble for saying something',
      'afraid to say anything',
    ],
  },
  {
    id: 'M5',
    name: 'Deviance Normalization',
    description: 'Gradual institutional acceptance of unsafe conditions as standard operating practice.',
    observableExpressions: [
      '"We always float. Everyone does."',
      '"That\'s just the night shift."',
      '"We\'ve been short for years."',
    ],
    crfDisruption: ['Detection (Stage 1)', 'Recognition (Stage 2)'],
    nlpTriggerPatterns: [
      'always been this way',
      'everyone does it',
      "that's normal here",
      'floated again',
      'only RN on the floor',
    ],
  },
  {
    id: 'M6',
    name: 'Escalation Suppression',
    description: 'Active or structural blocking of escalation pathways, including chain-of-command obstruction, retaliation signaling, and policy tripwires.',
    observableExpressions: [
      '"Don\'t call the doctor for that."',
      '"Use the chain of command properly." (used to delay)',
      '"File a report if you want but nothing will change."',
    ],
    crfDisruption: ['Escalation (Stage 6)', 'Communication (Stage 5)'],
    nlpTriggerPatterns: [
      'told me not to call',
      'charge said figure it out',
      "can't reach anyone",
      'no response',
      'denied my request',
    ],
    autoFlag: 'Any escalation attempt that receives denial or no response auto-triggers M6 documentation in SafeChart.',
  },
  {
    id: 'M7',
    name: 'Moral Agency Erosion',
    description: "Progressive diminishment of a clinician's capacity to act on ethical judgment, produced by cumulative exposure to M1-M6.",
    observableExpressions: [
      '"I stopped saying anything because nothing ever changes."',
      '"I just do what I\'m told now."',
      '"I used to fight this but I don\'t anymore."',
    ],
    crfDisruption: ['All stages — represents terminal suppression of the recognition-response chain'],
    nlpTriggerPatterns: [
      'gave up',
      'stopped reporting',
      'used to care but',
      'just follow orders now',
      "can't change anything",
    ],
  },
];

export const cmdsStages: CMDSStage[] = [
  {
    id: 'S0',
    stageNum: 'S0',
    name: 'Signal Awareness',
    description: 'Clinician recognizes that something is wrong in their work environment. Early ethical concern. Not yet systematically suppressed.',
    markers: [
      '"I feel uneasy but I\'m not sure why."',
      'Noticing patterns without being able to name them yet.',
    ],
  },
  {
    id: 'S1',
    stageNum: 'S1',
    name: 'Signal Questioning',
    description: 'Clinician begins to question whether their perception is accurate. First exposure to M3 (Perception Destabilization).',
    markers: [
      '"Maybe I\'m wrong."',
      '"Maybe it\'s me."',
      'Beginning to second-guess escalation decisions.',
    ],
  },
  {
    id: 'S2',
    stageNum: 'S2',
    name: 'Signal Suppression',
    description: 'Clinician actively suppresses or delays escalation based on prior experience with M4 (Institutional Betrayal) or M6 (Escalation Suppression).',
    markers: [
      '"I didn\'t file a report because last time nothing happened."',
      'Rational non-disclosure documented.',
    ],
  },
  {
    id: 'S3',
    stageNum: 'S3',
    name: 'Perception Destabilization',
    description: "Clinician's confidence in their own clinical perception is systematically undermined by institutional messaging. (Also named Gaslighting in governance/legal contexts.)",
    markers: [
      '"I started to think maybe I was wrong."',
      '"They told me so many times that I began to believe them."',
    ],
  },
  {
    id: 'S4',
    stageNum: 'S4',
    name: 'Moral Adaptation',
    description: "Clinician begins to adapt their ethical framework to accommodate unsafe conditions as acceptable or inevitable.",
    markers: [
      '"This is just healthcare."',
      '"I can\'t fix the system."',
      'Reduced distress response to conditions that previously caused significant concern.',
    ],
  },
  {
    id: 'S5',
    stageNum: 'S5',
    name: 'Full Disengagement',
    description: "Requires all seven mechanisms (M1-M7) simultaneously active. Clinician's capacity for moral agency within the institutional context is effectively neutralized.",
    markers: [
      '"I tell new graduates this is just how it is, and I am not lying."',
      'Reading this stage description without alarm may itself indicate Stage 5.',
    ],
    criticalNote: 'App must offer wellbeing and resource check-in at completion of any Stage 5 response.',
  },
  {
    id: 'S6',
    stageNum: 'S6',
    name: 'Regulatory Capture',
    description: 'Institution has achieved sufficient control over regulatory, oversight, and accountability mechanisms that external correction is no longer reliably triggered by internal harm.',
    markers: [
      'Complaints filed with no consequence.',
      'Regulatory agencies captured by institutional relationships.',
      'Board-level suppression of safety data.',
    ],
  },
];
