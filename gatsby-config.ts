import type { GatsbyConfig } from "gatsby";
require("dotenv").config({
    path: `.env`,
});

const config: GatsbyConfig = {
    siteMetadata: {
        title: `Construisons Montréal`,
        siteUrl: `https://www.construisonsmtl.ca`,
    },
    plugins: [
        "gatsby-plugin-postcss",
        {
            resolve: `gatsby-plugin-google-gtag`,
            options: {
                trackingIds: [
                    "G-XL2QVGXY9B", // Google Analytics / GA
                ],
                // This object gets passed directly to the gtag config command
                // This config will be shared across all trackingIds
                gtagConfig: {
                    anonymize_ip: true,
                    cookie_expires: 0,
                },
                // This object is used for configuration specific to this plugin
                pluginConfig: {
                    // Puts tracking script in the head instead of the body
                    head: true,
                    // Setting this parameter is also optional
                    respectDNT: true,
                    // Avoids sending pageview hits from custom paths
                    exclude: [],
                },
            },
        },
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: "Construisons Montréal",
                short_name: "ConstruisonsMTL",
                start_url: "/",
                icon: "src/images/logo.png",
            },
        },
        "gatsby-plugin-image",
        "gatsby-plugin-react-helmet",
        "gatsby-plugin-sitemap",
        "gatsby-plugin-sharp",
        "gatsby-transformer-sharp",
        "gatsby-transformer-remark",
        "gatsby-plugin-anchor-links",
        {
            resolve: "gatsby-source-strapi",
            options: {
                apiURL: process.env.API_URL || "http://localhost:1337",
                accessToken: process.env.STRAPI_TOKEN,
                collectionTypes: [
                    {
                        singularName: "post",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "post-category",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "action",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "event",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "policy",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "policy-category",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "election",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "policy-support",
                        queryParams: {
                            populate: {
                                election: {
                                    populate: "*",
                                },
                                political_party: {
                                    populate: "*",
                                },
                            },
                        },
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "political-party",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "city-policy-question",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    }
                ],
                singleTypes: [
                    {
                        singularName: "homepage",
                        queryParams: {
                            populate: {
                                heroBackground: {
                                    populate: "*",
                                },
                                visionPoints: {
                                    populate: "*",
                                },
                            },
                        },
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "contact",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "city-policies-page",
                        queryParams: {
                            populate: {
                                seoImage: {
                                    populate: "*",
                                },
                                heroBackground: {
                                    populate: "*",
                                },
                                cityPolicyQuestions: {
                                    populate: {
                                        answers: {
                                            answer: {
                                                populate: "*",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "policies-page",
                        queryParams: {
                            populate: {
                                seoImage: {
                                    populate: "*",
                                },
                                heroBackground: {
                                    populate: "*",
                                },
                                policy_categories: {
                                    populate: {
                                        policies: {
                                            populate: {
                                                policy_category: {
                                                    populate: "*",
                                                },
                                                policy_supports: {
                                                    populate: {
                                                        election: {
                                                            populate: "*",
                                                        },
                                                        political_parties: {
                                                            populate: "*",
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "involvement-callout",
                        pluginOptions: {
                            i18n: {
                                locale: "all",
                            },
                        },
                    },
                    {
                        singularName: "social",
                    },
                ],
                queryLimit: 1000,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/src/images`,
                name: `images`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/locales`,
                name: `locale`,
            },
        },
        {
            resolve: `@herob191/gatsby-plugin-react-i18next`,
            options: {
                version: 4,
                localeJsonSourceName: `locale`, // name given to `gatsby-source-filesystem` plugin.
                languages: [`fr`, `en`],
                defaultLanguage: `fr`,
                redirect: false,
                // if you are using Helmet, you must include siteUrl, and make sure you add http:https
                siteUrl: `https://www.construisonsmtl.ca`,
                i18nextOptions: {
                    interpolation: {
                        escapeValue: false, // not needed for react as it escapes by default
                    },
                },
                pages: [
                    {
                        matchPath: "/:lang?/blog/:uid",
                        getLanguageFromPath: true,
                    },
                    {
                        matchPath: "/:lang?/:uid",
                        languages: ["en", "fr"],
                        getLanguageFromPath: false,
                    },
                ],
            },
        },
        {
            resolve: "gatsby-plugin-react-svg",
            options: {
                include: "/assets/",
            },
        },
    ],
};

export default config;
