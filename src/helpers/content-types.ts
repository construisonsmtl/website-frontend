import { ImageDataLike } from "gatsby-plugin-image";

export type Nodes<N> = {
    nodes: N[];
};

export type StrapiImage = {
    alternativeText: string;
    localFile: ImageDataLike & { url?: string };
};

export type SVGImage = {
    localFile: {
        publicURL: string;
    };
};

export type RichTextContent<C extends string> = {
    data: {
        childMarkdownRemark: {
            html: string;
        };
    } & { [key in C]: string };
};

export type KeyPoint = {
    title: string;
    color: string;
    icon: SVGImage;
    content: {
        data: { content: string };
    };
};

export type SocialLinks = {
    discordLink: string;
    facebookLink: string;
    instagramLink: string;
    twitterLink: string;
    mastodonLink: string;
    blueSkyLink: string;
};

export type EventCardData = {
    title: string;
    slug: string;
    description: RichTextContent<"description">;
    scheduledDate: string;
    thumbnail: StrapiImage;
    publishedAt: string;
};

export type EventData = {
    title: string;
    slug: string;
    description: RichTextContent<"description">;
    scheduledDate: string;
    rsvpLink: string;
    inPerson: boolean;
    locationLink: string;
    thumbnail: StrapiImage;
};

export type ActionCardData = {
    title: string;
    slug: string;
    description: RichTextContent<"description">;
    publishedAt: string;
    thumbnail: StrapiImage;
};

export type PostCardData = {
    title: string;
    slug: string;
    excerpt: string;
    postCategories: { title: string }[];
    publishedAt: string;
    thumbnail: StrapiImage;
};

export type PolicyCategoryData = {
    name: string;
    description: string;
    policies?: PolicyData[];
};

export type ElectionData = {
    name: string;
    policies?: PolicyData[];
};

export type CityPolicyQuestion = {
    question: string;
    displayForMontreal: boolean;
    displayOutsideMontreal: boolean;
    answers: {
        city: string;
        politicalParty: string;
        answer: RichTextContent<"answer">;
    }[]
}

export enum PolicyGrade {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold",
}

export type PolicyLink = {
    title_en: string;
    title_fr: string;
    url: string;
};

export type PolicyData = {
    title: string;
    explanation: string;
    justification: string;
    policy_supports: PolicySupportData[];
    policy_category?: PolicyCategoryData;
    grade: PolicyGrade;
    identifier?: string | null;
    isMunicipal?: boolean | null;
    isProvincial?: boolean | null;
    isFederal?: boolean | null;
    isVisible?: boolean | null;
    links?: { strapi_json_value: PolicyLink[] } | null;
};

export enum PoliticalPartyJurisdiction {
    FEDERAL = "federal",
    PROVINCIAL = "provincial",
    MUNICIPAL = "municipal",
}

export type PoliticalPartyData = {
    name: string;
    shortName: string;
    color: string;
    jurisdiction: PoliticalPartyJurisdiction;
    policy_supports?: PolicySupportData[];
};

export type PolicySupportData = {
    quote: string;
    source: string;
    author: string;
    political_party?: PoliticalPartyData;
    policy?: PolicyData;
    election?: ElectionData;
    fullSupport: boolean;
};
