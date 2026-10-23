import type { Dictionary } from "./id";

/** English UI strings. `satisfies Dictionary` fails the build on a missing or extra key. */
export const en = {
  meta: {
    defaultTitle: "Nusantara · Cultural Heritage",
    description:
      "Explore Indonesian traditional dress, heirloom recipes, and folk tales in two languages.",
  },
  brand: {
    tagline: "Cultural Heritage",
  },
  a11y: {
    skipToContent: "Skip to main content",
    mainNav: "Main navigation",
  },
  nav: {
    home: "Home",
    library: "Library",
    regions: "Regions",
    me: "Me",
  },
  language: {
    label: "Language",
    id: "Bahasa Indonesia",
    en: "English",
    idCode: "ID",
    enCode: "EN",
  },
  theme: {
    toggle: "Dark mode",
  },
  account: {
    generic: "Account",
    signIn: "Sign in",
    myAccount: "My account",
  },
  common: {
    comingSoon: "Coming soon",
    openLibrary: "Open the library",
    backToLibrary: "Back to the library",
    backToRegions: "Back to the region list",
    backHome: "Back to home",
  },
  home: {
    kicker: "A bilingual culture archive",
    title: "Explore the Culture of Nusantara",
    lead: "Traditional dress, heirloom recipes, and folk tales from across Indonesia, in Indonesian and English.",
    primaryCta: "Open the library",
    pillarsHeading: "Three heritage pillars",
    pillarsLead: "Choose a path to start exploring.",
    pillars: {
      costume: {
        kicker: "On your device",
        title: "Traditional Dress Try-On",
        subtitle: "Wear traditional dress, virtually",
        body: "Pick traditional dress from different regions and try it on in your browser. Photos are processed on your device and never uploaded.",
        cta: "Browse traditional dress",
      },
      recipe: {
        kicker: "Heritage kitchen",
        title: "Nusantara Recipes",
        subtitle: "Traditional recipes with clear sources",
        body: "Ingredients, steps, servings, and dietary notes in two languages. A halal label appears only when a source has verified it.",
        cta: "Browse recipes",
      },
      story: {
        kicker: "Oral tradition",
        title: "Folk Tales & Audio",
        subtitle: "Folk tales, chapter by chapter",
        body: "Read or listen to folk tales with illustrations and audio descriptions, so blind readers can enjoy them too.",
        cta: "Browse folk tales",
      },
    },
    reviewTitle: "Reviewed before publishing",
    reviewBody:
      "Every story, recipe, and traditional dress is checked by a human reviewer. Only approved content is shown to the public.",
  },
  library: {
    kicker: "Library",
    title: "Culture Library",
    lead: "Browse folk tales, heirloom recipes, and traditional dress from across Nusantara.",
    emptyTitle: "Nothing published yet",
    emptyBody:
      "Stories, recipes, and traditional dress will appear here after a reviewer approves them.",
  },
  regions: {
    kicker: "Regions",
    title: "Explore by Region",
    lead: "Each region will have a page with its story, recipe, and traditional dress.",
    emptyTitle: "No regions published yet",
    emptyBody: "The region list will appear here after a reviewer approves it.",
  },
  regionDetail: {
    kicker: "Region",
    title: "Region page",
    body: "This page will show the story, recipe, and traditional dress from this region after a reviewer approves them.",
  },
  storyDetail: {
    kicker: "Folk tale",
    title: "Story player",
    body: "This is where you will read and listen to the folk tale chapter by chapter, once a reviewer approves the story.",
    accessibilityNote:
      "Each chapter shows its text, an illustration with alt text, and an audio description before the audio plays.",
  },
  recipeDetail: {
    kicker: "Recipe",
    title: "Recipe details",
    body: "This page will show the recipe name in both languages, its ingredients, steps, servings, and dietary notes, once a reviewer approves the recipe.",
    halalNote: "A halal label is shown only when a source has verified the halal status.",
  },
  tryOn: {
    kicker: "Traditional Dress Try-On",
    title: "Try-On Studio",
    lead: "Try on traditional dress from different regions right in your browser.",
    privacyTitle: "Your photos stay on your device",
    privacyBody:
      "Photos are processed on your device and never uploaded. We do not store your photos on any server.",
    statusBody:
      "The try-on studio is being prepared. In the meantime, browse traditional dress in the library.",
    cta: "Browse traditional dress",
  },
  me: {
    kicker: "Me",
    title: "Member Page",
    loading: "Loading your account…",
    usernameLabel: "Nickname",
    noUsername: "Not set",
    rolesLabel: "Role",
    memberRole: "Member",
    reviewLink: "Open the review queue",
    signOut: "Sign out",
    nickname: {
      title: "Choose your nickname",
      body: "Your nickname is what others see on Nusantara. We never show the real name or photo from your Google account.",
      editTitle: "Change your nickname",
      submit: "Save nickname",
      pending: "Saving…",
      saved: "Nickname saved.",
    },
  },
  roles: {
    reviewer: "Reviewer",
    owner: "Owner",
  },
  review: {
    kicker: "Reviewer",
    title: "Review Queue",
    lead: "A summary of drafts waiting for review.",
    loading: "Loading the draft summary…",
    tableCaption: "Drafts by content type",
    typeHeader: "Content type",
    draftsHeader: "Drafts",
    phaseNote:
      "The full queue for editing, approving, rejecting, and unpublishing content arrives in Phase 2.",
    types: {
      region: "Regions",
      story: "Stories",
      chapter: "Story chapters",
      recipe: "Recipes",
      costume: "Traditional dress",
    },
  },
  auth: {
    login: {
      kicker: "Account",
      title: "Sign in",
      lead: "Sign in to save your progress and bookmarks.",
      submit: "Sign in",
      pending: "Signing in…",
      switchPrompt: "No account yet?",
      switchLink: "Sign up",
    },
    signup: {
      kicker: "Account",
      title: "Sign up",
      lead: "Create an account with a nickname. We never ask for your real name.",
      submit: "Create account",
      pending: "Creating account…",
      switchPrompt: "Already have an account?",
      switchLink: "Sign in",
    },
    fields: {
      username: "Nickname",
      usernameHint: "3–24 characters: lowercase letters, numbers, or underscores.",
      email: "Email",
      password: "Password",
      passwordHint: "At least 8 characters.",
    },
    errors: {
      invalid_input: "Please check the highlighted fields.",
      invalid_credentials: "The email or password is incorrect.",
      email_not_confirmed:
        "Your email is not confirmed yet. Open the link we sent to your email first.",
      weak_password: "That password is too weak. Please use a longer password.",
      email_taken: "This email is already registered. Please sign in.",
      link_invalid: "That confirmation link is invalid or has expired. Please sign in, or sign up again.",
      oauth_failed: "Google sign-in did not work. Please try again.",
      oauth_cancelled: "Google sign-in was cancelled.",
      nickname_taken: "That nickname is already taken. Please try another.",
      rate_limited: "Too many attempts. Please wait a moment, then try again.",
      unknown: "Something went wrong. Please try again.",
    },
    google: {
      continue: "Continue with Google",
      pending: "Redirecting to Google…",
      privacyNote: "We use your Google account only to sign you in. Your Google name and photo are not shown.",
      divider: "or",
    },
    checkEmailTitle: "Check your email",
    checkEmailBody: "We sent you a confirmation link. Open it to activate your account.",
  },
  halal: {
    verified: "Halal (verified by source)",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or is not published yet.",
  },
  errorPage: {
    title: "Something went wrong",
    body: "This page could not load. Try again, or go back home.",
    retry: "Try again",
    home: "Go to home",
    reference: "Reference code",
  },
} satisfies Dictionary;
