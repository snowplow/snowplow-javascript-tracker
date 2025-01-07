import { SelfDescribingJson } from '@snowplow/tracker-core';

import type { AttributeList } from './types';

export enum Events {
  ELEMENT_CREATE = 'iglu:com.snowplowanalytics.snowplow/create_element/jsonschema/1-0-0',
  ELEMENT_DESTROY = 'iglu:com.snowplowanalytics.snowplow/destroy_element/jsonschema/1-0-0',
  ELEMENT_EXPOSE = 'iglu:com.snowplowanalytics.snowplow/expose_element/jsonschema/1-0-0',
  ELEMENT_OBSCURE = 'iglu:com.snowplowanalytics.snowplow/obscure_element/jsonschema/1-0-0',
}

export enum Entities {
  ELEMENT_DETAILS = 'iglu:com.snowplowanalytics.snowplow/element/jsonschema/1-0-0',
  ELEMENT_CONTENT = 'iglu:com.snowplowanalytics.snowplow/element_content/jsonschema/1-0-0',
  ELEMENT_STATISTICS = 'iglu:com.snowplowanalytics.snowplow/element_statistics/jsonschema/1-0-0',
  COMPONENT_PARENTS = 'iglu:com.snowplowanalytics.snowplow/component_parents/jsonschema/1-0-0',
}

export type SDJ<S extends Entities | Events, D = Record<string, unknown>> = SelfDescribingJson<D> & {
  schema: S;
};

export type Event<S extends Events = Events, D = Record<string, unknown>> = SDJ<S, D>;
export type Entity<S extends Entities = Entities, D = Record<string, unknown>> = SDJ<S, D>;

export type ElementCreateEvent = SDJ<
  Events.ELEMENT_CREATE,
  {
    element_name: string;
  }
>;

export type ElementDestroyEvent = SDJ<
  Events.ELEMENT_DESTROY,
  {
    element_name: string;
  }
>;

export type ElementExposeEvent = SDJ<
  Events.ELEMENT_EXPOSE,
  {
    element_name: string;
  }
>;

export type ElementObscureEvent = SDJ<
  Events.ELEMENT_OBSCURE,
  {
    element_name: string;
  }
>;

export type ElementContentEntity = SDJ<
  Entities.ELEMENT_CONTENT,
  {
    parent_name: string;
    parent_index: number;
    element_name: string;
    element_index: number;
    attributes?: AttributeList;
  }
>;

export type ElementDetailsEntity = SDJ<
  Entities.ELEMENT_DETAILS,
  {
    element_name: string;
    height: number;
    width: number;
    position_x: number;
    position_y: number;
    doc_position_x: number;
    doc_position_y: number;
    element_index?: number;
    element_matches?: number;
    originating_page_view: string;
    attributes?: AttributeList;
  }
>;

export type ComponentsEntity = SDJ<
  Entities.COMPONENT_PARENTS,
  {
    element_name?: string;
    component_list: string[];
  }
>;

export type ElementStatisticsEntity = SDJ<
  Entities.ELEMENT_STATISTICS,
  {
    element_name: string;
    element_index: number;
    element_matches: number;
    current_state: string;
    min_size: string;
    current_size: string;
    max_size: string;
    y_depth_ratio: number | null;
    max_y_depth_ratio: number | null;
    max_y_depth: string;
    element_age_ms: number;
    times_in_view: number;
    total_time_visible_ms: number;
  }
>;
