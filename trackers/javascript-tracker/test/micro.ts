/*
 * Copyright (c) 2022 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import http from 'http';
import Docker from 'dockerode';
import { Writable } from 'stream';

export interface DockerWrapper {
  url: string;
  container: Docker.Container;
}

const docker = new Docker();

export const start = () => {
  return docker
    .createContainer({
      Image: 'snowplow/snowplow-micro:1.1.2',
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
            let found = chunk.toString().includes('REST interface bound');
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
                url: `snowplow-js-tracker.local:${info.NetworkSettings.Ports['9090/tcp'][0].HostPort}`,
              });
            })
          );
        });
      });
    });
};

export const stop = (container: Docker.Container) => container.stop().then(() => container.remove());

const createMicroCall = (url: string) => () =>
  new Promise((resolve, reject) => {
    const req = http.request(url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(body);
      });
    });
    req.on('error', reject);
    req.end();
  });

export const fetchResults = (containerUrl: string) =>
  createMicroCall(`http://${containerUrl}/micro/good`)().then((good: unknown) => JSON.parse(good as string));

export const clearCache = (containerUrl: string) =>
  createMicroCall(`http://${containerUrl}/micro/reset`)().then((_: unknown) => true);
