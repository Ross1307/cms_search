// Just to enable IDE hints
const gql = (input: any) => input

const schema = gql`
  union Results = DatasetSearchResultType | CMSSearchResultType | DataSearchResultType

  interface SearchResult {
    totalCount: Int!
    results: [Results!]!
  }

  interface SearchResultType {
    count: Int!
    type: String
    label: String
  }

  input DataSearchInput {
    limit: Int
    from: Int
    types: [String!]
  }

  input CMSSearchInput {
    limit: Int
    from: Int
    types: [String!]
  }

  input DatasetSearchInput {
    from: Int
    limit: Int
    filters: [DatasetSearchFilter!]
  }

  input DatasetSearchFilter {
    type: String!
    multiSelect: Boolean!
    values: [String!]!
  }

  type DataSearchResult implements SearchResult {
    totalCount: Int!
    results: [DataSearchResultType!]!
    filters: [Filter!]
  }

  type DatasetSearchResult implements SearchResult {
    totalCount: Int!
    results: [DatasetSearchResultType!]!
  }

  type DatasetFiltersResult {
    filters: [Filter!]
  }

  type CMSSearchResult implements SearchResult {
    totalCount: Int!
    results: [CMSSearchResultType!]!
  }

  type Filter {
    type: String!
    label: String!
    options: [FilterOptions!]!
    filterType: String
  }

  type FilterOptions {
    id: String!
    label: String!
    enumType: String
    count: Int!
  }

  type CMSLink {
    uri: String!
  }

  type CMSSearchResultType {
    id: ID
    type: String!
    label: String
    slug: String
    teaserImage: String
    coverImage: String
    specialType: String
    file: String
    date: String
    body: String
    intro: String
    teaser: String
    dateLocale: String
    link: CMSLink
  }

  type DataSearchResultType implements SearchResultType {
    count: Int!
    type: String
    label: String
    results: [DataResult!]
  }

  type DataResult {
    id: ID
    type: String!
    label: String
    subtype: String
    datasetdataset: String
  }

  type DatasetSearchResultType {
    header: String!
    description: String!
    modified: String!
    tags: [String!]!
    id: String!
    formats: [DatasetFormats!]!
  }

  type DatasetFormats {
    name: String!
    count: Int!
  }

  type Query {
    articleSearch(q: String!, input: CMSSearchInput!): CMSSearchResult
    dataSearch(q: String!, input: DataSearchInput!): DataSearchResult
    datasetSearch(q: String!, input: DatasetSearchInput!): DatasetSearchResult
    publicationSearch(q: String!, input: CMSSearchInput!): CMSSearchResult
    specialSearch(q: String!, input: CMSSearchInput!): CMSSearchResult
    getDatasetFilters(q: String!): DatasetFiltersResult
  }
`

export default schema
