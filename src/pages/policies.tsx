import { graphql, navigate, PageProps } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation, useI18next } from "@herob191/gatsby-plugin-react-i18next";
import Footer from "../components/footer";
import InvolvementCallout, { InvolvementData } from "../components/involvement-callout";
import SEO from "../components/seo";
import NavLinks from "../components/nav-links";
import NavHeader from "../components/nav-header";
import {
    Nodes,
    PolicyCategoryData,
    PolicyData,
    ElectionData,
    SocialLinks,
    StrapiImage,
} from "../helpers/content-types";

type PoliciesPageData = {
    content: {
        heroTitle: string;
        heroDescription: string;
        feedbackEmail: string;
        heroBackground: StrapiImage;
        seoImage: StrapiImage;
        policy_categories: PolicyCategoryData[];
    };
    elections: Nodes<ElectionData>;
    socials: SocialLinks;
    involvementCallout: InvolvementData;
};
export const Head = ({ data, pageContext }: any) => {
    const content = data.content;

    return <SEO
        i18n={pageContext.i18n}
        metaTitle={content.heroTitle}
        metaDescription={content.heroDescription}
        shareImage={content.seoImage.localFile.url!}
    />;
};

const JURISDICTION_FILTERS = ["municipal", "provincial", "federal"] as const;

const PoliciesPage = ({ data, location }: PageProps<PoliciesPageData>) => {
    const content = data.content;

    const { t } = useTranslation();
    const { language } = useI18next();
    const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());

    const toggleExpanded = useCallback((key: string) => {
        setExpandedPolicies((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    const activeFilters = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get("jurisdiction");
        if (!raw) return new Set<string>();
        return new Set(
            raw.split(",").filter((v) => JURISDICTION_FILTERS.includes(v as any)),
        );
    }, [location.search]);

    const activeElectionFilters = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get("election");
        if (!raw) return new Set<string>();
        return new Set(raw.split(",").filter(Boolean));
    }, [location.search]);

    const showElectionFilters = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("hidden") === "false";
    }, [location.search]);

    const toggleFilter = useCallback(
        (filter: string) => {
            const next = new Set(activeFilters);
            if (next.has(filter)) {
                next.delete(filter);
            } else {
                next.add(filter);
            }
            const params = new URLSearchParams(location.search);
            if (next.size > 0) {
                params.set("jurisdiction", Array.from(next).join(","));
            } else {
                params.delete("jurisdiction");
            }
            const query = params.toString();
            const newUrl = `${location.pathname}${query ? `?${query}` : ""}`;
            navigate(newUrl, { replace: true });
        },
        [activeFilters, location.search, location.pathname],
    );

    const toggleElectionFilter = useCallback(
        (electionId: string) => {
            const next = new Set(activeElectionFilters);
            if (next.has(electionId)) {
                next.delete(electionId);
            } else {
                next.add(electionId);
            }
            const params = new URLSearchParams(location.search);
            if (next.size > 0) {
                params.set("election", Array.from(next).join(","));
            } else {
                params.delete("election");
            }
            const query = params.toString();
            const newUrl = `${location.pathname}${query ? `?${query}` : ""}`;
            navigate(newUrl, { replace: true });
        },
        [activeElectionFilters, location.search, location.pathname],
    );

    const matchesFilter = (policy: PolicyData) => {
        if (activeFilters.size === 0) return true;
        if (activeFilters.has("municipal") && policy.isMunicipal) return true;
        if (activeFilters.has("provincial") && policy.isProvincial) return true;
        if (activeFilters.has("federal") && policy.isFederal) return true;
        return false;
    };

    const heroBackground = getImage(content.heroBackground.localFile);
    const policyCategories = content.policy_categories
        .map((cat) => ({
            ...cat,
            policies: cat.policies?.filter((policy) => policy.isVisible !== false && matchesFilter(policy)),
        }))
        .filter((cat) => cat.policies && cat.policies.length > 0)
        .sort((a, b) => a.description > b.description ? 1 : -1);

    const elections = data.elections.nodes;

    const selectedElections = useMemo(
        () => elections.filter((election) => activeElectionFilters.has(election.id)),
        [elections, activeElectionFilters],
    );

    // Parties (columns) to display, in order of first appearance across selected elections
    const supportParties = useMemo(() => {
        const parties: { name: string; shortName: string; color: string }[] = [];
        const seen = new Set<string>();
        for (const election of selectedElections) {
            for (const support of election.policy_supports ?? []) {
                const party = support.political_party;
                if (party && !seen.has(party.name)) {
                    seen.add(party.name);
                    parties.push(party);
                }
            }
        }
        return parties;
    }, [selectedElections]);

    const getPolicySupportForParty = useCallback(
        (policy: PolicyData, partyName: string, electionId: string) => {
            const election = elections.find((e) => e.id === electionId);
            const electionSupportIds = new Set((election?.policy_supports ?? []).map((s) => s.id));
            return policy.policy_supports?.find(
                (support) =>
                    electionSupportIds.has(support.id) &&
                    support.political_party?.name === partyName,
            );
        },
        [elections],
    );

    const showSupportColumns = selectedElections.length > 0 && supportParties.length > 0;

    return (
        <div>
            <div className="relative w-full h-auto">
                <div className="absolute z-10 w-full h-full bg-blue-600/90"></div>
                <GatsbyImage
                    className="!absolute object-cover w-full h-full"
                    image={heroBackground!}
                    alt={content.heroBackground.alternativeText}
                />
                <div className="relative z-10 flex flex-col items-center h-full px-4 py-6 m-auto max-w-screen-2xl">
                    <NavHeader variant="light" />
                    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-4 py-10 lg:px-32 lg:py-24 text-center">
                        <h1 className="text-2xl font-bold text-white lg:text-4xl font-display">{content.heroTitle}</h1>
                        <p className="text-lg font-medium text-white opacity-80">{content.heroDescription}</p>
                    </div>
                </div>
            </div>
            <div className="w-full h-auto bg-gray-50">
                <div className="m-auto max-w-screen-2xl">
                    <div className="py-4 lg:py-10 px-2 lg:px-4">
                        <div className="grid grid-cols-12 gap-4">
                            <p className="text-2xl lg:text-3xl text-center lg:text-left font-display text-gray-800 font-bold col-span-12">
                                {t("policies.policies")}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 py-4">
                            {JURISDICTION_FILTERS.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => toggleFilter(filter)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                        activeFilters.has(filter)
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                    {t(`policies.filter_${filter}`)}
                                </button>
                            ))}
                        </div>
                        {showElectionFilters && elections.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-4">
                                {elections.map((election) => (
                                    <button
                                        key={election.id}
                                        onClick={() => toggleElectionFilter(election.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                            activeElectionFilters.has(election.id)
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                        }`}
                                    >
                                        {election.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        {policyCategories.map((category: PolicyCategoryData, index: number) => {
                            return (
                                <div className="py-4 lg:py-8" key={"cat-" + index}>
                                    <div className="grid grid-cols-12 lg:gap-2">
                                        <p className="mb-4 text-lg lg:text-2xl font-bold text-gray-800 font-display col-span-12">
                                            {category.name}
                                        </p>
                                    </div>
                                    {category.policies?.map((policy: PolicyData, policyIndex: number) => {
                                        return (
                                            <div
                                                id={policy.identifier ? `policy-${policy.identifier}` : undefined}
                                                className={`grid grid-cols-12 lg:gap-2 rounded-xl bg-white shadow-lg lg:shadow-none lg:bg-transparent lg:border-none p-4 mb-4 lg:p-0 lg:my-0 border-gray-300 border ${showSupportColumns ? "items-stretch" : ""}`}
                                                key={policyIndex}
                                            >
                                                <div
                                                    className={`${showSupportColumns ? "col-span-12 lg:col-span-6" : "col-span-12"} pr-4 pb-2 lg:p-4 lg:hover:shadow-xl border lg:hover:border-gray-300 border-transparent rounded-xl transition-all duration-200`}
                                                >
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <p className="lg:text-lg font-medium text-gray-700">
                                                            {policy.identifier && <button
                                                                onClick={() => {
                                                                    const hash = `#policy-${policy.identifier}`;
                                                                    const url = `${window.location.origin}${location.pathname}${hash}`;
                                                                    window.history.replaceState(null, "", `${location.pathname}${location.search}${hash}`);
                                                                    navigator.clipboard.writeText(url);
                                                                }}
                                                                className="text-gray-400 hover:text-blue-500 cursor-pointer mr-1"
                                                                title={t("policies.copy_link")}
                                                            >#{policy.identifier}</button>}
                                                            {policy.title}
                                                        </p>
                                                        {policy.isMunicipal && (
                                                            <span className="text-xs rounded-full px-2 py-0.5 bg-green-100 text-green-800">
                                                                {t("policies.tag_municipal")}
                                                            </span>
                                                        )}
                                                        {policy.isProvincial && (
                                                            <span className="text-xs rounded-full px-2 py-0.5 bg-blue-100 text-blue-800">
                                                                {t("policies.tag_provincial")}
                                                            </span>
                                                        )}
                                                        {policy.isFederal && (
                                                            <span className="text-xs rounded-full px-2 py-0.5 bg-red-100 text-red-800">
                                                                {t("policies.tag_federal")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm lg:text-base text-gray-600">
                                                        {policy.explanation}
                                                    </p>
                                                    {(policy.links?.strapi_json_value?.length ?? 0) > 0 && (() => {
                                                        const policyKey = `${index}-${policyIndex}`;
                                                        const isExpanded = expandedPolicies.has(policyKey);
                                                        return (
                                                            <div className="mt-2">
                                                                <button
                                                                    onClick={() => toggleExpanded(policyKey)}
                                                                    className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer transition-colors duration-200"
                                                                >
                                                                    {t("policies.references")} {isExpanded ? "▾" : "▸"}
                                                                </button>
                                                                {isExpanded && (
                                                                    <ul className="mt-1 space-y-1">
                                                                        {policy.links?.strapi_json_value.map((link, linkIndex) => (
                                                                            <li key={linkIndex}>
                                                                                <a
                                                                                    href={link.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-sm text-blue-600 underline hover:text-blue-800"
                                                                                >
                                                                                    {language === "fr" ? link.title_fr : link.title_en}
                                                                                </a>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                {showSupportColumns && (
                                                    <div className="col-span-12 lg:col-span-6 grid grid-cols-12 gap-2 items-center px-4 py-2 lg:py-4">
                                                        {supportParties.map((party) => {
                                                            const support = selectedElections
                                                                .map((election) => getPolicySupportForParty(policy, party.name, election.id))
                                                                .find(Boolean);
                                                            return (
                                                                <div
                                                                    key={party.name}
                                                                    className="relative col-span-6 sm:col-span-4 lg:col-span-3 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-center group/support"
                                                                >
                                                                    <span
                                                                        className="text-xs font-semibold truncate w-full"
                                                                        style={{ color: party.color || undefined }}
                                                                    >
                                                                        {party.shortName || party.name}
                                                                    </span>
                                                                    {support ? (
                                                                        support.fullSupport ? (
                                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-lg font-bold leading-none">✓</span>
                                                                        ) : (
                                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-white text-lg font-bold leading-none">-</span>
                                                                        )
                                                                    ) : (
                                                                        <span className="text-gray-300 text-xl">·</span>
                                                                    )}
                                                                    {support && (support.quote || support.source) && (
                                                                        <div
                                                                            className="pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[80vw] rounded-lg bg-gray-900 text-white text-xs text-left p-3 shadow-lg opacity-0 group-hover/support:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
                                                                            role="tooltip"
                                                                        >
                                                                            {support.quote && <p className="italic mb-1">“{support.quote}”</p>}
                                                                            {support.source && <p className="text-gray-300">{support.source}</p>}
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <InvolvementCallout
                title={data.involvementCallout.title}
                content={data.involvementCallout.content}
                image={data.involvementCallout.image}
                joinLink={data.involvementCallout.joinLink}
            />
            <Footer socials={data.socials}>
                <NavLinks variant="light" />
            </Footer>
        </div>
    );
};

export const query = graphql`
    query ($language: String!) {
        content: strapiPoliciesPage(locale: { eq: $language }) {
            heroTitle
            heroDescription
            feedbackEmail
            heroBackground {
                alternativeText
                localFile {
                    childImageSharp {
                        gatsbyImageData(breakpoints: [320, 768, 1536], placeholder: BLURRED)
                    }
                    url
                }
            }
            seoImage {
                alternativeText
                localFile {
                    url
                }
            }
            policy_categories {
                name
                description
                policies {
                    title
                    explanation
                    justification
                    identifier
                    isMunicipal
                    isProvincial
                    isFederal
                    isVisible
                    links {
                        strapi_json_value {
                            title_en
                            title_fr
                            url
                        }
                    }
                    policy_category {
                        name
                    }
                    policy_supports {
                        id
                        fullSupport
                        quote
                        source
                        election {
                            id
                            name
                        }
                        political_party {
                            name
                            shortName
                            color
                        }
                    }
                }
            }
        }
        involvementCallout: strapiInvolvementCallout(locale: { eq: $language }) {
            image {
                alternativeText
                localFile {
                    childImageSharp {
                        gatsbyImageData(breakpoints: [320, 768], placeholder: BLURRED)
                    }
                }
            }
            title
            content
            joinLink
        }
        elections: allStrapiElection(filter: { locale: { eq: $language } }) {
            nodes {
                id
                name
                policy_supports {
                    id
                    fullSupport
                    political_party {
                        name
                        shortName
                        color
                    }
                }
            }
        }
        socials: strapiSocial {
            discordLink
            facebookLink
            instagramLink
            twitterLink
            mastodonLink
            blueSkyLink
        }
        locales: allLocale(filter: { language: { eq: $language } }) {
            edges {
                node {
                    ns
                    data
                    language
                }
            }
        }
    }
`;

export default PoliciesPage;
