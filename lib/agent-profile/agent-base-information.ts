/**
 * This file contains the base information and context that will be provided to the AI agent.
 * You can add multiple layers of information here to give your agent the context it needs
 * to be effective from day one.
 *
 * Structure your information in sections using the sections array below. Each section should have:
 * - title: A clear name for this block of information
 * - content: The actual information/context
 * - priority: Higher priority (1-10) information will be emphasized more in the agent's responses
 */

interface InformationSection {
  title: string;
  content: string;
  priority: number;
}

const baseInformation: InformationSection[] = [
  {
    title: "About Aware Parenting",
    content: `Aware Parenting is an approach to child-rearing developed by Aletha Solter, Ph.D. that combines attachment parenting with insights about children's emotional needs and healing through crying. Founded in 1989, the Aware Parenting Institute provides resources, training, and support for parents seeking a compassionate, non-punitive approach to raising children.

Our mission is to help parents understand and respond sensitively to their children's feelings and needs, creating secure attachments and emotional well-being. We believe that children's crying serves a healing function when supported by loving attention from parents.

The Aware Parenting approach was developed by Dr. Aletha Solter, a Swiss/American developmental psychologist, international speaker, consultant, and founder of the Aware Parenting Institute.`,
    priority: 10,
  },
  {
    title: "Core Principles",
    content: `Key aspects of Aware Parenting include:

- Attachment-style parenting from birth
- Non-punitive discipline without rewards or punishments
- Understanding crying and tantrums as stress-release
- Supporting children's play and laughter for emotional health
- Recognizing and healing parents' own childhood experiences
- Building authentic connections between parents and children
- Responding with empathy to children's emotional needs`,
    priority: 9,
  },
  {
    title: "Resources and Support",
    content: `Aware Parenting offers:
- Books and articles by Dr. Aletha Solter
- Certified Aware Parenting instructors worldwide
- Workshops and training programs
- Support groups and community connections
- Resources in multiple languages
- Individual consultations
- Regular newsletters and updates`,
    priority: 8,
  },
  {
    title: "Key Concepts",
    content: `Core concepts of Aware Parenting include:
- Attachment parenting practices
- Understanding crying as stress release
- Non-punitive discipline approaches
- The importance of play in emotional health
- Healing childhood trauma
- Building authentic parent-child relationships
- Supporting children's emotional expression`,
    priority: 7,
  },
  {
    title: "Common Applications",
    content: `Aware Parenting helps with:
- Building secure attachment bonds
- Managing challenging behaviors without punishment
- Supporting children through emotional release
- Developing authentic parent-child connections
- Healing generational trauma patterns
- Creating peaceful family relationships
- Understanding child development stages`,
    priority: 6,
  },
  {
    title: "Contact Information",
    content: `Contact the Aware Parenting Institute:
Email: info@awareparenting.com
Phone/Fax: +1 (805) 968 1868
Mailing Address: P.O. Box 206, Goleta, CA 93116, USA

Contact Dr. Aletha Solter:
Email: solter@awareparenting.com or info@awareparenting.com
Phone/Fax: +1 (805) 968 1868
Mailing Address: Same as institute

Important Notes:
- Leave voicemail with your question, best time to reach you, and time zone
- International calls are not returned
- Dr. Solter offers consultations but does not give advice via email/Facebook
- For foreign language rights, contact Dr. Solter directly
- Find local instructors: Visit awareparenting.com and select your country's flag
- For parent support: Visit our Parent Support page
- For instructor certification: See Certification Requirements page`,
    priority: 5,
  }
];

/**
 * Formats the information sections into a single string, with higher priority
 * sections appearing first and with more emphasis.
 */
export function getFormattedInformation(): string {
  const sortedSections = [...baseInformation].sort(
    (a, b) => b.priority - a.priority
  );

  return sortedSections
    .map(
      (section) => `
[${section.title.toUpperCase()}]
${section.content}
`
    )
    .join("\n");
}

export default baseInformation;
