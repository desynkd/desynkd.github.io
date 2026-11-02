// Everglae privacy policy, published at /everglae/privacy for Google Play.
// Copied from /mnt/work/Project/lock/src/lib/legal.ts (LEGAL.privacy), with
// ${MAKER}, ${CONTACT} and ${PRIVACY_URL} filled in. Keep the two in step: edit the app's
// copy first, then update this one to match.

export const DEVELOPER = "Ravindu Peeris";
export const PUBLISHER = "Prjkt Studios";
export const CONTACT = "projectpuredark@gmail.com";

export type LegalDoc = {
  title: string;
  /** One sentence under the title. */
  text: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

export const privacy: LegalDoc = {
  title: "Privacy Policy",
  text: "Everglae collects nothing. Everything it uses stays on your phone.",
  updated: "29 October 2026",
  sections: [
    {
      heading: "The short version",
      body: [
        "Everglae is made by Ravindu Peeris, publishing as Prjkt Studios. It has no accounts, no ads, no analytics and no internet access. We never receive any information about you or how you use the app.",
      ],
    },
    {
      heading: "What stays on your phone",
      body: [
        "Your rules: which apps are locked, their daily limits and schedules, any pass you are using and how many you have taken today, and whether you use lenient or strict mode.",
        "Your media: a private copy of each video or photo you pick from your gallery, shrunk to save space.",
        "A count of how many times each app was stopped today. It starts again every day.",
        "This is stored in Everglae's private storage. Other apps cannot read it, and it is left out of Android's cloud backup.",
      ],
    },
    {
      heading: "What Everglae can see, and why",
      body: [
        "Accessibility service: the name of the app that comes to the screen, so Everglae can tell when a locked app opens. It cannot read what is on the screen or what you type.",
        "Usage access: how long each app has been on screen, today and on each of the last seven days, for daily limits, the rings and the weekly screen time page. Everglae reads this from Android when you open those screens, shows it, and does not keep a copy or a history of its own.",
        "Your installed apps: their names and icons, so you can choose which to lock.",
        "Your gallery: only the videos and photos you pick yourself.",
        "Notifications: used to warn you before a daily limit runs out, before a schedule starts and before a pass ends, and to tell you if locks stop working.",
        "Each of these is optional. Everglae asks before using the accessibility service and usage access, and you can turn them off in Android settings at any time.",
      ],
    },
    {
      heading: "What we share",
      body: [
        "Nothing. Everglae cannot connect to the internet, so it cannot send information to us or to anyone else. It contains no advertising or tracking software.",
        "The credits screen has links that open in your browser. Those websites have their own privacy policies.",
      ],
    },
    {
      heading: "Deleting your information",
      body: [
        "Uninstalling Everglae, or clearing its storage in Android settings, removes everything it has stored. Videos and photos in your gallery are not touched: Everglae only deletes its own copies.",
      ],
    },
    {
      heading: "Children",
      body: [
        "Everglae is not meant for children under 13, and we do not knowingly collect information from anyone.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "If this policy changes, the new version ships with an app update and is posted at https://desynkd.github.io/everglae/privacy/, and the date above changes with it.",
      ],
    },
    {
      heading: "Contact",
      body: ["Questions about this policy: projectpuredark@gmail.com"],
    },
  ],
};
