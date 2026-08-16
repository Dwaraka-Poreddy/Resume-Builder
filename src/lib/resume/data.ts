import type { Bullet, Design, Entry, GroupItem, Resume, Section, SectionLayout } from "./types";
import { uid } from "./types";

const b = (text: string): Bullet => ({ id: uid(), text });

const entry = (
  title: string,
  right: string,
  subtitle: string,
  subtitleRight: string,
  bullets: string[],
): Entry => ({ id: uid(), title, right, subtitle, subtitleRight, bullets: bullets.map(b) });

const group = (label: string, text: string): GroupItem => ({ id: uid(), label, text });

export const emptySection = (layout: SectionLayout = "entries"): Section => ({
  id: uid(),
  title: "New section",
  layout,
  column: "main",
  hidden: false,
  entries: layout === "entries" ? [entry("Title", "Date", "Subtitle", "", ["Detail"])] : [],
  items: layout === "bullets" || layout === "lines" ? [b("New line")] : [],
  groups: layout === "groups" ? [group("Label", "Value")] : [],
});

const section = (
  title: string,
  layout: SectionLayout,
  data: Partial<Pick<Section, "entries" | "items" | "groups" | "column">>,
): Section => ({
  id: uid(),
  title,
  layout,
  column: data.column ?? "main",
  hidden: false,
  entries: data.entries ?? [],
  items: data.items ?? [],
  groups: data.groups ?? [],
});

export const defaultDesign: Design = {
  fontFamily: '"CMU Serif", "Latin Modern Roman", Georgia, serif',
  textColor: "#141414",
  headingColor: "#000000",
  accentColor: "#1a1a1a",
  fontSize: 9.4,
  headingScale: 1.3,
  lineHeight: 1.3,
  sectionSpacing: 7,
  columnSplit: 34,
  letterSpacing: 0,
  uppercaseHeadings: false,
  nameSmallCaps: true,
  fitOnePage: true,
  boldSectionTitles: true,
  headingRule: true,
  headingRuleWidth: 1,
  headingRuleGap: 1.5,
  headingSpaceAfter: 3,
  headingAlign: "left",
  headerAlign: "center",
  entrySpacing: 5,
  bulletSpacing: 1,
  bulletIndent: 10,
  itemSpacing: 1,
  columnGap: 6,
  marginTop: 12,
  marginRight: 12,
  marginBottom: 12,
  marginLeft: 12,
};

export const defaultResume: Resume = {
  name: "Dwarakanatha Reddy Poreddy",
  location: "Bangalore, India",
  contacts: [
    { id: uid(), label: "+91-9121418925", url: "tel:+919121418925" },
    { id: uid(), label: "dwaraka.bits@gmail.com", url: "mailto:dwaraka.bits@gmail.com" },
    { id: uid(), label: "Dwaraka-Poreddy", url: "https://github.com/Dwaraka-Poreddy" },
    { id: uid(), label: "Dwaraka Poreddy", url: "https://www.linkedin.com/in/dwaraka-poreddy" },
  ],
  design: defaultDesign,
  sections: [
    section("Education", "entries", {
      entries: [
        entry(
          "Birla Institute of Technology and Science Pilani, Hyderabad",
          "2017 – 2022",
          "B.E. Mechanical Engineering and M.Sc. Economics",
          "**CGPA - 7.32/10**",
          [],
        ),
        entry("Sri Chaitanya College, Vijayawada", "2016", "Class 12th", "**Percentage - 96.5%**", []),
      ],
    }),
    section("Experience", "entries", {
      entries: [
        entry(
          "**Gojek**",
          "**Aug 2022 – Present**",
          "*SDE-2* – Developer Experience – Bangalore – Jan 2024 – Present",
          "",
          [
            "Built **internal portals** using **Next.js** and **GraphQL** to streamline workflows for engineering, product, and business teams.",
            "Designed and developed **real-time dashboards** with server-side rendering (SSR) in Next.js, visualizing live analytics, user/device metrics, and operational KPIs.",
            "Contributed to a **server-driven UI** configuration portal enabling teams to control app UIs from the backend, cutting release cycles and boosting deployment speed.",
          ],
        ),
        entry(
          "",
          "",
          "*SDE-2* – Customer Acquisition – Bangalore – Aug 2022 – Jan 2024",
          "",
          [
            "Built and maintained multiple features across **Flutter** and **native iOS** codebases, ensuring high performance for a high-traffic, consumer-facing application.",
            "Improved stability by reducing crashes, speeding up load times by **18%** via bug fixes and performance optimizations, and increased **test coverage by 40%**.",
            "Collaborated with cross-functional teams to deliver seamless UI/UX, while actively participating in code reviews to ensure consistency and quality. Mentored juniors and drove internal workshops.",
          ],
        ),
        entry(
          "**EvaluAItor (AI.VONE Technologies Pvt Ltd)**",
          "**Nov 2023 – Dec 2024**",
          "**Founder** | [Live](https://evaluaitor.com)",
          "",
          [
            "Built a platform using a **fine-tuned GPT-4o model** for conducting conversational **AI interviews** for students, colleges, and companies. Built a team of around **25 interns**.",
            "Qualified for the **Google Cloud Program** and conducted **500+ AI mock interviews**.",
            "Secured **5th position in Global Entrepreneur Summit** Pune.",
          ],
        ),
        entry(
          "**Deutsche India Pvt Ltd.**",
          "**Aug 2021 – Dec 2021**",
          "Project Intern | Mumbai | [Certificate](https://example.com/certificate)",
          "",
          [
            "As a team member of **Counterparty Credit Rating**, credit rated more than **20 financial institutions** and corporates from all over the world.",
            "Analyzed the qualitative parameters and determined the **probability of default**.",
          ],
        ),
      ],
    }),
    section("Projects", "entries", {
      entries: [
        entry(
          "**Gifts Hub** | Web Development | [Demo](https://giftshub.web.app) | [Source Code](https://github.com/Dwaraka-Poreddy)",
          "Dec 2020 – Feb 2021",
          "",
          "",
          [
            "Designed and developed a **free personalized virtual gifting website** in React with highly customizable digital gifts and scheduled delivery. Deployed using Firebase.",
            "Users create a gift pack and customize the items with their info; gifts are automatically sent to the recipient based on the occasion date.",
          ],
        ),
        entry(
          "**EcommerceJet** | Full Stack Development | [Source Code](https://github.com/Dwaraka-Poreddy)",
          "May 2021 – Jul 2021",
          "",
          "",
          [
            "Built a full stack **E-commerce application** with admin dashboard, product filters, star rating system, discount coupons, **Stripe payments** and cash-on-delivery options.",
            "Built using **React Redux**, Ant Design, Firebase, **Node.js** and **MongoDB**.",
          ],
        ),
        entry(
          "**Trip Finder** | Full Stack Development | [Source Code](https://github.com/Dwaraka-Poreddy)",
          "Oct 2020 – Nov 2020",
          "",
          "",
          [
            "Developed a tourism website displaying prices, amenities, and locations via **Google Maps**, with user-generated spots, comments, and ratings.",
            "Built with Node.js, Express, MongoDB, and Passport.js. Deployed using Heroku.",
          ],
        ),
      ],
    }),
    section("Skills", "groups", {
      groups: [
        group("Languages", "JS • Dart • Python • Swift • C++"),
        group("Frameworks", "ReactJS • NextJS • NodeJS • ExpressJS • Flutter"),
        group("Databases and Tools", "MongoDB • SQL • Postman • Git"),
        group(
          "Coursework",
          "Object Oriented Programming • Data Structures and Algorithms • Operating Systems • Software Engineering • Discrete Mathematics • Computer Networks • Probability and Statistics",
        ),
      ],
    }),
    section("Certifications", "lines", {
      items: [
        b("**Amazon ML Summer School** — Amazon, July 2021 | [Certificate](https://example.com/amazon-ml)"),
        b("**React Specialization** — Coursera, Aug 2020 | [Certificate](https://coursera.org)"),
        b("**Six Sigma** — Shigemi Sols, Sep 2017 | [Certificate](https://example.com/six-sigma)"),
      ],
    }),
    section("Achievements and Awards", "bullets", {
      items: [
        b("Solved **300+** Data Structure and Algorithm problems on [GFG](https://www.geeksforgeeks.org/user/dwarakaporeddy), [LeetCode](https://leetcode.com/u/Dwaraka.P) and InterviewBit."),
        b("Secured **top 10th position** in BITS Hyderabad on the Geeks for Geeks practice website."),
        b("Won elections to become **Hostel President** at BITS Hyderabad for 2018-19."),
        b("Volunteer: Nirmaan (Committee Member), Pebble Sierra (Program Coordinator), Grandh (Web Developer)."),
        b("Languages: English • Hindi • Telugu."),
      ],
    }),
  ],
};