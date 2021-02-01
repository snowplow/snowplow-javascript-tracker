import { Plugin } from '@snowplow/tracker-core';
import { EncryptedPayload } from './contexts';

declare global {
  interface Window {
    _hawk: {
      browserid: string;
    };
  }
}

const ParrablePlugin = (): Plugin => {
  const windowAlias = window;
  /**
   * Creates a context from the window['_hawk'] object
   *
   * @return object The Parrable context
   */
  function getParrableContext() {
    var parrable = windowAlias['_hawk'];
    if (parrable) {
      var context: EncryptedPayload = { encryptedId: '', optout: 'false' };
      context['encryptedId'] = parrable.browserid;
      var regex = new RegExp(
          '(?:^|;)\\s?' + '_parrable_hawk_optout'.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + '=(.*?)(?:;|$)',
          'i'
        ),
        match = document.cookie.match(regex);
      context['optout'] = match && decodeURIComponent(match[1]) ? 'true' : 'false';

      return [
        {
          schema: 'iglu:com.parrable/encrypted_payload/jsonschema/1-0-0',
          data: context,
        },
      ];
    }

    return [];
  }

  return {
    contexts: () => getParrableContext(),
  };
};

export { ParrablePlugin };
