import { lazy } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

export const publicRoutes = [
  {
    name: "home",
    path: "/",
    component: lazy(() => import("components/Home")),
    exact: true,
    isAnonymous: true,
    isNavbar: false,
  },
  {
    name: "test",
    isNavbar: true,
    icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
    collapse: [
      {
        name: "landing pages1",
        collapse: [
          {
            name: "about-us1",
            path: "/landing-pages/about-us",
          },
          {
            name: "contact-us1",
            path: "/landing-pages/contact-us",
          },
        ],
      },
      {
        name: "profile",
        collapse: [
          {
            name: "testProfile1",
            path: "/profile",
          },
        ],
      },
    ],
  },
  {
    name: "test2",
    isNavbar: true,
    icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
    collapse: [
      {
        name: "landing pages2",
        collapse: [
          {
            name: "about-us2",
            path: "/landing-pages/about-us",
          },
          {
            name: "contact-us2",
            path: "/landing-pages/contact-us",
          },
        ],
      },
      {
        name: "profile2",
        collapse: [
          {
            name: "testProfile2",
            path: "/profile",
          },
        ],
      },
    ],
  },
  {
    name: "test2",
    isNavbar: true,
    icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
    collapse: [
      {
        name: "landing pages2",
        collapse: [
          {
            name: "about-us2",
            path: "/landing-pages/about-us",
          },
          {
            name: "contact-us2",
            path: "/landing-pages/contact-us",
          },
        ],
      },
      {
        name: "profile2",
        collapse: [
          {
            name: "testProfile2",
            path: "/profile",
          },
        ],
      },
    ],
  },
  {
    name: "test2",
    isNavbar: true,
    icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
    collapse: [
      {
        name: "landing pages2",
        collapse: [
          {
            name: "about-us2",
            path: "/landing-pages/about-us",
          },
          {
            name: "contact-us2",
            path: "/landing-pages/contact-us",
          },
        ],
      },
      {
        name: "profile2",
        collapse: [
          {
            name: "testProfile2",
            path: "/profile",
          },
        ],
      },
    ],
  },
  {
    name: "test2",
    isNavbar: true,
    icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
    collapse: [
      {
        name: "landing pages2",
        collapse: [
          {
            name: "about-us2",
            path: "/landing-pages/about-us",
          },
          {
            name: "contact-us2",
            path: "/landing-pages/contact-us",
          },
        ],
      },
      {
        name: "profile2",
        collapse: [
          {
            name: "testProfile2",
            path: "/profile",
          },
        ],
      },
    ],
  },
  {
    name: "test2",
    isNavbar: true,
    icon: <FontAwesomeIcon icon={faPaperclip} className="icon" />,
    collapse: [
      {
        name: "landing pages2",
        collapse: [
          {
            name: "about-us2",
            path: "/landing-pages/about-us",
          },
          {
            name: "contact-us2",
            path: "/landing-pages/contact-us",
          },
        ],
      },
      {
        name: "profile2",
        collapse: [
          {
            name: "testProfile2",
            path: "/profile",
          },
        ],
      },
    ],
  },
];
