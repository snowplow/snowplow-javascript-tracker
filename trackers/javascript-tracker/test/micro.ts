import Docker from 'dockerode';
import { Writable } from 'stream';

export interface DockerWrapper {
  url: string;
  container: Docker.Container;
}

const docker = new Docker();

/**
 * Start the micro Docker container to accept events.
 * @param {boolean} [isRemote] For local runs, we use the local address, for remote, a custom host which has been set on the remote machine.
 * @return {*}
 */
export const start = (isRemote?: boolean) => {
  return docker
    .createContainer({
      Image: 'snowplow/snowplow-micro:2.0.0',
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Cmd: ['--collector-config', '/config/micro.conf', '--iglu', '/config/iglu.json'],
      OpenStdin: false,
      StdinOnce: false,
      HostConfig: {
        Binds: [`${process.cwd()}/test/micro-config:/config`],
        PortBindings: {
          '9090/tcp': [
            {
              HostIp: '',
              HostPort: '',
            },
          ],
        },
      },
      ExposedPorts: {
        '9090/tcp': {},
      },
    })
    .then((c) => {
      return c.start().then(() => {
        const outs = new Writable({
          write(chunk, _, callback) {
            let found = /(REST interface bound|http4s.+started at)/.test(chunk.toString());
            if (found) this.end();
            callback();
          },
        });

        c.attach({ stream: true, stdout: true, stderr: true }, (_, stream) => {
          stream?.pipe(process.stdout);
          stream?.pipe(outs);
        });

        return new Promise<DockerWrapper>((resolve) => {
          outs.on('finish', () =>
            c.inspect().then((info) => {
              resolve({
                container: c,
                url: `${isRemote ? 'snowplow-js-tracker.local' : '127.0.0.1'}:${
                  info.NetworkSettings.Ports['9090/tcp'][0].HostPort
                }`,
              });
            })
          );
        });
      });
    });
};

export const stop = (container: Docker.Container) => container.stop().then(() => container.remove());

export async function fetchResults() {
  const dockerUrl = (await browser.sharedStore.get('dockerInstanceUrl')) as string;
  if (!dockerUrl) {
    throw 'dockerInstanceUrl not set in shared store.';
  }
  return (await fetch(`http://${dockerUrl}/micro/good`)).json();
}
