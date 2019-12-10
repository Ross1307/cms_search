import { Client } from '@elastic/elasticsearch'
import { SearchResponse } from 'elasticsearch'
import cmsSchema, { ElasticSearchArgs } from './es.schema'
import config from '../config'
import logPerf from '../graphql/resolvers/utils/logPerf'

const client = new Client({
  node: `http://${process.env.ELASTIC_HOST}:9200`,
})

export function ElasticSearchClient(body: object) {
  // perform the actual search passing in the index, the search query and the type
  return client.search({ index: config.es.cms.index, body: body })
}

export async function getCmsFromElasticSearch({ q, limit, from, types }: ElasticSearchArgs) {
  const { defaultSize, defaultTypes } = config.es.cms

  limit = limit || defaultSize
  types = types || defaultTypes
  from = from || 0

  const results: SearchResponse<any> = (await logPerf(
    `cms`,
    `http://${process.env.ELASTIC_HOST}:9200`,
    ElasticSearchClient(cmsSchema({ q, limit, from, types })),
  )) as SearchResponse<any>
  const countResults: any = Object.entries(results.aggregations).reduce((acc, [key, value]) => {
    // @ts-ignore
    const { buckets } = value
    return {
      ...acc,
      [key]: buckets.map(({ doc_count, key }: any) => ({
        key,
        count: doc_count,
      })),
    }
  }, {})

  const totalCount = countResults.count_by_type.reduce(
    (acc: number, { count }: any) => acc + count,
    0,
  )
  const themeCount = countResults.count_by_theme
  const typeCount = countResults.count_by_type

  return {
    results: results.hits.hits,
    totalCount,
    themeCount,
    typeCount,
  }
}

/**
 * Quick fix for now: values from ES are Arrays with one entry, which is the only thing we need.
 * @param object
 */
export const getValuesFromES = (object: object): object =>
  Object.entries(object).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value && value.length ? value[0] : value,
    }),
    {},
  )
