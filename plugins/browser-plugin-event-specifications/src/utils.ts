import { EVENT_SPECIFICATION_SCHEMA } from './schemata';

export function createEventSpecificationContext(eventSpecificationId: string) {
  return {
    schema: EVENT_SPECIFICATION_SCHEMA,
    data: {
      id: eventSpecificationId,
    },
  };
}
