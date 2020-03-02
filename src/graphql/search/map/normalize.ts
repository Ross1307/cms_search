import queryString, { ParsedUrlQueryInput } from 'querystring'
import { MAX_ZOOM, MIN_ZOOM, MapLayerType } from './config'
import { MapCollection, MapCollectionLayer, LegendItemMapLayer } from '../../../generated/graphql'

type InitialLegendItem = {
  params?: ParsedUrlQueryInput
} & LegendItemMapLayer

type InitialMapLayer = {
  minZoom: number
  maxZoom: number
  params: ParsedUrlQueryInput
  legendItems: Array<InitialLegendItem>
} & MapCollectionLayer

type InitialMapCollection = {
  mapLayers: Array<InitialMapLayer>
} & MapCollection

export function composeId(collectionId: string, id: string) {
  return `${collectionId}-${id}`
}

export function findMapLayer(mapLayers: Array<InitialMapLayer>, id: string) {
  return mapLayers.find(mapLayer => mapLayer.id === id) || null
}

export function normalizeLegendItems(
  collectionId: string,
  legendItems: Array<InitialLegendItem>,
  mapLayers: Array<InitialMapLayer>,
): Array<LegendItemMapLayer> {
  return legendItems.map(legendItem => {
    const {
      params: mapLayerParams,
      imageRule: mapLayerImageRule,
      title: mapLayerTitle,
      ...mapLayer
    } = findMapLayer(mapLayers, legendItem.id || '') || {}
    const notSelectable = legendItem.notSelectable || !legendItem.id // legendItems with an id are always selectable, unless defined otherwise
    const params = queryString.stringify(mapLayerParams || legendItem.params) // The field params is an object with unspecified content, it's stringefied here to make typing easier

    return {
      ...(mapLayer || legendItem), // If a matching mapLayer is found, this data should be used
      type: legendItem.type ? MapLayerType[legendItem.type] : null, // Get the legendItem type from constants
      imageRule: legendItem.imageRule || mapLayerImageRule, // imageRule can be overwritter per collection and mapLayer
      title: legendItem.title || mapLayerTitle, // title can be overwritter per collection and mapLayer
      // The ID of the mapLayer when defined as legendItem, is a combination of the IDs of the mapLayer and the collection it's used in to prevent duplication
      id: !notSelectable && legendItem.id ? composeId(collectionId, legendItem.id) : null, // Only selectable legendItems need an id
      notSelectable,
      noDetail: !legendItem.detailUrl,
      params,
    }
  })
}

export function normalizeMapLayers(mapLayers: Array<InitialMapLayer>): Array<MapCollectionLayer> {
  return mapLayers.map(mapLayer => {
    const { url, type, params } = mapLayer

    return {
      ...mapLayer,
      ...(type ? { type: MapLayerType[type] } : {}), // Get the mapLayer type from constants
      url: url || '', // Field is non-nullable
      params: queryString.stringify(params), // The field params is an object with unspecified content, it's stringefied here to make typing easier
    }
  })
}

export function composeMapCollections(
  mapCollections: Array<InitialMapCollection>,
  mapLayers: Array<InitialMapLayer>,
): Array<MapCollection> {
  return mapCollections.map(mapCollection => {
    // Normalize the mapLayers for this collection
    const collectionMapLayers = normalizeMapLayers(mapCollection.mapLayers)

    return {
      ...mapCollection,
      mapLayers: collectionMapLayers.map(({ id, title }) => {
        const {
          authScope = null,
          layers,
          legendItems = null,
          maxZoom = MAX_ZOOM,
          minZoom = MIN_ZOOM,
          detailUrl,
          iconUrl,
          imageRule,
          title: mapLayerTitle,
          url = '', // Field is non-nullable
          params,
        } = findMapLayer(mapLayers, id) || {}

        return {
          authScope,
          // The ID of the mapLayer, is a combination of the IDs of the mapLayer and the collection it's used in to prevent duplication
          id: composeId(mapCollection.id, id),
          layers,
          maxZoom,
          minZoom,
          noDetail: !detailUrl,
          iconUrl,
          imageRule: imageRule || mapLayerTitle,
          title: title || mapLayerTitle,
          url,
          params: params ? queryString.stringify(params) : '', // Field is non-nullable,
          legendItems: legendItems
            ? normalizeLegendItems(mapCollection.id, legendItems, mapLayers)
            : [],
        }
      }),
    }
  })
}