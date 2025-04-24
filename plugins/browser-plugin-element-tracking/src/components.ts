import type { Configuration } from './configuration';
import { getElementDetails } from './data';
import { ComponentsEntity, ElementDetailsEntity, Entities } from './schemata';
import { nodeIsElement } from './util';

/**
 * Generic callback for providing `component` entities for given Elements.
 * Auto discovers element and name from parameters and returns the list of components that encapsulate that element.
 * @param withDetails Whether details for each component should be included.
 * @param configurations List of configurations that contain component definitions.
 * @param params Arbitrary parameters that should include an element and optionally a logical name for that element.
 * @returns `component_parents` entity, or if `withDetails` specified, a list of entities containing `component_parents` and the details for each component as `element` entities.
 */
export const baseComponentGenerator = (
  withDetails: boolean,
  configurations: Configuration[],
  ...params: any[]
): ComponentsEntity | [ComponentsEntity, ...ElementDetailsEntity[]] | null => {
  const elementParams = params.filter((arg) => arg instanceof Node && nodeIsElement(arg));
  const elementName = params.find((arg) => typeof arg === 'string');

  if (!elementParams.length) return null;

  const components: string[] = [];
  const details: ElementDetailsEntity[] = [];

  elementParams.forEach((elem) => {
    configurations.forEach((config) => {
      if (!config.component) return;

      const ancestor = elem.closest(config.selector);
      if (ancestor !== null) {
        components.push(config.name);
        if (withDetails && config.details) {
          details.push(getElementDetails(config, ancestor));
        }
      }
    });
  });

  const entity: ComponentsEntity = {
    schema: Entities.COMPONENT_PARENTS,
    data: {
      element_name: elementName,
      component_list: components,
    },
  };

  return components.length ? (withDetails ? [entity, ...details] : entity) : null;
};
