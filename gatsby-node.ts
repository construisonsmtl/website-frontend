const path = require("path");

exports.createSchemaCustomization = ({ actions }: any) => {
    const { createTypes } = actions;
    createTypes(`
        type StrapiPostAuthor {
            firstname: String
            lastname: String
        }

        type STRAPI_POST implements Node {
            author: StrapiPostAuthor
        }

        type STRAPI_POLICY implements Node {
            identifier: String
            isMunicipal: Boolean
            isProvincial: Boolean
            isFederal: Boolean
            isVisible: Boolean
        }

        type STRAPI_POLICY_SUPPORT implements Node {
            election: STRAPI_ELECTION
        }

        type STRAPI_ELECTION implements Node {
            name: String
        }
    `);
};

exports.createPages = async ({ graphql, actions, reporter }: any) => {
    const result = await graphql(`
        {
            allStrapiPost {
                nodes {
                    title
                    slug
                    locale
                }
            }
        }
    `);

    if (result.errors) {
        return reporter.panicOnBuild(`There was an error loading your Strapi articles`, result.errors);
    }
    const posts = result.data.allStrapiPost.nodes;

    if (posts.length) {
        const { createPage } = actions;
        const postTemplate = path.resolve("./src/templates/post.tsx");

        for (const post of posts) {
            const locale = post.locale === "en" ? "en/" : "";

            createPage({
                path: `/${locale}blog/${post.slug}`,
                component: postTemplate,
                context: {
                    slug: post.slug,
                },
            });
        }
    }
};
